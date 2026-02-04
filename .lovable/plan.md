

# Fix Language Casing Bug in Escalating Alarms

## Problem

The `send-escalating-alarms` function cannot find agents because it queries the database with uppercase language codes (`"EN"`) while the `crm_round_robin_config` table stores them in lowercase (`"en"`).

**Current Code (line 69):**
```typescript
const language = (lead.language || "EN").toUpperCase();
```

**Database stores:**
| language |
|----------|
| en |
| es |
| de |
| fr |
| nl |
| fi |

**Result:** Query `.eq("language", "EN")` returns nothing → No agents found → No emails sent

---

## Fix Required

### Line 69 - Query Language (MUST FIX)

**Before:**
```typescript
const language = (lead.language || "EN").toUpperCase();
```

**After:**
```typescript
const language = (lead.language || "en").toLowerCase();
```

### Line 120 - Email Subject Language Code (KEEP AS-IS)

The code on line 120 is used for the email subject display:
```typescript
const langCode = (lead.language || "EN").toUpperCase();
```

This should remain **uppercase** because email subjects should show `NEW LEAD EN #12345678` (not `en`).

---

## Summary of Changes

| Line | Current | Change To | Purpose |
|------|---------|-----------|---------|
| 69 | `toUpperCase()` + `"EN"` | `toLowerCase()` + `"en"` | Match database query |
| 120 | Keep as-is | No change | Display uppercase in email subject |

---

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/send-escalating-alarms/index.ts` | Fix line 69 to use lowercase for database query |

---

## Verification

After deployment:
1. Create a new test lead
2. Wait 1 minute → T+1 email should arrive
3. Check logs: `"Found X agents for language en"` (not `"No round robin config for language EN"`)
4. Subsequent T+2, T+3, T+4 emails should follow at 1-minute intervals

