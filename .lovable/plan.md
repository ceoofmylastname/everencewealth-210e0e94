
# Fix: "Advisor record not found" on Client Invite Page

## Root Cause

The `ClientInvite.tsx` page queries the `advisors` table using `portal_user_id = portalUser.id`. This works perfectly for users whose role is `advisor` — but the logged-in user here has role `admin`. Admin users have no row in the `advisors` table, so `advisorId` stays `null` and the toast fires.

The admin portal sidebar includes "Invite Client" in the advisor section, so an admin navigating there hits this dead end.

There are two distinct problems to solve:

### Problem 1 — Admin has no `advisors` row
The admin (`jrmenterprisegroup@gmail.com`) is not an advisor — they have no entry in `advisors`. When they try to send an invite, the page can't determine which advisor to associate the invitation with.

### Problem 2 — Advisors need their own invite page that works
The advisor-specific invite flow should continue working for actual advisors.

---

## The Fix

### For Admins: Route to the Admin Invite Flow
The admin already has a client invitation system in `AdminAgents.tsx` or a dedicated admin panel. The admin should use the **admin panel's invitation flow** rather than the advisor-specific page.

However, the most pragmatic fix is: **allow the advisor invite page to work for admins by letting them select which advisor to associate the invitation with**, OR redirect admins away from that page entirely.

The cleanest fix is to update `ClientInvite.tsx` to handle the case where the current user is an `admin` — in that case, show an advisor selector dropdown so the admin can pick which advisor the invitation is being sent on behalf of, then use that advisor's ID.

---

## Implementation Plan

### Change 1 — `src/pages/portal/advisor/ClientInvite.tsx`

**Current broken logic:**
```ts
const { data: advisor } = await supabase
  .from("advisors")
  .select("id")
  .eq("portal_user_id", portalUser!.id)  // ← admin has no advisors row
  .maybeSingle();
```

**New logic:**
- If `portalUser.role === "advisor"` → query `advisors` by `portal_user_id` (existing behavior, unchanged)
- If `portalUser.role === "admin"` → fetch all advisors and show a dropdown to pick one before submitting

**Specifically:**
1. After `init()`, check `portalUser.role`
2. If `admin`, load all advisors into a `advisorList` state array and show a `<select>` / `<Select>` dropdown in the form
3. The selected advisor's `id` becomes the `advisorId` used in the insert
4. The dropdown is hidden for advisor-role users (they always use their own ID)

### Change 2 — Form UX for Admin

Add an "Invite on behalf of" advisor selector that only renders when role is `admin`:

```tsx
{portalUser?.role === "admin" && (
  <div className="space-y-2">
    <Label>Advisor *</Label>
    <Select value={selectedAdvisorId} onValueChange={setSelectedAdvisorId}>
      <SelectTrigger>
        <SelectValue placeholder="Select advisor..." />
      </SelectTrigger>
      <SelectContent>
        {advisorList.map((a) => (
          <SelectItem key={a.id} value={a.id}>
            {a.first_name} {a.last_name} — {a.email}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)}
```

The `advisorId` used for the invite insert will be:
- `advisorId` (from their own `advisors` row) for advisor role
- `selectedAdvisorId` (from the dropdown) for admin role

### Validation

- If admin role and no advisor selected → show `toast.error("Please select an advisor")`
- If advisor role and no advisor row found → show a helpful message explaining the setup issue

---

## Files Changed

- `src/pages/portal/advisor/ClientInvite.tsx` — add admin-role handling with advisor selector dropdown

No database changes, no edge function changes needed.
