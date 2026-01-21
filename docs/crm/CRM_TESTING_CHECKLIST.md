# Del Sol Prime Homes CRM - Testing Checklist

## Overview
Complete testing checklist for all CRM functionality before production launch.

---

## 1. Database & Backend Testing

### 1.1 Tables Verification

| Table | Status | Notes |
|-------|--------|-------|
| `crm_agents` | ☐ | Verify all columns, RLS enabled |
| `crm_leads` | ☐ | Verify 40+ columns including qa_pairs JSONB |
| `crm_activities` | ☐ | Verify activity_type, outcome, interest_level |
| `crm_reminders` | ☐ | Verify datetime, snoozed_until, is_completed |
| `crm_lead_notes` | ☐ | Verify note_type, is_pinned |
| `crm_notifications` | ☐ | Verify notification_type, read, read_at |

### 1.2 RLS Policy Tests

#### Agents Table
- [ ] Agents can only see their own profile record
- [ ] Agents can update only their own profile
- [ ] Admins can see all agent records
- [ ] Admins can update any agent record
- [ ] Unauthenticated users cannot access

#### Leads Table
- [ ] Agents see only leads assigned to them
- [ ] Agents see unclaimed leads matching their language
- [ ] Agents cannot see leads assigned to other agents
- [ ] Admins see all leads regardless of assignment
- [ ] Service role can insert leads (for webhooks)

#### Activities Table
- [ ] Agents see only activities where they are agent_id
- [ ] Agents can only create activities for their assigned leads
- [ ] Admins see all activities across all agents
- [ ] Cannot modify other agents' activities

#### Reminders Table
- [ ] Agents see only their own reminders
- [ ] Cannot access other agents' reminders
- [ ] Can create reminders only for assigned leads

#### Notifications Table
- [ ] Agents see only notifications addressed to them
- [ ] Cannot access other agents' notifications
- [ ] Mark as read only for own notifications

### 1.3 Database Functions

| Function | Test | Expected Result | Status |
|----------|------|-----------------|--------|
| `claim_lead(p_lead_id, p_agent_id)` | Two agents claim same lead | Only first succeeds | ☐ |
| `claim_lead` | Agent at capacity attempts | Error: "at maximum capacity" | ☐ |
| `claim_lead` | Language mismatch | Error: "Language mismatch" | ☐ |
| `claim_lead` | Expired claim window | Error: "Claim window expired" | ☐ |
| `notify_lead_claimed` | Lead claimed | Other agents' notifications updated | ☐ |
| `is_crm_agent(_user_id)` | Valid agent | Returns true | ☐ |
| `can_access_lead(_user_id, _lead_id)` | Assigned lead | Returns true | ☐ |
| `can_access_lead(_user_id, _lead_id)` | Unassigned lead | Returns false | ☐ |

### 1.4 Triggers

| Trigger | Table | Test | Expected | Status |
|---------|-------|------|----------|--------|
| `update_lead_contact_stats` | `crm_activities` | Log activity | Updates last_contact_at, total_contacts | ☐ |
| `update_agent_lead_count` | `crm_leads` | Assign lead | Increments current_lead_count | ☐ |
| `update_agent_lead_count` | `crm_leads` | Unassign lead | Decrements current_lead_count | ☐ |

---

## 2. Lead Lifecycle Testing

### 2.1 Lead Intake (register-crm-lead)

#### From Emma Chatbot
- [ ] Webhook receives POST with full payload
- [ ] qa_pairs stored as JSONB array
- [ ] emma_conversation_duration captured
- [ ] emma_questions_answered count correct
- [ ] emma_exit_point recorded if incomplete
- [ ] intake_complete flag set appropriately

#### From Landing Form
- [ ] All form fields captured correctly
- [ ] lead_source = "landing_form"
- [ ] page_url, page_title stored
- [ ] Property reference linked if applicable

#### From Property Inquiry
- [ ] property_reference stored
- [ ] property_price captured
- [ ] lead_source = "property_inquiry"

### 2.2 Lead Scoring (0-100)

| Component | Weight | Test Case | Expected Score | Status |
|-----------|--------|-----------|----------------|--------|
| Budget | 0-30 | "1m_plus" | 30 | ☐ |
| Budget | 0-30 | "500k_1m" | 25 | ☐ |
| Budget | 0-30 | "not_sure" | 5 | ☐ |
| Timeframe | 0-25 | "within_3_months" | 25 | ☐ |
| Timeframe | 0-25 | "1_2_years" | 10 | ☐ |
| Emma Completion | 0-20 | intake_complete=true | 20 | ☐ |
| Location | 0-15 | 3+ specific areas | 15 | ☐ |
| Property Criteria | 0-10 | Detailed requirements | 10 | ☐ |

### 2.3 Lead Segmentation

| Segment | Score Range | Priority | Status |
|---------|-------------|----------|--------|
| Hot_Investor | ≥80 | urgent | ☐ |
| Warm_Family | 60-79 | high | ☐ |
| Cool_Holiday | 40-59 | medium | ☐ |
| Cold_General | <40 | low | ☐ |

### 2.4 Claim Window

- [ ] claim_window_expires_at set to 15 minutes from creation
- [ ] Claim button disabled after window expires
- [ ] Admin notified of expired claims
- [ ] Lead shows in admin's unclaimed queue

---

## 3. Lead Claiming Testing

### 3.1 Successful Claim Flow

1. [ ] New lead created via webhook
2. [ ] Eligible agents calculated (language + active + capacity)
3. [ ] Notifications created for each eligible agent
4. [ ] Email notifications sent via send-lead-notification
5. [ ] Agent receives in-app notification (bell icon)
6. [ ] Agent clicks "Claim" button
7. [ ] Lead assigned to agent
8. [ ] Agent's current_lead_count incremented
9. [ ] Other agents' notifications marked "lead_claimed"
10. [ ] Lead appears in agent's dashboard

### 3.2 Race Condition Testing

| Scenario | Steps | Expected Result | Status |
|----------|-------|-----------------|--------|
| Simultaneous claim | Two agents click at same time | Only first succeeds | ☐ |
| Second click | Agent B clicks after A | Error message shown | ☐ |
| UI update | After claim fails | Lead removed from list | ☐ |

### 3.3 Claim Restrictions

- [ ] Agent at max capacity → "You are at maximum lead capacity"
- [ ] Language mismatch → "Language mismatch"
- [ ] Window expired → "Claim window has expired"
- [ ] Already claimed → "Lead has already been claimed"

---

## 4. Activity Logging Testing

### 4.1 Log Call (LogCallDrawer)

#### Call Timer
- [ ] Start button begins timer
- [ ] Timer updates every second
- [ ] Stop button pauses timer
- [ ] Reset clears to 00:00
- [ ] Manual duration entry works
- [ ] Duration saved to database

#### Outcome Selection
| Outcome | Required Fields | Status Update | Status |
|---------|-----------------|---------------|--------|
| Answered | Interest level, Notes | contacted | ☐ |
| No Answer | Notes | contacted | ☐ |
| Busy | Notes | contacted | ☐ |
| Wrong Number | Notes | not_interested | ☐ |
| Not Interested | Notes | not_interested | ☐ |
| Voicemail | Notes | contacted | ☐ |

#### Conditional Logic
- [ ] "Answered" → Interest level dropdown appears
- [ ] "No Answer" → WhatsApp follow-up suggested
- [ ] "Not Interested" → Reason field appears
- [ ] Callback checkbox → Date/time picker appears

#### WhatsApp Integration
- [ ] Template dropdown shows all templates
- [ ] Token replacement: {firstName}, {agentName}
- [ ] "Open WhatsApp" button generates correct URL
- [ ] Activity logged when confirmed

### 4.2 Log Email (LogEmailDrawer)

- [ ] Subject field required
- [ ] Notes/summary field
- [ ] Activity type = "email"
- [ ] Saved to crm_activities

### 4.3 Log WhatsApp

- [ ] Template selection works
- [ ] Custom message option
- [ ] Opens wa.me link correctly
- [ ] Activity logged with message content

### 4.4 Quick Notes (QuickNoteSheet)

- [ ] Note type: private (agent only)
- [ ] Note type: shared (visible to admin)
- [ ] Pin functionality works
- [ ] Pinned notes appear at top
- [ ] Notes saved to crm_lead_notes

### 4.5 Schedule Reminder (ScheduleReminderSheet)

- [ ] Quick presets work:
  - [ ] Tomorrow 10:00 AM
  - [ ] Tomorrow 2:00 PM
  - [ ] In 1 hour
  - [ ] In 4 hours
  - [ ] Next week same time
- [ ] Custom datetime picker
- [ ] Reminder type selection (callback, follow_up, viewing, meeting)
- [ ] Reminder created in crm_reminders
- [ ] Appears in Calendar page

### 4.6 Activity Timeline

- [ ] Activities load in reverse chronological order
- [ ] Real-time updates when new activity added
- [ ] Activity type icons display correctly
- [ ] Expandable details work
- [ ] Edit/delete functionality (if implemented)

---

## 5. Calendar & Reminders Testing

### 5.1 Calendar Views

#### Day View
- [ ] Shows hourly slots 8am-8pm
- [ ] Reminders positioned correctly by time
- [ ] Clicking reminder opens details
- [ ] Current hour highlighted

#### Week View
- [ ] Displays Monday-Sunday
- [ ] Time grid on left side
- [ ] Reminders in correct day columns
- [ ] Today highlighted

#### Month View
- [ ] Calendar grid layout
- [ ] Reminder dots on days with reminders
- [ ] Clicking day shows that day's reminders
- [ ] Navigation between months

### 5.2 Navigation

- [ ] Previous button goes back
- [ ] Today button returns to current date
- [ ] Next button goes forward
- [ ] Keyboard shortcuts:
  - [ ] T = Today
  - [ ] ← = Previous
  - [ ] → = Next
  - [ ] D = Day view
  - [ ] W = Week view
  - [ ] M = Month view

### 5.3 Countdown Timers

| Time Remaining | Color | Animation | Status |
|----------------|-------|-----------|--------|
| Overdue | Red | Pulsing | ☐ |
| < 30 minutes | Dark Orange | None | ☐ |
| 30min - 1hr | Orange | None | ☐ |
| 1hr - 4hr | Amber | None | ☐ |
| Today | Yellow | None | ☐ |
| This week | Green | None | ☐ |
| Later | Blue | None | ☐ |

- [ ] Countdown updates every minute in real-time
- [ ] Color transitions when threshold crossed

### 5.4 Reminder Actions

#### Complete
- [ ] Sets is_completed = true
- [ ] Sets completed_at = now()
- [ ] Removes from pending list
- [ ] Calendar updates immediately

#### Snooze
- [ ] 30 minutes option
- [ ] 1 hour option
- [ ] 4 hours option
- [ ] Custom time entry
- [ ] Updates reminder_datetime
- [ ] Sets snoozed_until timestamp

#### Reschedule
- [ ] Date picker allows future dates only
- [ ] Time picker shows available slots
- [ ] Updates reminder in database
- [ ] Calendar updates immediately

#### Delete
- [ ] Confirmation dialog appears
- [ ] Reminder removed from database
- [ ] Calendar updates
- [ ] No orphaned data

### 5.5 Real-Time Updates

- [ ] New reminder appears immediately
- [ ] Updated reminder refreshes
- [ ] Completed reminder updates status
- [ ] Deleted reminder disappears
- [ ] Supabase subscription working

---

## 6. Admin Interface Testing

### 6.1 Access Control

- [ ] Only role="admin" can access /crm/admin/* routes
- [ ] Non-admin redirected to agent dashboard
- [ ] Admin role verified on page load
- [ ] API calls check admin permission

### 6.2 Admin Dashboard (CrmDashboard.tsx)

#### Stats Cards
| Card | Data Source | Status |
|------|-------------|--------|
| Total Leads | Count all non-archived leads | ☐ |
| Unclaimed | lead_claimed=false, assigned_agent_id=null | ☐ |
| Active Agents | is_active=true, accepts_new_leads=true | ☐ |
| SLA Breaches | >24h since assigned, no contact | ☐ |

#### Team Activity Feed
- [ ] Shows last 50 activities across all agents
- [ ] Agent name + avatar displayed
- [ ] Activity type icon correct
- [ ] Lead name clickable (opens detail)
- [ ] Real-time updates

### 6.3 Leads Overview (LeadsOverview.tsx)

#### Filtering
| Filter | Options | Status |
|--------|---------|--------|
| Search | Name, email, phone | ☐ |
| Language | All, FR, FI, PL, EN, NL, DE, ES, SV, DA, HU | ☐ |
| Status | Unclaimed, Claimed, SLA Breach, Expired | ☐ |
| Segment | Hot, Warm, Cool, Cold | ☐ |
| Priority | Urgent, High, Medium, Low | ☐ |

- [ ] Multiple filters combine correctly
- [ ] Clear filters resets all
- [ ] Results update immediately

#### Lead Table
- [ ] All columns display correctly
- [ ] Sortable columns work
- [ ] SLA breach indicator (red badge)
- [ ] Expired claim indicator (orange badge)
- [ ] Suggested agent shown for unclaimed

### 6.4 Manual Assignment (AssignLeadDialog.tsx)

- [ ] Lead summary displayed
- [ ] Agent dropdown shows eligible agents only
- [ ] Capacity bars accurate (current/max)
- [ ] "Suggested" badge on least loaded agent
- [ ] Language compatibility enforced
- [ ] Assignment reason field
- [ ] Confirm assigns correctly
- [ ] Agent notified
- [ ] Activity logged

### 6.5 Bulk Assignment (BulkAssignmentBar.tsx)

- [ ] Checkbox column in table
- [ ] Select all checkbox works
- [ ] Selected count displayed
- [ ] Agent dropdown for bulk assign
- [ ] Capacity validation for total
- [ ] All leads assigned
- [ ] All activities logged
- [ ] Clear selection after assign

### 6.6 Restart Round Robin

- [ ] Clears assigned_agent_id
- [ ] Sets lead_claimed = false
- [ ] New claim_window_expires_at (+15 min)
- [ ] Re-broadcasts to eligible agents
- [ ] Activity logged
- [ ] Notifications created

### 6.7 Agent Management

- [ ] View all agents list
- [ ] Create new agent (via edge function)
- [ ] Edit agent details
- [ ] Deactivate agent
- [ ] View agent's leads
- [ ] View agent's activities

---

## 7. Edge Functions Testing

### 7.1 register-crm-lead

```bash
# Test command
curl -X POST https://[project].supabase.co/functions/v1/register-crm-lead \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Lead",
    "email": "test@example.com",
    "phone": "+34600123456",
    "language": "en",
    "source": "emma_chatbot",
    "budget": "500k_1m",
    "timeframe": "within_6_months"
  }'
```

| Test Case | Expected | Status |
|-----------|----------|--------|
| Valid payload | Lead created, notifications sent | ☐ |
| Missing required fields | 400 error | ☐ |
| Invalid language | 400 error | ☐ |
| No eligible agents | Lead created, admin notified | ☐ |

### 7.2 claim-lead

| Test Case | Expected | Status |
|-----------|----------|--------|
| Valid claim | Success, lead assigned | ☐ |
| Already claimed | 400 "already claimed" | ☐ |
| Window expired | 400 "expired" | ☐ |
| At capacity | 400 "at capacity" | ☐ |
| Language mismatch | 400 "mismatch" | ☐ |

### 7.3 send-lead-notification

| Test Case | Expected | Status |
|-----------|----------|--------|
| RESEND_API_KEY set | Emails sent | ☐ |
| Key missing | Logs error, continues | ☐ |
| Invalid email | Logs error, skips | ☐ |

### 7.4 create-crm-agent

| Test Case | Expected | Status |
|-----------|----------|--------|
| Valid data | Auth user + agent record | ☐ |
| Duplicate email | 400 error | ☐ |
| Missing fields | 400 error | ☐ |

### 7.5 delete-crm-agent

| Test Case | Expected | Status |
|-----------|----------|--------|
| Valid agent_id | Auth user deleted, agent deactivated | ☐ |
| Has assigned leads | Leads archived | ☐ |

### 7.6 health-check

| Check | Expected | Status |
|-------|----------|--------|
| Database | "ok" with latency_ms | ☐ |
| Storage | "ok" | ☐ |
| Overall status | "healthy" | ☐ |

---

## 8. Real-Time Subscriptions

### 8.1 Subscription Tests

| Table | Event | Trigger | Expected | Status |
|-------|-------|---------|----------|--------|
| crm_leads | INSERT | New lead | Notification appears | ☐ |
| crm_leads | UPDATE | Lead claimed | Removes from claimable | ☐ |
| crm_activities | INSERT | Activity logged | Timeline updates | ☐ |
| crm_reminders | INSERT | Reminder created | Calendar updates | ☐ |
| crm_reminders | UPDATE | Snoozed/completed | Reflects change | ☐ |
| crm_notifications | INSERT | New notification | Bell badge updates | ☐ |

### 8.2 Latency Tests

| Action | Target Latency | Status |
|--------|----------------|--------|
| Lead claim notification | < 500ms | ☐ |
| Activity timeline update | < 500ms | ☐ |
| Reminder countdown update | < 100ms | ☐ |
| Notification bell update | < 500ms | ☐ |

---

## 9. Performance Testing

### 9.1 Page Load Times

| Page | Target | Status |
|------|--------|--------|
| Agent Dashboard | < 2s | ☐ |
| Lead Detail | < 2s | ☐ |
| Calendar | < 3s | ☐ |
| Admin Dashboard | < 3s | ☐ |
| Leads Overview (100+ leads) | < 3s | ☐ |

### 9.2 Database Query Performance

| Query | Target | Status |
|-------|--------|--------|
| Fetch agent leads | < 500ms | ☐ |
| Fetch lead activities | < 300ms | ☐ |
| Fetch reminders | < 200ms | ☐ |
| Claim lead (with lock) | < 500ms | ☐ |

### 9.3 Large Dataset Tests

- [ ] 1,000+ leads load without freezing
- [ ] Pagination/virtual scrolling works
- [ ] Filters don't slow with volume
- [ ] No memory leaks over time

---

## 10. Mobile Testing

### 10.1 Responsive Design

| Component | Mobile | Tablet | Status |
|-----------|--------|--------|--------|
| Dashboard | ☐ | ☐ | |
| Lead list | ☐ | ☐ | |
| Lead detail | ☐ | ☐ | |
| Calendar | ☐ | ☐ | |
| Log Call drawer | ☐ | ☐ | |
| Admin dashboard | ☐ | ☐ | |

### 10.2 Touch Interactions

- [ ] Buttons have adequate touch targets (44x44px)
- [ ] Swipe gestures work on calendar
- [ ] Dropdowns accessible
- [ ] No horizontal scroll issues

---

## 11. Notifications Testing

### 11.1 In-App Notifications

- [ ] Bell icon shows unread count
- [ ] Badge pulses on new notification
- [ ] Dropdown shows last 10
- [ ] Click navigates to lead
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Sound plays on new (if enabled)

### 11.2 Email Notifications (Resend)

| Email Type | Trigger | Contains | Status |
|------------|---------|----------|--------|
| New Lead Available | Lead created | Lead details, claim link | ☐ |
| Lead Assigned | Admin assigns | Lead details, action link | ☐ |
| Callback Reminder | 1hr before | Lead info, countdown | ☐ |
| SLA Breach | 24hr no contact | Alert, action link | ☐ |

- [ ] Emails sending (check Resend dashboard)
- [ ] From address correct
- [ ] Links work
- [ ] No spam folder issues

---

## 12. Integration Testing

### 12.1 Emma Chatbot → CRM

1. [ ] Complete Emma conversation
2. [ ] Webhook fires to register-crm-lead
3. [ ] Lead appears in CRM with full qa_pairs
4. [ ] Scoring applied correctly
5. [ ] Notifications sent to agents

### 12.2 Landing Form → CRM

1. [ ] Submit contact form
2. [ ] Webhook fires to register-crm-lead
3. [ ] Lead appears with form data
4. [ ] Property reference linked (if applicable)

### 12.3 CRM → GoHighLevel (if applicable)

1. [ ] Lead created in CRM
2. [ ] Webhook fires to GHL
3. [ ] Contact created in GHL
4. [ ] Fields mapped correctly

---

## Sign-Off

| Section | Tested By | Date | Status |
|---------|-----------|------|--------|
| Database & Backend | | | ☐ |
| Lead Lifecycle | | | ☐ |
| Lead Claiming | | | ☐ |
| Activity Logging | | | ☐ |
| Calendar & Reminders | | | ☐ |
| Admin Interface | | | ☐ |
| Edge Functions | | | ☐ |
| Real-Time | | | ☐ |
| Performance | | | ☐ |
| Mobile | | | ☐ |
| Notifications | | | ☐ |
| Integration | | | ☐ |

**Final Approval:** _________________ Date: _________
