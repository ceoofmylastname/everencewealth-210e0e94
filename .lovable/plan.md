

## Problem

The slot being booked is already marked `is_booked = true` in the database. The edge function returns HTTP 409 with `{"error": "This time slot is no longer available."}`, but `supabase.functions.invoke()` treats any non-2xx as a generic error and doesn't pass through the response body message.

## Fix

**File: `src/components/socorro/RegistrationForm.tsx`** — Change the error handling to extract the actual error message from the edge function response:

```typescript
const { data, error: fnErr } = await supabase.functions.invoke(
  "register-socorro-booking",
  { body: { ... } }
);

// supabase.functions.invoke returns the parsed body in `data` even on non-2xx
// but sets `fnErr` with a generic message. Check `data.error` first.
if (data?.error) throw new Error(data.error);
if (fnErr) throw new Error(fnErr.message);
```

The fix is simply swapping the order: check `data?.error` before `fnErr`, since `data` contains the actual descriptive error from the edge function (e.g., "This time slot is no longer available"), while `fnErr` only has the generic SDK message.

Additionally, the specific slot the user is testing with is already booked. They need to either:
- Use a different available slot
- Or we unbook it in the database for re-testing

No other changes needed. The edge function itself is working correctly.

