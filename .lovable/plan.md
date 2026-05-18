## Goal

On `/portal/advisor/contacts`, keep the manager's own contacts strictly separated from contacts owned by agents they manage. No merged list, no shared counts.

## Current behavior

A single contacts list with a "Viewing contacts for" dropdown that swaps the active advisor. Functionally separate (each fetch is scoped to one `advisor_id`), but visually it lives on the same page, which makes it feel like the manager's own book and the managed agents' books are part of the same view.

## New UX

Add a top-level tab strip on `/portal/advisor/contacts` (only for users who manage at least one agent — regular advisors see no tabs and no change):

```text
[ My Contacts ]  [ Team Contacts ]
```

- **My Contacts** (default) — exactly the manager's own contacts. Same create/edit/delete behavior they have today. No managed-agent rows ever appear here.
- **Team Contacts** — read-only view of contacts owned by agents the manager manages. Inside this tab, an "Agent" dropdown picks which managed agent's book to view (same dropdown that exists today, just moved into this tab). Header shows "Viewing {Agent name}'s contacts (read-only)". Create/Edit/Delete hidden.

Switching tabs fully resets the query — the two tabs never share state, never share a list, and the contact count badge on each tab reflects only that tab's scope.

### Contact detail page

`ContactDetail.tsx` keeps its existing owned-vs-read-only logic. We add a small back-link breadcrumb that returns the user to whichever tab they came from (`?from=team` vs default), so a manager viewing an agent's contact lands back on **Team Contacts** with the same agent selected.

## Out of scope

- No RLS / policy changes — the manager SELECT policies added in the previous migration already enforce the read-only access correctly.
- No changes to non-manager advisors' experience.
- No write access for managers on team contacts.
- No merged/combined view (explicitly rejected by this request).

## Files to change (frontend only)

- `src/pages/portal/advisor/contacts/ContactsList.tsx`
  - Replace the inline dropdown with a `Tabs` component (`My Contacts` / `Team Contacts`).
  - Tab visibility gated on `useManagedAdvisors().managed.length > 0`.
  - Move the agent-picker dropdown inside the `Team Contacts` tab only.
  - `viewAdvisorId` state: forced to the manager's own `advisorId` while on `My Contacts`; equals the selected managed agent's id while on `Team Contacts`.
  - Persist active tab + selected agent in URL params (`?tab=team&agent=<id>`) so refresh and back-links work.
- `src/pages/portal/advisor/contacts/ContactDetail.tsx`
  - Read `?from=team&agent=<id>` and use it for the back link target.
- No changes to `useManagedAdvisors`, RLS, or any other contact subpages (custom fields, form, etc.) — they continue to operate on whichever `advisor_id` is in scope.
