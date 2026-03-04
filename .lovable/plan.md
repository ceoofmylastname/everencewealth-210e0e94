

## Plan: Update Confirmation Email with Actual Venue Location

The email in `supabase/functions/register-training-event/index.ts` hardcodes "To Be Announced" for the location. The venue is Andaz Napa, which is already shown on the registration page.

### Change (line 73)

Replace:
```
📍 <strong>Location:</strong> To Be Announced
```
With:
```
📍 <strong>Location:</strong> Andaz Napa, 1450 First Street, Napa, CA 94559
```

Single line change in the edge function, which will be auto-deployed.

