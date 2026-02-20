

# Fix Client Select Dropdown + Add Realtime Policy Sync

## Issues Found

### Issue 1: Client Select might show empty
The query on line 64 of `PolicyForm.tsx` filters `portal_users` by `.eq("advisor_id", portalUser!.id)`. This is correct -- `portal_users.advisor_id` stores the advisor's `portal_user_id`, and `portalUser.id` is exactly that. The dropdown works if the advisor has assigned clients. No code fix needed here, but worth verifying your test advisor has clients.

### Issue 2: No realtime sync to client portal
The `policies` table is already added to `supabase_realtime` publication, but the client's policy list page does not subscribe to Postgres changes. When an advisor creates a policy, the client must manually refresh to see it.

## The Fix

Update the client's policies page to subscribe to realtime changes on the `policies` table, so new policies appear instantly without a refresh.

### File: Client policies list page (likely `src/pages/portal/client/ClientPolicies.tsx` or similar)

Add a Supabase realtime subscription:

```typescript
useEffect(() => {
  const channel = supabase
    .channel('client-policies')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'policies',
        filter: `client_id=eq.${portalUser?.id}`,
      },
      () => {
        // Re-fetch policies when any change occurs
        fetchPolicies();
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [portalUser?.id]);
```

This means when the advisor clicks "Create Policy," the client's portal will update within seconds -- no refresh needed.

## Summary

- **Client Select dropdown**: Working correctly. If empty, it means the logged-in advisor has no active clients assigned.
- **Realtime sync**: Needs a subscription added to the client policies page. The database-level realtime is already enabled; only the frontend listener is missing.

## Files Changed

- Client policies list page -- add realtime subscription to auto-refresh when policies are inserted/updated/deleted

