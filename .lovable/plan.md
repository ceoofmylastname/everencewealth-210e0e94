

# Update send-emma-lead to Pass Country Data to CRM

## Overview

The `emma-chat` function already correctly extracts country information (country_name, country_code, country_flag) from phone number prefixes and returns it in `collectedInfo`. However, this data is not being passed through the pipeline to the CRM.

The issue is in `send-emma-lead/index.ts` which calls `register-crm-lead` but doesn't include the country fields in the CRM payload.

---

## Current Data Flow

```text
emma-chat extracts:     Frontend receives:      send-emma-lead builds:    register-crm-lead expects:
- country_prefix        - country_prefix        - countryPrefix           - countryPrefix
- country_name          - country_name          - (missing)               - countryName
- country_code          - country_code          - (missing)               - countryCode  
- country_flag          - country_flag          - (missing)               - countryFlag
```

---

## Changes Required

### 1. Update send-emma-lead Interface (lines 39-55)

Add country fields to the `contact_info` interface:

```typescript
interface LeadPayload {
  contact_info: {
    first_name: string;
    last_name: string;
    phone_number: string;
    country_prefix: string;
    country_name?: string;      // NEW
    country_code?: string;      // NEW
    country_flag?: string;      // NEW
  };
  // ... rest unchanged
}
```

### 2. Update CRM Payload in registerInCRM (lines 197-239)

Add the three new country fields to `crmPayload`:

```typescript
const crmPayload = {
    // Contact info
    firstName: payload.contact_info.first_name,
    lastName: payload.contact_info.last_name,
    phone: payload.contact_info.phone_number,
    countryPrefix: payload.contact_info.country_prefix,
    countryName: payload.contact_info.country_name || "Unknown",    // NEW
    countryCode: payload.contact_info.country_code || "XX",          // NEW
    countryFlag: payload.contact_info.country_flag || "🌍",          // NEW
    
    // ... rest unchanged
};
```

### 3. Update emma_leads Update (updateLeadRecord, lines 112-167)

Add country fields to the emma_leads update:

```typescript
const updateData: Record<string, any> = {
    first_name: payload.contact_info.first_name,
    last_name: payload.contact_info.last_name,
    phone_number: payload.contact_info.phone_number,
    country_prefix: payload.contact_info.country_prefix,
    country_name: payload.contact_info.country_name || null,    // NEW
    country_code: payload.contact_info.country_code || null,    // NEW
    country_flag: payload.contact_info.country_flag || null,    // NEW
    // ... rest unchanged
};
```

---

## Frontend Update Required (EmmaChat.tsx)

The frontend also needs to pass the country fields in the unified payload. Currently at lines 1270-1275:

```typescript
contact_info: {
    first_name: fields.name || fields.first_name || '',
    last_name: fields.family_name || fields.last_name || '',
    phone_number: fields.phone || fields.phone_number || '',
    country_prefix: fields.country_prefix || '',
    country_name: fields.country_name || '',      // ADD
    country_code: fields.country_code || '',      // ADD
    country_flag: fields.country_flag || ''       // ADD
},
```

Also update the `beaconPayload` (around lines 251-258) for browser close handling.

---

## Complete Data Flow After Fix

```text
User enters phone:     emma-chat extracts:     Frontend passes:        send-emma-lead:         register-crm-lead:
+32 471 234 567   -->  country_name: Belgium   country_name: Belgium   countryName: Belgium    country_name: Belgium
                       country_code: BE        country_code: BE        countryCode: BE         country_code: BE
                       country_flag: 🇧🇪        country_flag: 🇧🇪        countryFlag: 🇧🇪         country_flag: 🇧🇪
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/send-emma-lead/index.ts` | Add country fields to interface, CRM payload, and DB update |
| `src/components/landing/EmmaChat.tsx` | Add country fields to `contact_info` in unified payload and beacon payload |

