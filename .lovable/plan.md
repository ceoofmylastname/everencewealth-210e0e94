

# Create CRM Email Subject Line Test Plan Document

## Overview

Create a comprehensive markdown test plan document at `docs/CRM_EMAIL_SUBJECT_TEST_PLAN.md` covering all 7 notification tiers across multiple languages, with SQL queries for creating test leads and monitoring results.

## File to Create

**`docs/CRM_EMAIL_SUBJECT_TEST_PLAN.md`**

Contents will include the following sections, all verified against actual edge function code:

### 1. Test Environment Setup
- Prerequisites (database connectivity, Resend API key active, cron jobs running)
- Instructions to use `crm-test-lead` edge function for generating test leads
- Real-time monitoring setup

### 2. Test Matrix (5 tests)

**TEST 1: French Lead Full Escalation (Unclaimed)**
- T+0 through T+5, recipients: cedric/nathalie/augustin for T+0-T+4, steven for T+5
- Critical verify: Hans does NOT appear in any French notification

**TEST 2: Finnish Lead Full Escalation (Unclaimed)**
- T+0 through T+5, recipients: juho/eetu for T+0-T+4, hans for T+5
- Verify: Hans correctly receives T+5 admin escalation for Finnish

**TEST 3: Polish Lead Claimed But Not Called**
- T+0 to artur, artur claims, then T+5 contact breach to hans
- Verify: T+1 through T+4 do NOT fire after claim (last_alarm_level set to 99)

**TEST 4: Email Body Verification**
- HTML body unchanged, claim buttons functional, emojis present in body

**TEST 5: Other Notification Types (Unchanged)**
- Verify these retain original emoji-based subjects:
  - `form_submission_alert`: `📬 Form Submission: ...`
  - `night_hold_alert`: `🌙 After-Hours Lead: ...`
  - `sla_warning`: `⚠️ SLA Warning: ...`
  - `admin_unclaimed`: `🚨 UNCLAIMED: ...`
  - `test_urgent`: `🔥 URGENT LEAD: ...`

### 3. SQL Monitoring Queries
- Real-time activity log monitoring (crm_activities)
- Lead state verification (crm_leads alarm levels, SLA flags)
- Round robin config verification

### 4. Test Lead Creation
- curl commands calling the `crm-test-lead` edge function for each language
- Manual SQL insert alternative

### 5. Success Criteria Checklist
- All broadcast subjects match `CRM_NEW_LEAD_[LANG]`
- All escalation subjects match `CRM_NEW_LEAD_[LANG]_T[1-4]`
- All admin subjects match `CRM_ADMIN_*`
- Hans routing verified for FI/PL only
- Email bodies unchanged
- Other notification types unchanged

### 6. Complete Subject Line Reference Table
All 7 tiers documented with function source, recipient logic, and exact format string from code.

## Technical Details

- Single new file creation: `docs/CRM_EMAIL_SUBJECT_TEST_PLAN.md`
- No code changes to any edge functions or application code
- All subject lines verified against actual code in:
  - `supabase/functions/send-lead-notification/index.ts` (lines 417-437)
  - `supabase/functions/send-escalating-alarms/index.ts` (lines 21-39)
  - `supabase/functions/check-claim-window-expiry/index.ts` (line 118)
  - `supabase/functions/check-contact-window-expiry/index.ts` (line 136)
