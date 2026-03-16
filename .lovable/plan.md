

## Fix: underwriting-process FormData mismatch

### Root Cause
- **Frontend** sends JSON: `{ carrier_name, file_name, file_base64 }` via `supabase.functions.invoke()`
- **Edge function** calls `req.formData()` expecting multipart form data
- Result: `TypeError: Body can not be decoded as form data`

### Fix (edge function only, one file)

Update `supabase/functions/underwriting-process/index.ts` to parse JSON instead of FormData:

1. Replace `req.formData()` + `formData.get(...)` (lines ~48-55) with `req.json()` to extract `carrier_name`, `file_name`, and `file_base64`
2. Decode the base64 string back to a `Uint8Array` / `Blob` for the LlamaParse upload
3. Reconstruct a `FormData` with the decoded blob only for the LlamaParse API call (which still needs multipart)
4. Use `file_name` from JSON instead of `file.name`

No frontend changes needed — the frontend payload format is fine.

### Affected file
- `supabase/functions/underwriting-process/index.ts` — change request parsing from formData to JSON+base64 decode

