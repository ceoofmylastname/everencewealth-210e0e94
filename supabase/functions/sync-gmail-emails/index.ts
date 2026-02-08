import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface GmailMessage {
  id: string
  threadId: string
  payload: {
    headers: Array<{ name: string; value: string }>
    body: { data?: string }
    parts?: Array<{ mimeType: string; body: { data?: string } }>
  }
  internalDate: string
}

// Decode Gmail's URL-safe base64 encoding
function decodeBase64Url(data: string): string {
  try {
    // Replace URL-safe chars with standard base64 chars
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/')
    // Decode base64 to bytes, then to UTF-8 string
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
    return new TextDecoder('utf-8').decode(bytes)
  } catch (error) {
    console.error('Error decoding base64:', error)
    return ''
  }
}

// Refresh Gmail access token using refresh token
async function refreshGmailToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<string | null> {
  try {
    console.log('Attempting to refresh Gmail token...')
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Token refresh failed:', errorText)
      return null
    }

    const { access_token } = await response.json()
    console.log('Token refreshed successfully')
    return access_token
  } catch (error) {
    console.error('Error refreshing token:', error)
    return null
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  console.log('Starting Gmail sync...')

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID')
    const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    if (!googleClientId || !googleClientSecret) {
      throw new Error('Missing Google OAuth credentials')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get all agents with Gmail OAuth tokens
    const { data: agents, error: agentsError } = await supabase
      .from('crm_agents')
      .select('id, email, gmail_access_token, gmail_refresh_token, last_gmail_sync')
      .not('gmail_access_token', 'is', null)

    if (agentsError) {
      console.error('Error fetching agents:', agentsError)
      throw agentsError
    }

    console.log(`Found ${agents?.length || 0} agents with Gmail tokens`)

    if (!agents || agents.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          agents_synced: 0,
          emails_synced: 0,
          message: 'No agents with Gmail tokens found'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let totalSynced = 0
    const agentResults: Array<{ email: string; synced: number; error?: string }> = []

    // Sync emails for each agent
    for (const agent of agents) {
      console.log(`Syncing emails for agent: ${agent.email}`)
      let agentSynced = 0

      try {
        // Calculate query time range (last sync or last 7 days)
        const afterDate = agent.last_gmail_sync 
          ? new Date(agent.last_gmail_sync).getTime() / 1000
          : (Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000

        const query = `after:${Math.floor(afterDate)}`
        console.log(`Gmail query: ${query}`)

        let accessToken = agent.gmail_access_token

        // Fetch messages list
        let listResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=50`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        )

        // Handle token refresh if needed
        if (listResponse.status === 401 && agent.gmail_refresh_token) {
          console.log('Token expired, refreshing...')
          const newToken = await refreshGmailToken(
            agent.gmail_refresh_token,
            googleClientId,
            googleClientSecret
          )

          if (newToken) {
            accessToken = newToken
            // Update token in database
            await supabase
              .from('crm_agents')
              .update({ gmail_access_token: newToken })
              .eq('id', agent.id)

            // Retry request with new token
            listResponse = await fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=50`,
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            )
          } else {
            agentResults.push({ email: agent.email, synced: 0, error: 'Token refresh failed' })
            continue
          }
        }

        if (!listResponse.ok) {
          const errorText = await listResponse.text()
          console.error(`Gmail API error for ${agent.email}:`, errorText)
          agentResults.push({ email: agent.email, synced: 0, error: `Gmail API error: ${listResponse.status}` })
          continue
        }

        const listData = await listResponse.json()
        const messages = listData.messages || []
        console.log(`Found ${messages.length} messages for ${agent.email}`)

        if (messages.length === 0) {
          agentResults.push({ email: agent.email, synced: 0 })
          continue
        }

        // Process each message
        for (const message of messages) {
          try {
            // Fetch full message details
            const msgResponse = await fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=full`,
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            )

            if (!msgResponse.ok) {
              console.error(`Error fetching message ${message.id}`)
              continue
            }

            const fullMessage: GmailMessage = await msgResponse.json()

            // Parse headers
            const headers = fullMessage.payload.headers
            const fromHeader = headers.find(h => h.name.toLowerCase() === 'from')?.value || ''
            const toHeader = headers.find(h => h.name.toLowerCase() === 'to')?.value || ''
            const subjectHeader = headers.find(h => h.name.toLowerCase() === 'subject')?.value || ''
            const messageIdHeader = headers.find(h => h.name.toLowerCase() === 'message-id')?.value || ''

            // Determine direction based on sender domain
            const delsolDomain = '@delsolprimehomes.com'
            const isOutgoing = fromHeader.toLowerCase().includes(delsolDomain)
            const direction = isOutgoing ? 'outgoing' : 'incoming'

            // Extract email address from header
            const extractEmail = (header: string): string | null => {
              const match = header.toLowerCase().match(/([^\s<]+@[^\s>]+)/i)
              return match ? match[1] : null
            }

            // Find matching lead
            const leadEmail = isOutgoing ? extractEmail(toHeader) : extractEmail(fromHeader)
            let leadId = null

            if (leadEmail) {
              const { data: lead } = await supabase
                .from('crm_leads')
                .select('id')
                .eq('email', leadEmail)
                .single()
              
              if (lead) {
                leadId = lead.id
              }
            }

            // Extract body content
            let bodyText = ''
            let bodyHtml = ''

            if (fullMessage.payload.body?.data) {
              bodyText = decodeBase64Url(fullMessage.payload.body.data)
            } else if (fullMessage.payload.parts) {
              for (const part of fullMessage.payload.parts) {
                if (part.mimeType === 'text/plain' && part.body?.data) {
                  bodyText = decodeBase64Url(part.body.data)
                }
                if (part.mimeType === 'text/html' && part.body?.data) {
                  bodyHtml = decodeBase64Url(part.body.data)
                }
              }
            }

            const receivedAt = new Date(parseInt(fullMessage.internalDate)).toISOString()

            // Check for duplicates
            const { data: existing } = await supabase
              .from('email_tracking')
              .select('id')
              .eq('agent_id', agent.id)
              .eq('subject', subjectHeader)
              .eq('received_at', receivedAt)
              .single()

            if (existing) {
              console.log(`Skipping duplicate email: ${subjectHeader}`)
              continue
            }

            // Insert email record
            const { error: insertError } = await supabase
              .from('email_tracking')
              .insert({
                lead_id: leadId,
                agent_id: agent.id,
                agent_email: agent.email,
                direction,
                from_email: fromHeader,
                to_email: toHeader,
                subject: subjectHeader,
                body_text: bodyText,
                body_html: bodyHtml,
                received_at: receivedAt,
              })

            if (insertError) {
              console.error('Error inserting email:', insertError)
            } else {
              agentSynced++
              totalSynced++
            }

          } catch (messageError) {
            console.error(`Error processing message ${message.id}:`, messageError)
          }
        }

        // Update last sync timestamp
        await supabase
          .from('crm_agents')
          .update({ last_gmail_sync: new Date().toISOString() })
          .eq('id', agent.id)

        agentResults.push({ email: agent.email, synced: agentSynced })

      } catch (agentError) {
        console.error(`Error syncing agent ${agent.email}:`, agentError)
        agentResults.push({ 
          email: agent.email, 
          synced: 0, 
          error: agentError instanceof Error ? agentError.message : 'Unknown error' 
        })
      }
    }

    console.log(`Gmail sync complete. Total emails synced: ${totalSynced}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        agents_synced: agents.length,
        emails_synced: totalSynced,
        details: agentResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Gmail sync error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
