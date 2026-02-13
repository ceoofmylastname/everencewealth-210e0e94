

# Create Gmail Filter Setup Guide

## What
Create a single documentation file `docs/CRM_GMAIL_FILTER_SETUP_COMPLETE.md` containing the complete Gmail filter configuration guide mapped to the 6 existing label categories.

## File to Create
- `docs/CRM_GMAIL_FILTER_SETUP_COMPLETE.md`

## Content Structure
The document will contain all 6 filter definitions exactly as specified in your message:

1. **CRM/Urgent** -- T+0 new leads (all 11 languages, excluding T1-T4)
2. **CRM/Reminders/10-Min** -- T+1 and T+2 early reminders
3. **CRM/Reminders/1-Hour** -- T+3 urgent reminders
4. **CRM/Admin/Stage-1-Breach** -- T+4 final warnings
5. **CRM/Admin/Stage-2-Breach** -- T+5 admin escalations (unclaimed + not called)
6. **CRM/Admin/Form-Submissions** -- Website form submissions

Each filter section includes: Gmail search query (copy-pasteable), filter actions checklist, example subjects, and mobile notification guidance.

Also includes: step-by-step filter creation instructions, mobile setup for Android/iOS, verification checklist, and quick-reference subject-to-label mapping table.

## Technical Note
One adjustment needed: Gmail does not support wildcard (`*`) in subject filters. Filters 2, 3, and 4 (which use `CRM_NEW_LEAD_*_T1` etc.) will be rewritten to explicitly list all 11 language codes, matching the pattern used in Filter 1. This ensures the filters actually work in Gmail.

For example, Filter 2 becomes:
```
subject:(CRM_NEW_LEAD_EN_T1 | CRM_NEW_LEAD_NL_T1 | CRM_NEW_LEAD_FR_T1 | ... | CRM_NEW_LEAD_EN_T2 | CRM_NEW_LEAD_NL_T2 | ...)
```

## No Other Changes
- No database changes
- No edge function changes
- No code changes
- Documentation only

