# Del Sol Prime Homes CRM - Monitoring & Alerting Guide

## Overview

Monitoring setup and alerting configuration for the CRM system to ensure high availability and rapid issue detection.

---

## 1. Key Metrics

### 1.1 Lead Flow Metrics

| Metric | Description | Target | Alert Threshold |
|--------|-------------|--------|-----------------|
| New Leads/Day | Daily lead intake | >10 | <5 for 2+ days |
| Claim Rate | % leads claimed in window | >80% | <60% |
| Avg Claim Time | Time to claim | <5 min | >10 min |
| Unclaimed Queue | Leads without claim | 0-2 | >5 |
| Expired Claims | Claims past 15 min | 0 | >3 |

### 1.2 SLA Metrics

| Metric | Description | Target | Alert Threshold |
|--------|-------------|--------|-----------------|
| First Contact Time | Time to first activity | <4 hours | >24 hours |
| SLA Breaches | No contact in 24h | 0 | Any |
| Response Rate | % leads contacted | 100% | <90% |

### 1.3 System Health Metrics

| Metric | Description | Target | Alert Threshold |
|--------|-------------|--------|-----------------|
| Database Latency | Query response time | <100ms | >500ms |
| Edge Function Errors | Failed invocations | 0 | >5/hour |
| Real-time Latency | Subscription delay | <500ms | >2s |
| Email Delivery | Successful sends | >99% | <90% |

### 1.4 User Activity Metrics

| Metric | Description | Target | Alert Threshold |
|--------|-------------|--------|-----------------|
| Active Agents | Logged in today | All agents | <50% |
| Activities/Lead | Logged activities | >3 | <1 |
| Callback Completion | Completed callbacks | >90% | <70% |
| Overdue Reminders | Past due reminders | <5 | >10 |

---

## 2. Health Check Endpoint

### 2.1 Endpoint Details

```
GET https://kazggnufaoicopvmwhdl.supabase.co/functions/v1/health-check
```

### 2.2 Response Format

```json
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "2026-01-21T10:00:00Z",
  "checks": {
    "database": {
      "status": "ok|error",
      "latency_ms": 45,
      "error": null
    },
    "storage": {
      "status": "ok|error",
      "error": null
    }
  },
  "version": "1.0.0"
}
```

### 2.3 Health Status Definitions

| Status | Meaning | Action |
|--------|---------|--------|
| healthy | All systems operational | None |
| degraded | Some issues, still functional | Monitor closely |
| unhealthy | Critical issues | Immediate attention |

### 2.4 Automated Health Checks

Set up external monitoring (e.g., UptimeRobot, Better Uptime):

- **Endpoint:** Health check URL
- **Interval:** Every 5 minutes
- **Alert on:** Non-200 response or "unhealthy" status
- **Notify:** Slack channel, email

---

## 3. Database Monitoring

### 3.1 Connection Pool

Monitor via Lovable Cloud backend:

- Current connections
- Max connections
- Connection wait time

**Alert if:** Connections > 80% of max

### 3.2 Query Performance

Key queries to monitor:

```sql
-- Slow query log (if available)
-- Monitor these specific patterns:

-- Lead fetch with filters
SELECT * FROM crm_leads WHERE ...;
-- Target: <100ms

-- Activity timeline
SELECT * FROM crm_activities WHERE lead_id = ?;
-- Target: <50ms

-- Reminder fetch
SELECT * FROM crm_reminders WHERE agent_id = ?;
-- Target: <50ms
```

### 3.3 Table Size Monitoring

```sql
-- Check table sizes
SELECT 
  relname AS table_name,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_catalog.pg_statio_user_tables
WHERE relname LIKE 'crm_%'
ORDER BY pg_total_relation_size(relid) DESC;
```

**Alert if:** Any table grows unexpectedly (>50% in a week)

---

## 4. Edge Function Monitoring

### 4.1 Function Invocations

Monitor via Lovable Cloud backend logs:

| Function | Expected Volume | Alert Threshold |
|----------|-----------------|-----------------|
| register-crm-lead | 10-50/day | <5/day or >100/day |
| claim-lead | 10-50/day | Error rate >5% |
| send-lead-notification | 10-100/day | Error rate >10% |
| health-check | Constant | Any errors |

### 4.2 Error Tracking

Check edge function logs for:

- 4xx errors (client issues)
- 5xx errors (server issues)
- Timeout errors
- Memory errors

**Alert if:** >5 errors in 1 hour

### 4.3 Execution Time

| Function | Target | Alert Threshold |
|----------|--------|-----------------|
| register-crm-lead | <2s | >5s |
| claim-lead | <1s | >3s |
| send-lead-notification | <5s | >10s |

---

## 5. Email Monitoring (Resend)

### 5.1 Delivery Metrics

Monitor in Resend dashboard:

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Delivery rate | >99% | <95% |
| Bounce rate | <1% | >5% |
| Complaint rate | <0.1% | >0.5% |

### 5.2 Email Types to Monitor

| Email Type | Volume | Alert on Failure |
|------------|--------|------------------|
| New Lead Available | Per lead | Yes |
| Lead Assigned | Per assignment | Yes |
| Callback Reminder | Per reminder | Yes |
| SLA Breach | Per breach | Yes |

---

## 6. Real-Time Subscription Monitoring

### 6.1 Subscription Health

Check for:

- Connection drops
- Message delays
- Failed subscriptions

### 6.2 Latency Monitoring

| Subscription | Target Latency | Alert Threshold |
|--------------|----------------|-----------------|
| Lead updates | <500ms | >2s |
| Activity updates | <500ms | >2s |
| Notification updates | <500ms | >2s |

---

## 7. User Activity Monitoring

### 7.1 Agent Login Activity

```sql
-- Check last login times
SELECT 
  first_name, 
  last_name, 
  last_login_at,
  NOW() - last_login_at AS time_since_login
FROM crm_agents
WHERE is_active = true
ORDER BY last_login_at ASC;
```

**Alert if:** Active agent not logged in for 24+ hours (business days)

### 7.2 Activity Logging

```sql
-- Daily activity count per agent
SELECT 
  a.first_name,
  a.last_name,
  COUNT(act.id) AS activities_today
FROM crm_agents a
LEFT JOIN crm_activities act 
  ON a.id = act.agent_id 
  AND act.created_at > NOW() - INTERVAL '24 hours'
WHERE a.is_active = true
GROUP BY a.id, a.first_name, a.last_name
ORDER BY activities_today ASC;
```

**Alert if:** Agent with assigned leads has 0 activities today

---

## 8. Dashboard Queries

### 8.1 Unclaimed Leads Monitor

```sql
-- Current unclaimed leads
SELECT 
  COUNT(*) AS unclaimed_count,
  MIN(created_at) AS oldest_unclaimed,
  NOW() - MIN(created_at) AS longest_wait
FROM crm_leads
WHERE lead_claimed = false 
  AND assigned_agent_id IS NULL
  AND archived = false;
```

Run every 15 minutes. **Alert if:** unclaimed_count > 5 OR longest_wait > 30 minutes

### 8.2 SLA Breach Monitor

```sql
-- Leads with SLA breach (24h no contact)
SELECT 
  l.id,
  l.first_name,
  l.last_name,
  l.assigned_at,
  a.first_name AS agent_name,
  NOW() - l.assigned_at AS time_since_assigned
FROM crm_leads l
JOIN crm_agents a ON l.assigned_agent_id = a.id
WHERE l.assigned_at IS NOT NULL
  AND l.last_contact_at IS NULL
  AND l.assigned_at < NOW() - INTERVAL '24 hours'
  AND l.archived = false;
```

Run hourly. **Alert if:** Any results

### 8.3 Expired Claims Monitor

```sql
-- Leads with expired claim windows
SELECT 
  COUNT(*) AS expired_count
FROM crm_leads
WHERE lead_claimed = false
  AND claim_window_expires_at IS NOT NULL
  AND claim_window_expires_at < NOW()
  AND assigned_agent_id IS NULL
  AND archived = false;
```

Run every 15 minutes. **Alert if:** expired_count > 3

### 8.4 Overdue Reminders Monitor

```sql
-- Overdue reminders
SELECT 
  COUNT(*) AS overdue_count
FROM crm_reminders
WHERE reminder_datetime < NOW()
  AND is_completed = false;
```

Run every 30 minutes. **Alert if:** overdue_count > 10

---

## 9. Alert Configuration

### 9.1 Alert Channels

| Channel | Use Case |
|---------|----------|
| Slack #crm-alerts | All alerts |
| Email (admin) | Critical alerts |
| SMS (on-call) | Critical after-hours |

### 9.2 Alert Priority Levels

| Priority | Response Time | Examples |
|----------|---------------|----------|
| P1 - Critical | <15 minutes | System down, no claims possible |
| P2 - High | <1 hour | SLA breaches, email failures |
| P3 - Medium | <4 hours | Performance degradation |
| P4 - Low | <24 hours | Minor issues, warnings |

### 9.3 Alert Templates

#### Critical Alert
```
🚨 CRITICAL: [Issue Summary]

Time: [Timestamp]
Impact: [Description]
Affected: [Users/Features]

Action Required: [Steps]

Dashboard: [Link]
```

#### Warning Alert
```
⚠️ WARNING: [Issue Summary]

Time: [Timestamp]
Details: [Description]
Threshold: [Exceeded value]

Recommended: [Action]
```

---

## 10. Daily Operations Checklist

### 10.1 Morning Check (9:00 AM)

- [ ] Run health check endpoint
- [ ] Check unclaimed leads queue
- [ ] Review overnight errors
- [ ] Verify all agents logged in
- [ ] Check email delivery stats

### 10.2 Midday Check (1:00 PM)

- [ ] Review claim times
- [ ] Check SLA compliance
- [ ] Monitor activity logging
- [ ] Review any alerts

### 10.3 Evening Check (5:00 PM)

- [ ] Daily stats summary
- [ ] Address any pending issues
- [ ] Verify reminders set for next day
- [ ] Check system health

---

## 11. Weekly Reports

### 11.1 Key Metrics Report

Generate weekly report including:

- Total leads received
- Claims by agent
- Average claim time
- SLA compliance %
- Activity volume
- Conversion metrics

### 11.2 System Health Report

- Uptime percentage
- Error counts
- Performance trends
- Capacity utilization

---

## 12. Incident Response

### 12.1 Severity Definitions

| Severity | Definition | Example |
|----------|------------|---------|
| S1 | System down | No one can log in |
| S2 | Major feature broken | Cannot claim leads |
| S3 | Minor feature issue | Calendar view broken |
| S4 | Cosmetic/minor | UI glitch |

### 12.2 Response Procedure

1. **Acknowledge** alert within SLA
2. **Assess** impact and severity
3. **Communicate** to affected users
4. **Investigate** root cause
5. **Resolve** or escalate
6. **Document** in incident log
7. **Review** in post-mortem

### 12.3 Escalation Path

1. On-call developer
2. Tech lead
3. Engineering manager
4. External support (Lovable)

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-21 | System | Initial creation |
