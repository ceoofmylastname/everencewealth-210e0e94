

# Fix: Edit Agent Form Not Saving Changes

## Problem Identified

The form fails silently when the admin tries to save because of a **validation constraint mismatch**:

| Field | Validation Rule | User's Value | Result |
|-------|-----------------|--------------|--------|
| `max_active_leads` | `.max(200)` | 500 | Validation fails |

The Zod schema in `crm-validations.ts` restricts `max_active_leads` to a maximum of 200:

```typescript
max_active_leads: z.number().min(1).max(200).default(50),
```

But the user is trying to set it to 500. The form validation fails, but **no error message is shown** because the `max_active_leads` field doesn't render validation errors in the UI.

---

## Solution

### 1. Increase the Max Leads Limit

Update `src/lib/crm-validations.ts` to allow higher lead limits (up to 1000):

```typescript
// Before
max_active_leads: z.number().min(1).max(200).default(50),

// After  
max_active_leads: z.number().min(1).max(1000).default(50),
```

### 2. Add Error Display for Max Active Leads Field

Update `src/components/crm/EditAgentModal.tsx` to show validation errors:

```typescript
<div className="space-y-2">
  <Label htmlFor="max_active_leads">Max Active Leads</Label>
  <Input
    id="max_active_leads"
    type="number"
    {...register("max_active_leads", { valueAsNumber: true })}
  />
  {errors.max_active_leads && (
    <p className="text-sm text-destructive">{errors.max_active_leads.message}</p>
  )}
</div>
```

### 3. Also Update AddAgentModal

For consistency, add the same error display to `src/components/crm/AddAgentModal.tsx`.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/crm-validations.ts` | Increase `max_active_leads` max value from 200 to 1000 |
| `src/components/crm/EditAgentModal.tsx` | Add validation error display for max_active_leads |
| `src/components/crm/AddAgentModal.tsx` | Add validation error display for max_active_leads |

---

## Why This Fixes the Issue

1. **Root cause**: Zod validation silently rejects values > 200
2. **The fix**: Increase limit to 1000 to accommodate business needs
3. **Bonus**: Show error messages so admins know when validation fails

After this fix, the "Save Changes" button will work correctly for values up to 1000.

