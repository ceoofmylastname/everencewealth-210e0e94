
# Update send-lead-notification to Display Country Information

## Overview

Add country/origin information to agent notification emails to address Hans's request for distinguishing which country leads are from (e.g., French leads from France vs. Belgium). This will add visual badges after the lead name and a dedicated "Country/Origin" row in contact details.

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/send-lead-notification/index.ts` | Update Lead interface and 6 email templates |

---

## Changes Required

### 1. Update Lead Interface (lines 19-42)

Add the three country fields that are now stored in `crm_leads`:

```typescript
interface Lead {
  // ... existing fields ...
  country_name?: string;     // NEW: "Belgium", "France", etc.
  country_code?: string;     // NEW: "BE", "FR", etc.
  country_flag?: string;     // NEW: "🇧🇪", "🇫🇷", etc.
  country_prefix?: string;   // Already exists in DB
}
```

---

### 2. Update Email Templates

Add a **badges section** after the lead name and a **Country/Origin row** in contact details for all 6 templates:

#### Badge Section (after lead name heading)
```html
<div style="display: flex; gap: 10px; margin-bottom: 20px;">
  ${lead.country_flag ? `
    <span style="background: #f0f0f0; padding: 6px 12px; border-radius: 6px; font-size: 14px;">
      ${lead.country_flag} ${lead.country_name}
    </span>
  ` : ''}
  <span style="background: #4F46E5; color: white; padding: 6px 12px; border-radius: 6px; font-size: 14px;">
    ${getLanguageFlag(lead.language)} ${lead.language.toUpperCase()}
  </span>
</div>
```

#### Country/Origin Row (in contact details section)
```html
<p style="margin: 8px 0;">
  <strong>Country/Origin:</strong> 
  ${lead.country_name && lead.country_name !== 'Unknown'
    ? `${lead.country_flag} ${lead.country_name} (${lead.country_prefix})`
    : '<span style="color: #DC2626;">Not Specified - Check chat log</span>'
  }
</p>
```

---

### 3. Templates to Update

| Template Function | Location | Purpose |
|------------------|----------|---------|
| `generateEmailHtml` | Line 93 | Standard broadcast to agents |
| `generateUrgentEmailHtml` | Line 101 | Urgent/direct assignment emails |
| `generateAdminUnclaimedEmailHtml` | Line 110 | Admin fallback emails |
| `generateSlaWarningEmailHtml` | Line 119 | SLA breach warning emails |
| `generateNightHoldAlertEmailHtml` | Line 127 | Night hold notifications |
| `generateFormSubmissionAlertEmailHtml` | Line 152 | Form submission alerts |

---

## Visual Preview

After this change, agent emails will show:

```text
┌─────────────────────────────────────────┐
│  John Smith                             │
│  [🇧🇪 Belgium] [🇫🇷 FR]                  │ ← Country badge + Language badge
│                                         │
│  Phone: +32 471 234 567                 │
│  Country/Origin: 🇧🇪 Belgium (+32)       │ ← New row
│  Budget: €350,000 - €500,000            │
│  ...                                    │
└─────────────────────────────────────────┘
```

---

## Use Case Addressed

This directly solves Hans's request:
- A French-speaking lead from **Belgium** (phone +32) will show: `🇧🇪 Belgium` badge + `🇫🇷 FR` language badge
- A French-speaking lead from **France** (phone +33) will show: `🇫🇷 France` badge + `🇫🇷 FR` language badge
- Agents can instantly see the distinction before calling

---

## Technical Notes

- Country data flows from `emma-chat` → `EmmaChat.tsx` → `send-emma-lead` → `register-crm-lead` → `crm_leads` table
- When loading leads for notification, the country fields will now be included in the lead object
- Fallback text "Not Specified - Check chat log" handles old leads without country data
