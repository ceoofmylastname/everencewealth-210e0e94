## Why "No CNAs found" appears

The CNA picker is filtering by the wrong identity.

- `CNAForm.tsx` saves new CNAs with `advisor_id = portalUser.id` (i.e. `portal_users.id`).
- `ContactCNAsTab.tsx` receives `advisorId` from `useCurrentAdvisorId()`, which returns `advisors.id` (a different UUID for the same user).

So the picker query `client_needs_analysis.advisor_id = <advisors.id>` never matches any rows — every CNA in the table is keyed by `portal_users.id`. I confirmed this in the database (e.g. CNAs are stored under `e4ec821e-...` which is the portal_users.id for david.rosenberg, while `advisors.id` is `91a5b531-...`).

## Fix

Change `ContactCNAsTab.tsx` so the picker queries CNAs by the current `portalUser.id` instead of the advisor row id.

1. In `ContactDetail.tsx`, also pull `portalUser` from `usePortalAuth()` (or extend the existing call) and pass `portalUserId={portalUser.id}` into `<ContactCNAsTab>`.
2. In `ContactCNAsTab.tsx`:
   - Add a `portalUserId` prop.
   - In `CNAPicker`, replace `.eq("advisor_id", advisorId)` with `.eq("advisor_id", portalUserId)` so it matches how CNAs are actually saved.
   - Leave the linked-list query (which filters by `contact_id`) untouched.

The `advisorId` prop can stay for the existing `isOwned`/link checks elsewhere; only the picker query changes.

## Out of scope

I won't touch `CNAForm.tsx` or migrate existing CNA rows to use `advisors.id`. That's a larger normalization that would also need RLS review. Let me know if you want that as a follow-up.
