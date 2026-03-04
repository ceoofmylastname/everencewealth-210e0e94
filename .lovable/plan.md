

## Fix: Registration Edge Function Failing

**Root Cause**: The `register-training-event` edge function is not listed in `supabase/config.toml`. Without an entry, JWT verification defaults to `true`, which can cause auth failures. More importantly, the function may not be deployed at all since it's not registered in the config.

### Changes

**1. Add function entry to `supabase/config.toml`**

Add `verify_jwt = false` for `register-training-event` since this is a public registration form that unauthenticated users need to access:

```toml
[functions.register-training-event]
verify_jwt = false
```

This single change should resolve the "Failed to send a request to the Edge Function" error by ensuring the function is properly deployed and accessible without authentication.

