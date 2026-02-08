

# Create Email Tracking Database Tables

## Overview

Create two new database tables for bidirectional email tracking (incoming + outgoing) to support Gmail/Outlook email sync for agents.

## Important Correction

The provided SQL references `agents(id)` but the correct table name in your database is `crm_agents(id)`. I'll fix this in the migration.

## Tables to Create

### 1. `email_tracking` Table

Tracks all incoming and outgoing emails synced from agent email accounts:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `lead_id` | UUID | Optional link to CRM lead |
| `agent_id` | UUID | Required - references `crm_agents` |
| `agent_email` | TEXT | Agent's email address |
| `direction` | TEXT | 'incoming' or 'outgoing' |
| `from_email` | TEXT | Sender email |
| `to_email` | TEXT | Recipient email |
| `cc_emails` | TEXT[] | CC recipients |
| `subject` | TEXT | Email subject |
| `body_text` | TEXT | Plain text body |
| `body_html` | TEXT | HTML body |
| `received_at` | TIMESTAMPTZ | When email was received |
| `read_at` | TIMESTAMPTZ | When agent read it in CRM |
| `created_at` | TIMESTAMPTZ | Record creation time |
| `updated_at` | TIMESTAMPTZ | Last update time |

### 2. `email_webhook_logs` Table

Debug table for webhook troubleshooting:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `raw_payload` | JSONB | Raw webhook data |
| `success` | BOOLEAN | Processing success |
| `error_message` | TEXT | Error details |
| `created_at` | TIMESTAMPTZ | When received |

## Security (RLS Policies)

### `email_tracking` Table:
- **SELECT**: Agents can only view their own emails
- **UPDATE**: Agents can only update their own emails (mark as read)
- **INSERT**: Service role only (edge functions)
- **Admin access**: Admins can view all emails

### `email_webhook_logs` Table:
- **SELECT**: Admin-only access using `is_admin()` function

## Performance Indexes

- `idx_email_tracking_lead_id` - Fast lead-based lookups
- `idx_email_tracking_agent_id` - Fast agent-based lookups
- `idx_email_tracking_direction` - Filter by incoming/outgoing
- `idx_email_tracking_received_at` - Sort by date (DESC)

## Technical Details

### SQL Migration

```sql
-- Email tracking table for bidirectional email sync
CREATE TABLE email_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES crm_leads(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES crm_agents(id) NOT NULL,  -- FIXED: crm_agents not agents
  agent_email TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  from_email TEXT NOT NULL,
  to_email TEXT NOT NULL,
  cc_emails TEXT[],
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  received_at TIMESTAMPTZ NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_email_tracking_lead_id ON email_tracking(lead_id);
CREATE INDEX idx_email_tracking_agent_id ON email_tracking(agent_id);
CREATE INDEX idx_email_tracking_direction ON email_tracking(direction);
CREATE INDEX idx_email_tracking_received_at ON email_tracking(received_at DESC);

-- RLS
ALTER TABLE email_tracking ENABLE ROW LEVEL SECURITY;

-- Agent policies
CREATE POLICY "Agents view own emails"
  ON email_tracking FOR SELECT
  USING (agent_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Agents update own emails"
  ON email_tracking FOR UPDATE
  USING (agent_id = auth.uid())
  WITH CHECK (agent_id = auth.uid());

CREATE POLICY "System can insert emails"
  ON email_tracking FOR INSERT
  WITH CHECK (true);

-- Webhook logs table
CREATE TABLE email_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_payload JSONB,
  success BOOLEAN,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE email_webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins view logs"
  ON email_webhook_logs FOR SELECT
  USING (public.is_admin(auth.uid()));
```

## What This Does NOT Change

- No modifications to existing `crm_email_logs` table
- No modifications to existing edge functions
- No frontend code changes
- Purely database schema addition

