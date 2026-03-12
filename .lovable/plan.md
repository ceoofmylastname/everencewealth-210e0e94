

## Fix: Flatten GHL Webhook Payload

The current edge function sends a nested payload to the GHL webhook:
```json
{
  "attendee": { "first_name": ..., "email": ... },
  "booking": { "advisor_id": ..., "selected_date": ... }
}
```

The user wants a flat structure matching what they showed:
```json
{
  "event": "workshop_registration",
  "source": "socorro_isd_workshop_march2025",
  "first_name": "sue",
  "last_name": "mills",
  "email": "...",
  "phone": "...",
  "advisor_id": "...",
  "advisor_name": "...",
  "selected_date": "...",
  "selected_time": "...",
  "timestamp": "..."
}
```

### Change
**File:** `supabase/functions/register-socorro-booking/index.ts` (lines 155-166)

Replace the nested `attendee`/`booking` objects with flat top-level fields, then redeploy the edge function.

