

# Phase 3: Blind Claiming -- Hide Lead Details Until Claimed

## Overview

Three email templates need to be modified to remove personal lead information, replacing it with language/country-only info and a "claim to reveal" message. Two admin templates remain unchanged.

## Templates to Modify

### 1. T+0 Broadcast Template (send-lead-notification/index.ts)

**Function:** `generateEmailHtml` (lines 97-112)

**Current:** Shows name, phone, budget, country, location, timeframe, source, segment.

**New template will show:**
- Language badge (e.g., "FI") and country flag
- Country/origin (flag + country name only, no phone prefix)
- Lead segment badge (Hot/Warm/Cool)
- "Claim this lead to view contact details" message
- Claim button

**Will NOT show:** Name, phone, email, budget, location, timeframe, source, message.

### 2. T+1 through T+4 Escalation Template (send-escalating-alarms/index.ts)

**Location:** Lines 168-262 (inline HTML in the main handler)

**Current:** Shows name, phone, email, language, source, time elapsed.

**New template will show:**
- Alarm level header with urgency color (unchanged)
- Language and country flag
- Time elapsed and time remaining
- "Claim to see full lead details" message
- Claim button
- Final warning banner at T+4 (unchanged text)

**Will NOT show:** Name, phone, email, source.

### 3. Form Submission Alert (send-lead-notification/index.ts)

**Function:** `generateFormSubmissionAlertEmailHtml` (lines 206-258)

**Current:** Shows name, phone, email, country, form data, UTM tracking to admins.

**Decision:** This goes to admins only. Per the plan's guidance, admin emails should keep full details for oversight. However, the subject line currently contains the lead's name: `Form Submission: John Smith (Landing page fi) - FI`. This leaks the name.

**Change:** Remove the lead name from the subject line only. Template body stays as-is since it goes to admins.

**New subject:** `Form Submission (Landing page fi) - FI` (no name)

### 4. Broadcast Subject Line (send-lead-notification/index.ts, line 439)

Already generic: `CRM_NEW_LEAD_FI | New Finnish lead - call immediately`. No change needed.

### 5. Urgent Template Subject (line 428)

Currently: `URGENT LEAD: John Smith - Budget`. This leaks the name.

**New subject:** `CRM_URGENT_LEAD_{LANG} | Urgent {LangName} lead - action required`

## Templates NOT Modified (Admin-Only)

- `generateAdminUnclaimedEmailHtml` -- T+5 breach, keeps all details
- `generateSlaWarningEmailHtml` -- Contact SLA breach, keeps all details
- `generateNightHoldAlertEmailHtml` -- Dead code after Phase 1, no change needed

## Detailed Changes

### File 1: supabase/functions/send-lead-notification/index.ts

**Change A -- Replace `generateEmailHtml` function (lines 97-112)**

New function generates a clean "blind claim" template showing only:
- Gold header: "{flag} New Lead Available!"
- Claim window timer bar
- Escalating reminders notice
- Greeting with agent name
- Info box with: Language badge, country flag/name, segment badge
- Warning box: "Claim this lead now to view contact details"
- Gold CTA button: "Claim This Lead Now"
- Footer explanation about blind claiming

**Change B -- Update urgent email subject (line 428)**

Remove lead name and budget from subject. Use deterministic format matching the CRM standard.

**Change C -- Update form submission subject (line 418)**

Remove lead name from subject line.

### File 2: supabase/functions/send-escalating-alarms/index.ts

**Change D -- Replace lead details table in email HTML (lines 196-223)**

Replace the 6-row details table (Name, Phone, Email, Language, Source, Time Elapsed) with a 3-row table (Language, Country, Time Elapsed). Remove name, phone, email, and source.

## What Agents Will See

**T+0 Broadcast email:**
```
Subject: CRM_NEW_LEAD_FI | New Finnish lead - call immediately

[Gold Header]
New Lead Available!
Claim this lead before it's gone

[Timer Bar]
You have 5 minutes to claim this lead

[Body]
Hi Juho,

A new FI lead matching your profile is available for claiming:

  Language: FI
  Country: Finland
  Segment: New

  Claim this lead now to view contact details and get started!
  Lead details will be revealed after you claim it.

  [CLAIM THIS LEAD NOW]

  First agent to claim gets the lead.
  Personal information is only shown after claiming.
```

**T+2 Escalation email:**
```
Subject: CRM_NEW_LEAD_FI_T2 | Reminder 2 - SLA running (2 min)

[Orange Header]
WARNING - 2 MIN PASSED
Lead still unclaimed after 2 minutes!

[Body]
  Language: FI
  Country: Finland
  Time Elapsed: 2 minutes

  [CLAIM THIS LEAD NOW]

  Time remaining: 3 minutes
```

## Summary of All Edits

| File | Lines | Change |
|------|-------|--------|
| send-lead-notification/index.ts | 97-112 | Replace `generateEmailHtml` with blind-claim template |
| send-lead-notification/index.ts | 418 | Remove lead name from form submission subject |
| send-lead-notification/index.ts | 428 | Remove lead name/budget from urgent subject |
| send-escalating-alarms/index.ts | 196-223 | Remove name/phone/email/source from escalation email body |

## What Stays the Same

- All subject line formats for T+0 broadcast and T+1-T+4 escalations (already generic)
- Admin breach alert emails (T+5 unclaimed and contact SLA) keep full details
- Form submission alert email body keeps full details (admin-only)
- Night hold alert template (dead code, no change)
- Claim URL logic and CRM dashboard (already shows full details after claiming)
- Email logging and audit trail

