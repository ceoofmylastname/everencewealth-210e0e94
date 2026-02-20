

# Fix: Admin Can't See Clients on Clients Page

## Problem

The Clients page at `/portal/advisor/clients` always filters by `advisor_id = portalUser.id`. When you're logged in as Admin ("AU"), your portal_user ID is different from any advisor's ID, so no clients match -- the page shows "No clients yet."

In the database:
- Admin User (id: `e82dd92c...`) -- no clients assigned to this ID
- Advisor John Mel (id: `ce09b1a3...`) -- has client "jm mel" assigned
- Client "jm mel" has `advisor_id: ce09b1a3...` (points to John Mel, not Admin)

## Fix

Update `AdvisorClients.tsx` to check the user's role:
- **If admin**: load ALL active clients (no `advisor_id` filter), so admins see every client across all advisors
- **If advisor**: keep the existing filter (`advisor_id = portalUser.id`)

Also add the advisor's name to each client card so the admin knows which advisor each client belongs to.

## Technical Details

### File: `src/pages/portal/advisor/AdvisorClients.tsx`

In the `loadClients()` function, change the query:

```typescript
async function loadClients() {
  try {
    let query = supabase
      .from("portal_users")
      .select("*")
      .eq("role", "client")
      .eq("is_active", true)
      .order("last_name");

    // Admins see all clients; advisors see only their own
    if (portalUser!.role !== "admin") {
      query = query.eq("advisor_id", portalUser!.id);
    }

    const { data, error } = await query;
    if (error) throw error;
    setClients((data as PortalUser[]) ?? []);
  } catch (err) {
    console.error("Error loading clients:", err);
  } finally {
    setLoading(false);
  }
}
```

No database changes needed -- the admin RLS policy already grants full SELECT access to portal_users for admins.

## Files Changed

- `src/pages/portal/advisor/AdvisorClients.tsx` -- add role check to conditionally remove the `advisor_id` filter for admins
