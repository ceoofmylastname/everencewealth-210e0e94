

# Create Role-Specific Gmail Filter Guides (Corrected Labels)

## Overview
Create two separate Gmail filter setup guides using the **exact label structures agents and admins already have**.

## Files to Create

### 1. `docs/CRM_GMAIL_FILTER_SETUP_AGENTS.md`

**Audience:** Sales agents (juho@, eetu@, artur@, cedric@, nathalie@, augustin@, nederlands@, cindy@, steven@, info@yenomai.com)

**Existing Agent Labels (9 labels):**

```text
CRM/
  Urgent
  Stage-1/
    T0-Broadcast
    T1-Escalation
    T2-Escalation
    T3-Escalation
    T4-Final-Warning
  Reminders/
    10-Min
    1-Hour
  Actions/
    Reassigned
```

**Filters (7 filters):**

| # | Filter | Label | Subject Pattern |
|---|--------|-------|-----------------|
| 1 | T+0 new leads | CRM/Urgent + CRM/Stage-1/T0-Broadcast | `CRM_NEW_LEAD_XX` (excluding T1-T4) |
| 2 | T+1 reminder | CRM/Stage-1/T1-Escalation + CRM/Reminders/10-Min | `CRM_NEW_LEAD_XX_T1` (all 11 langs) |
| 3 | T+2 reminder | CRM/Stage-1/T2-Escalation + CRM/Reminders/10-Min | `CRM_NEW_LEAD_XX_T2` (all 11 langs) |
| 4 | T+3 reminder | CRM/Stage-1/T3-Escalation + CRM/Reminders/1-Hour | `CRM_NEW_LEAD_XX_T3` (all 11 langs) |
| 5 | T+4 final warning | CRM/Stage-1/T4-Final-Warning | `CRM_NEW_LEAD_XX_T4` (all 11 langs) |
| 6 | Reassigned leads | CRM/Actions/Reassigned | `CRM_LEAD_REASSIGNED` or equivalent |
| 7 | Combined T+1/T+2 alt | CRM/Reminders/10-Min | (optional shortcut combining T1+T2) |

Note: Filters 2 and 3 apply TWO labels each (stage label + reminder label) so agents can view by either stage or timing.

All search queries will explicitly list all 11 language codes (EN, NL, FR, FI, PL, DE, ES, SV, DA, HU, NO) since Gmail does not support wildcards.

Includes: label creation tree, step-by-step filter setup, mobile notification config (Android/iOS), verification checklist, quick-reference table.

---

### 2. `docs/CRM_GMAIL_FILTER_SETUP_ADMINS.md`

**Audience:** Admins (Hans for FI/PL, Steven for other languages)

**Existing Admin Labels (3 labels):**

```text
CRM/
  Admin/
    Form-Submissions
    Stage-1-Breach
    Stage-2-Breach
```

**Filters (3 filters):**

| # | Filter | Label | Subject Pattern |
|---|--------|-------|-----------------|
| 1 | T+5 unclaimed | CRM/Admin/Stage-1-Breach | `CRM_ADMIN_NO_CLAIM` |
| 2 | T+5 not called | CRM/Admin/Stage-2-Breach | `CRM_ADMIN_CLAIMED_NOT_CALLED` |
| 3 | Form submissions | CRM/Admin/Form-Submissions | `"Form Submission" from:crm@notifications...` |

Includes: same instructional format, admin-specific routing note (Hans=FI/PL, Steven=others), verification checklist.

---

## What stays unchanged
- `docs/CRM_GMAIL_FILTER_SETUP_COMPLETE.md` remains as combined reference
- No database, code, or edge function changes
- Documentation only

## One question about CRM/Actions/Reassigned
The reassignment email subject pattern needs clarification. If the CRM sends a specific subject like `CRM_LEAD_REASSIGNED_XX`, I will include a filter for it. If no reassignment email exists yet, I will note the label as "reserved for future use" in the guide.

