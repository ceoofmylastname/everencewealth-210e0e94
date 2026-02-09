

# Update Escalating Alarm Subject Lines

## What Changes

Two surgical edits to `supabase/functions/send-escalating-alarms/index.ts`:

### Edit 1: Replace ALARM_CONFIG (lines 13-18)

Add a `subjectTemplate` function to each level while keeping existing `emoji`, `text`, and `color` properties intact (those are still used in email body HTML).

**Old:**
```
const ALARM_CONFIG: Record<number, { emoji: string; text: string; color: string }> = {
  1: { emoji: "...", text: "1 MIN PASSED", color: "#EAB308" },
  ...
};
```

**New:**
```
const ALARM_CONFIG: Record<number, { 
  emoji: string; text: string; color: string;
  subjectTemplate: (lang: string) => string;
}> = {
  1: { emoji: "...", ..., subjectTemplate: (lang) => `CRM_NEW_LEAD_${lang}_T1 | Reminder 1 – lead not claimed (1 min)` },
  2: { ..., subjectTemplate: (lang) => `CRM_NEW_LEAD_${lang}_T2 | Reminder 2 – SLA running (2 min)` },
  3: { ..., subjectTemplate: (lang) => `CRM_NEW_LEAD_${lang}_T3 | Reminder 3 – URGENT (3 min)` },
  4: { ..., subjectTemplate: (lang) => `CRM_NEW_LEAD_${lang}_T4 | FINAL reminder – fallback in 1 minute` },
};
```

### Edit 2: Update subject line (line 121)

**Old:** ``const subject = `${config.emoji} ${config.text} - NEW LEAD ${langCode} #${lead.id.slice(0,8)}`;``

**New:** `const subject = config.subjectTemplate(langCode);`

## What Does NOT Change

- Query logic (last_alarm_level state machine)
- Agent lookup via crm_round_robin_config
- Email body HTML (still uses config.emoji, config.text, config.color)
- Activity logging
- langCode is already uppercase on line 120

## New Subject Line Format

| Level | Old Subject | New Subject |
|-------|------------|-------------|
| T+1 | ⏰ 1 MIN PASSED - NEW LEAD EN #abc12345 | CRM_NEW_LEAD_EN_T1 \| Reminder 1 -- lead not claimed (1 min) |
| T+2 | ⚠️ 2 MIN PASSED - NEW LEAD EN #abc12345 | CRM_NEW_LEAD_EN_T2 \| Reminder 2 -- SLA running (2 min) |
| T+3 | 🚨 3 MIN PASSED - NEW LEAD EN #abc12345 | CRM_NEW_LEAD_EN_T3 \| Reminder 3 -- URGENT (3 min) |
| T+4 | 🔥 4 MIN PASSED - FINAL WARNING - NEW LEAD EN #abc12345 | CRM_NEW_LEAD_EN_T4 \| FINAL reminder -- fallback in 1 minute |

This aligns with the T+0 broadcast subject updated previously (`CRM_NEW_LEAD_${langCode} | New ${langName} lead -- call immediately`), creating a consistent `CRM_NEW_LEAD_` prefix for Gmail filtering.

