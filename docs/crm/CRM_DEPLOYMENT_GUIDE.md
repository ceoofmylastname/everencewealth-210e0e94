# Del Sol Prime Homes CRM - Production Deployment Guide

## Overview

This guide covers the complete deployment process for the Del Sol Prime Homes CRM system on Lovable Cloud (Supabase backend).

---

## 1. Pre-Deployment Checklist

### 1.1 Code Readiness

- [ ] All CRM features implemented and tested
- [ ] No console errors in development
- [ ] TypeScript compilation successful
- [ ] All linting warnings addressed
- [ ] Code reviewed for security issues

### 1.2 Database Readiness

- [ ] All migrations applied successfully
- [ ] RLS policies tested and verified
- [ ] Database functions working correctly
- [ ] Triggers functioning properly
- [ ] Indexes created for performance

### 1.3 Edge Functions

- [ ] All edge functions tested locally
- [ ] Environment variables identified
- [ ] Error handling implemented
- [ ] Logging configured

---

## 2. Environment Configuration

### 2.1 Current Secrets (Already Configured)

| Secret | Purpose | Status |
|--------|---------|--------|
| RESEND_API_KEY | Email notifications | ✅ Configured |
| OPENAI_API_KEY | AI features | ✅ Configured |
| GEMINI_API_KEY | AI features | ✅ Configured |
| INDEXNOW_API_KEY | SEO indexing | ✅ Configured |

### 2.2 Additional Secrets Needed

| Secret | Purpose | Required |
|--------|---------|----------|
| SLACK_BOT_TOKEN | Slack notifications | Optional |
| SLACK_ADMIN_CHANNEL | Admin channel ID | Optional |

### 2.3 Frontend Environment Variables

These are automatically configured by Lovable Cloud:

```env
VITE_SUPABASE_URL=https://kazggnufaoicopvmwhdl.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[auto-configured]
VITE_SUPABASE_PROJECT_ID=kazggnufaoicopvmwhdl
```

---

## 3. Database Setup

### 3.1 Verify Tables

Run these queries to verify all CRM tables exist:

```sql
-- Check CRM tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'crm_%';
```

Expected tables:
- crm_agents
- crm_leads
- crm_activities
- crm_reminders
- crm_lead_notes
- crm_notifications

### 3.2 Verify RLS Enabled

```sql
-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'crm_%';
```

All tables should show `rowsecurity = true`.

### 3.3 Performance Indexes

Ensure these indexes exist for optimal performance:

```sql
-- Lead indexes
CREATE INDEX IF NOT EXISTS idx_crm_leads_language 
ON crm_leads(language);

CREATE INDEX IF NOT EXISTS idx_crm_leads_status 
ON crm_leads(lead_status);

CREATE INDEX IF NOT EXISTS idx_crm_leads_claimed 
ON crm_leads(lead_claimed, assigned_agent_id);

CREATE INDEX IF NOT EXISTS idx_crm_leads_agent 
ON crm_leads(assigned_agent_id);

CREATE INDEX IF NOT EXISTS idx_crm_leads_created 
ON crm_leads(created_at DESC);

-- Activity indexes
CREATE INDEX IF NOT EXISTS idx_crm_activities_lead 
ON crm_activities(lead_id);

CREATE INDEX IF NOT EXISTS idx_crm_activities_agent 
ON crm_activities(agent_id);

CREATE INDEX IF NOT EXISTS idx_crm_activities_created 
ON crm_activities(created_at DESC);

-- Reminder indexes
CREATE INDEX IF NOT EXISTS idx_crm_reminders_datetime 
ON crm_reminders(reminder_datetime);

CREATE INDEX IF NOT EXISTS idx_crm_reminders_agent 
ON crm_reminders(agent_id);

CREATE INDEX IF NOT EXISTS idx_crm_reminders_pending 
ON crm_reminders(agent_id, is_completed, reminder_datetime);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_crm_notifications_agent 
ON crm_notifications(agent_id, read);

CREATE INDEX IF NOT EXISTS idx_crm_notifications_created 
ON crm_notifications(created_at DESC);
```

### 3.4 Verify Database Functions

```sql
-- List CRM-related functions
SELECT proname, proargtypes 
FROM pg_proc 
WHERE proname LIKE '%lead%' OR proname LIKE '%crm%';
```

Expected functions:
- claim_lead
- notify_lead_claimed
- is_crm_agent
- can_access_lead

---

## 4. Edge Functions Deployment

### 4.1 CRM Edge Functions

The following edge functions are used by the CRM:

| Function | Purpose | Secrets Needed |
|----------|---------|----------------|
| register-crm-lead | Webhook for new leads | RESEND_API_KEY |
| claim-lead | Lead claiming with race protection | None |
| send-lead-notification | Email notifications | RESEND_API_KEY |
| create-crm-agent | Create new agent accounts | None |
| delete-crm-agent | Deactivate agent accounts | None |
| health-check | System health monitoring | None |

### 4.2 Deployment Process

Edge functions are automatically deployed when code is pushed. To manually trigger:

1. Make any change to the function code
2. Save the file
3. Lovable will auto-deploy

### 4.3 Verify Deployment

Test each function via the curl commands in the testing checklist or use the Lovable Cloud backend panel.

---

## 5. Agent Account Setup

### 5.1 Create Admin Account

The first agent should be an admin:

1. Use the create-crm-agent edge function
2. Set role = "admin"
3. Verify login works
4. Confirm access to /crm/admin routes

### 5.2 Create Agent Accounts

For each agent:

```json
{
  "email": "agent@delsolprimehomes.com",
  "password": "SecurePassword123!",
  "first_name": "Agent",
  "last_name": "Name",
  "phone": "+34600123456",
  "role": "agent",
  "languages": ["en", "es"],
  "max_active_leads": 50,
  "email_notifications": true,
  "timezone": "Europe/Madrid"
}
```

### 5.3 Agent Configuration

| Field | Description | Default |
|-------|-------------|---------|
| languages | Languages agent speaks (array) | Required |
| max_active_leads | Maximum concurrent leads | 50 |
| email_notifications | Receive email alerts | true |
| accepts_new_leads | Available for new leads | true |
| slack_channel_id | Slack DM channel (optional) | null |

---

## 6. Webhook Configuration

### 6.1 Emma Chatbot Integration

Configure Emma to send leads to:

```
POST https://kazggnufaoicopvmwhdl.supabase.co/functions/v1/register-crm-lead
```

Required headers:
```
Content-Type: application/json
```

Payload format:
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "language": "en|fr|fi|pl|nl|de|es|sv|da|hu",
  "source": "emma_chatbot",
  "sourceDetail": "bofu_article",
  "pageUrl": "string",
  "pageTitle": "string",
  "budget": "string",
  "timeframe": "string",
  "buyerType": "string",
  "locationPreferences": ["string"],
  "propertyPreferences": ["string"],
  "qaPairs": [{"q": "string", "a": "string"}],
  "conversationDuration": "number",
  "questionsAnswered": "number",
  "intakeComplete": "boolean"
}
```

### 6.2 Landing Form Integration

Configure contact forms to send to same endpoint with:

```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "language": "en",
  "source": "landing_form",
  "sourceDetail": "contact_page",
  "pageUrl": "string",
  "message": "string"
}
```

---

## 7. Domain & SSL

### 7.1 Production URLs

| URL | Purpose |
|-----|---------|
| https://blog-knowledge-vault.lovable.app | Main application |
| https://blog-knowledge-vault.lovable.app/crm/agent/dashboard | Agent dashboard |
| https://blog-knowledge-vault.lovable.app/crm/admin/dashboard | Admin dashboard |

### 7.2 Custom Domain (Optional)

If using a custom domain like `crm.delsolprimehomes.com`:

1. Go to Lovable project settings
2. Add custom domain
3. Configure DNS records as instructed
4. Wait for SSL provisioning

---

## 8. Monitoring Setup

### 8.1 Health Check Endpoint

The health-check function provides system status:

```bash
curl https://kazggnufaoicopvmwhdl.supabase.co/functions/v1/health-check
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-21T10:00:00Z",
  "checks": {
    "database": { "status": "ok", "latency_ms": 45 },
    "storage": { "status": "ok" }
  },
  "version": "1.0.0"
}
```

### 8.2 Key Metrics to Monitor

| Metric | Alert Threshold |
|--------|-----------------|
| Unclaimed leads > 30min | > 5 leads |
| SLA breaches | Any occurrence |
| Edge function errors | > 5/hour |
| Database latency | > 500ms |
| Email delivery failures | > 10% |

### 8.3 Lovable Cloud Dashboard

Access backend monitoring:

1. Click "Backend" button in Lovable
2. View database tables
3. Check edge function logs
4. Monitor real-time connections

---

## 9. Backup Configuration

### 9.1 Automatic Backups

Lovable Cloud includes automatic daily backups with 7-day retention.

### 9.2 Manual Data Export

To export CRM data:

1. Access Lovable Cloud backend
2. Navigate to each CRM table
3. Export as CSV or JSON

### 9.3 Pre-Deployment Backup

Before major changes:
1. Export all CRM tables
2. Save to secure location
3. Document current state

---

## 10. Go-Live Procedure

### 10.1 Pre-Launch (Day Before)

- [ ] Run complete testing checklist
- [ ] Verify all agent accounts created
- [ ] Test webhook endpoints
- [ ] Confirm email notifications working
- [ ] Review security settings

### 10.2 Launch Day Morning

1. **9:00 AM** - Final health check
2. **9:30 AM** - Run test lead through system
3. **10:00 AM** - Verify agent notifications received
4. **10:30 AM** - Confirm admin dashboard working

### 10.3 Go Live

1. **11:00 AM** - Enable webhooks from Emma/Forms
2. **11:05 AM** - Monitor first real leads
3. **11:15 AM** - Verify claims working
4. **11:30 AM** - Check all notifications sent

### 10.4 Post-Launch Monitoring

- Check every 2 hours for first day
- Monitor unclaimed lead queue
- Watch for SLA breaches
- Respond to agent issues immediately

---

## 11. Rollback Procedure

### 11.1 Code Rollback

If issues after deployment:

1. Go to Lovable version history
2. Select last working version
3. Restore that version
4. Verify functionality

### 11.2 Database Rollback

If data issues:

1. Contact Lovable support
2. Request point-in-time restore
3. Verify data integrity
4. Re-test functionality

---

## 12. Post-Deployment Checklist

### Week 1

- [ ] Daily monitoring of lead flow
- [ ] Check email deliverability
- [ ] Review agent feedback
- [ ] Monitor performance metrics
- [ ] Address any issues

### Week 2-4

- [ ] Analyze claim times
- [ ] Review SLA compliance
- [ ] Optimize agent capacity
- [ ] Gather user feedback
- [ ] Plan improvements

### Month 2+

- [ ] Monthly performance review
- [ ] Capacity planning
- [ ] Feature enhancements
- [ ] Training updates
- [ ] Documentation updates

---

## Support Contacts

| Issue Type | Contact |
|------------|---------|
| Technical bugs | [Internal tech support] |
| Agent questions | [Team lead] |
| Lovable platform | support@lovable.dev |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-21 | System | Initial creation |
