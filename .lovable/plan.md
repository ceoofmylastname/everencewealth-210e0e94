

# Salestrail Webhook Edge Function

## Overview

Create an edge function that receives POST webhooks from Salestrail's call tracking system, matches calls to CRM agents and leads, and automatically logs activity data.

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SALESTRAIL WEBHOOK FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Salestrail App                                                             │
│       │                                                                     │
│       ▼                                                                     │
│  POST /functions/v1/salestrail-webhook                                      │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STEP 1: Validate Payload                                           │   │
│  │  - Check required fields (call_id, agent_email/phone)               │   │
│  │  - Log full payload for debugging                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STEP 2: Match Agent (REQUIRED)                                     │   │
│  │  - Query crm_agents by email OR phone                               │   │
│  │  - If no match: return success=false (200 OK - no retries)          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STEP 3: Match Lead (BEST EFFORT)                                   │   │
│  │  - Normalize phone: extract last 9 digits                           │   │
│  │  - Query crm_leads assigned to this agent                           │   │
│  │  - If no match: continue with lead_id = null                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STEP 4: Insert Activity                                            │   │
│  │  - Create crm_activities record                                     │   │
│  │  - Handle duplicate call_id (idempotency)                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STEP 5: Update SLA (if lead matched)                               │   │
│  │  - If first_contact_at is null, update it                           │   │
│  │  - Set first_action_completed = true                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STEP 6: Create Notification (if lead matched)                      │   │
│  │  - Insert crm_notifications record                                  │   │
│  │  - Type: 'call_logged'                                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│       │                                                                     │
│       ▼                                                                     │
│  Return 200 OK (always, even on errors - prevents Salestrail retries)      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Expected Webhook Payload

```json
{
  "call_id": "st-12345",
  "phone_number": "+34612345678",
  "direction": "outbound",
  "duration": 180,
  "answered": true,
  "started_at": "2026-02-03T10:00:00Z",
  "ended_at": "2026-02-03T10:03:00Z",
  "recording_url": "https://salestrail.io/recordings/12345",
  "agent_email": "agent@delsolprimehomes.com",
  "agent_phone": "+34600000001"
}
```

---

## Implementation Details

### Phone Number Normalization

The function will handle various phone formats:
- `+34612345678` → `612345678` (last 9 digits)
- `0034612345678` → `612345678`
- `612 345 678` → `612345678`

This allows flexible matching against `crm_leads.phone_number` and `crm_leads.full_phone`.

### Agent Matching Logic

```sql
-- Match by email OR phone (crm_agents.phone column)
SELECT * FROM crm_agents 
WHERE email = 'agent@delsolprimehomes.com' 
   OR phone = '+34600000001'
LIMIT 1
```

### Lead Matching Logic

```sql
-- Match by phone, only for leads assigned to this agent
SELECT * FROM crm_leads 
WHERE assigned_agent_id = 'agent-uuid'
  AND (
    phone_number ILIKE '%612345678%' 
    OR full_phone ILIKE '%+34612345678%'
  )
ORDER BY created_at DESC
LIMIT 1
```

### Activity Field Mappings

| Webhook Field | Activity Field | Transformation |
|---------------|----------------|----------------|
| call_id | salestrail_call_id | Direct |
| phone_number | - | Used for lead matching only |
| direction | call_direction | Direct ('inbound'/'outbound') |
| duration | call_duration | Direct (seconds) |
| answered | call_answered | Direct (boolean) |
| answered | outcome | `answered ? 'answered' : 'no_answer'` |
| started_at | created_at | Direct (ISO timestamp) |
| recording_url | salestrail_recording_url | Direct |
| - | salestrail_metadata | Entire payload as JSONB |
| - | activity_type | Always 'call' |
| - | notes | Auto-generated description |

### Idempotency Handling

The `salestrail_call_id` column has a UNIQUE constraint. If a duplicate webhook arrives:

1. Insert will fail with unique violation error
2. Catch the specific error code
3. Log as "already processed"
4. Return 200 OK with `success: true, duplicate: true`

---

## Error Handling Strategy

| Scenario | Response Code | Response Body | Reason |
|----------|---------------|---------------|--------|
| Success | 200 | `{success: true, activity_id: "..."}` | Normal |
| Agent not found | 200 | `{success: false, message: "Agent not matched"}` | Prevent retries |
| Lead not found | 200 | `{success: true, lead_matched: false}` | Still log call |
| Duplicate call | 200 | `{success: true, duplicate: true}` | Already processed |
| Database error | 200 | `{success: false, error: "..."}` | Prevent retry storms |
| Invalid payload | 200 | `{success: false, error: "Missing required fields"}` | Prevent retries |

**Key Principle**: Always return 200 OK to prevent Salestrail from retrying failed webhooks repeatedly.

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/salestrail-webhook/index.ts` | Create - Main webhook handler |
| `supabase/config.toml` | Modify - Add function registration |

---

## Technical Implementation

### Edge Function Structure

```typescript
// supabase/functions/salestrail-webhook/index.ts

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Phone normalization utility
function normalizePhone(phone: string): { normalized: string; last9: string } {
  const normalized = phone.replace(/[^0-9+]/g, '');
  const digitsOnly = normalized.replace(/[^0-9]/g, '');
  const last9 = digitsOnly.slice(-9);
  return { normalized, last9 };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase with service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Parse webhook payload
    const payload = await req.json();
    console.log("[salestrail-webhook] Received:", JSON.stringify(payload, null, 2));

    // Extract fields
    const {
      call_id,
      phone_number,
      direction,
      duration,
      answered,
      started_at,
      ended_at,
      recording_url,
      agent_email,
      agent_phone
    } = payload;

    // Validate required fields
    if (!call_id) {
      console.warn("[salestrail-webhook] Missing call_id");
      return new Response(
        JSON.stringify({ success: false, error: "Missing call_id" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!agent_email && !agent_phone) {
      console.warn("[salestrail-webhook] Missing agent identifier");
      return new Response(
        JSON.stringify({ success: false, error: "Missing agent_email or agent_phone" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // STEP 1: Match Agent
    let agentQuery = supabase.from("crm_agents").select("*");
    
    if (agent_email && agent_phone) {
      agentQuery = agentQuery.or(`email.eq.${agent_email},phone.eq.${agent_phone}`);
    } else if (agent_email) {
      agentQuery = agentQuery.eq("email", agent_email);
    } else {
      agentQuery = agentQuery.eq("phone", agent_phone);
    }

    const { data: agent, error: agentError } = await agentQuery.maybeSingle();

    if (agentError) {
      console.error("[salestrail-webhook] Agent query error:", agentError);
    }

    if (!agent) {
      console.warn("[salestrail-webhook] Agent not matched. Email:", agent_email, "Phone:", agent_phone);
      return new Response(
        JSON.stringify({ success: false, message: "Agent not matched" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[salestrail-webhook] Matched agent: ${agent.first_name} ${agent.last_name} (${agent.id})`);

    // STEP 2: Match Lead (best effort)
    let lead = null;
    if (phone_number) {
      const { normalized, last9 } = normalizePhone(phone_number);
      
      const { data: matchedLead, error: leadError } = await supabase
        .from("crm_leads")
        .select("*")
        .eq("assigned_agent_id", agent.id)
        .or(`phone_number.ilike.%${last9}%,full_phone.ilike.%${normalized}%`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (leadError) {
        console.error("[salestrail-webhook] Lead query error:", leadError);
      }

      lead = matchedLead;
      
      if (lead) {
        console.log(`[salestrail-webhook] Matched lead: ${lead.first_name} ${lead.last_name} (${lead.id})`);
      } else {
        console.warn("[salestrail-webhook] No matching lead found for phone:", phone_number);
      }
    }

    // STEP 3: Insert Activity
    const activityData = {
      lead_id: lead?.id || null,
      agent_id: agent.id,
      activity_type: "call",
      outcome: answered ? "answered" : "no_answer",
      call_duration: duration || 0,
      notes: `Salestrail auto-logged call - ${direction || "unknown"} - ${answered ? "Answered" : "No Answer"}${duration ? ` - ${Math.floor(duration / 60)}m ${duration % 60}s` : ""}`,
      salestrail_call_id: call_id,
      salestrail_recording_url: recording_url || null,
      call_direction: direction || null,
      call_answered: answered ?? null,
      salestrail_metadata: payload,
      created_at: started_at || new Date().toISOString(),
    };

    const { data: activity, error: activityError } = await supabase
      .from("crm_activities")
      .insert(activityData)
      .select()
      .single();

    if (activityError) {
      // Check for duplicate (unique constraint violation)
      if (activityError.code === "23505") {
        console.log("[salestrail-webhook] Duplicate call already logged:", call_id);
        return new Response(
          JSON.stringify({ success: true, duplicate: true, message: "Call already logged" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.error("[salestrail-webhook] Activity insert error:", activityError);
      return new Response(
        JSON.stringify({ success: false, error: activityError.message }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[salestrail-webhook] Activity created: ${activity.id}`);

    // STEP 4: Update SLA (if lead matched and no prior first contact)
    if (lead && !lead.first_contact_at) {
      const { error: slaError } = await supabase
        .from("crm_leads")
        .update({
          first_contact_at: started_at || new Date().toISOString(),
          first_action_completed: true,
          last_contact_at: started_at || new Date().toISOString(),
        })
        .eq("id", lead.id);

      if (slaError) {
        console.error("[salestrail-webhook] SLA update error:", slaError);
      } else {
        console.log(`[salestrail-webhook] SLA completed for lead ${lead.id}`);
      }
    }

    // STEP 5: Create Notification (if lead matched)
    if (lead) {
      const minutes = Math.floor((duration || 0) / 60);
      const seconds = (duration || 0) % 60;
      const durationStr = duration ? `${minutes}m ${seconds}s` : "";

      await supabase.from("crm_notifications").insert({
        agent_id: agent.id,
        lead_id: lead.id,
        notification_type: "call_logged",
        title: "📞 Call Automatically Logged",
        message: `Your ${durationStr} ${direction || ""} call with ${lead.first_name} ${lead.last_name} was recorded`,
        action_url: `/crm/agent/leads/${lead.id}`,
        read: false,
      });

      console.log(`[salestrail-webhook] Notification created for agent ${agent.id}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        activity_id: activity.id,
        lead_matched: !!lead,
        agent_matched: true,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[salestrail-webhook] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

### Config Registration

```toml
[functions.salestrail-webhook]
verify_jwt = false
```

---

## Testing

### Test Command

After deployment, test with:

```bash
curl -X POST https://kazggnufaoicopvmwhdl.supabase.co/functions/v1/salestrail-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "call_id": "test-'$(date +%s)'",
    "phone_number": "+34612345678",
    "direction": "outbound",
    "duration": 120,
    "answered": true,
    "started_at": "2026-02-03T10:00:00Z",
    "ended_at": "2026-02-03T10:02:00Z",
    "recording_url": "https://example.com/recording.mp3",
    "agent_email": "john@delsolprimehomes.com"
  }'
```

### Expected Response

```json
{
  "success": true,
  "activity_id": "uuid-of-created-activity",
  "lead_matched": true,
  "agent_matched": true
}
```

---

## Verification Checklist

After implementation:
1. Deploy edge function
2. Test with known agent email
3. Verify activity appears in timeline
4. Confirm SLA gets marked complete
5. Check notification appears in bell
6. Test duplicate call handling
7. Test unmatched agent scenario

