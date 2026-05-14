# Mobile optimization — Contacts module

Goal: make every screen we just shipped under Contacts feel native on phones (≤640px) — no horizontal page scroll, readable typography, 44px tap targets, stacked toolbars, card-based lists instead of wide tables. Desktop layouts stay identical.

## Scope (files to touch — presentation only)

- `src/pages/portal/advisor/contacts/ContactsList.tsx`
- `src/pages/portal/advisor/contacts/ContactDetail.tsx`
- `src/pages/portal/advisor/contacts/ContactForm.tsx`
- `src/pages/portal/advisor/contacts/ContactImport.tsx`
- `src/pages/portal/advisor/contacts/ContactCustomFields.tsx`
- `src/components/portal/contacts/ContactPoliciesTab.tsx`
- `src/components/portal/contacts/ContactCNAsTab.tsx`
- `src/components/portal/contacts/ContactNotesTab.tsx`
- `src/components/portal/contacts/ContactAppointmentsTab.tsx`
- `src/components/portal/contacts/ContactRemindersTab.tsx`
- `src/components/portal/contacts/ContactDocumentsTab.tsx`
- `src/components/portal/contacts/ContactAssociationsTab.tsx`
- `src/components/portal/contacts/ContactCustomFieldsTab.tsx`
- `src/components/portal/contacts/ContactPickerDialog.tsx`

No DB, no business logic, no route changes.

## Page-by-page changes

**ContactsList**
- Page padding `p-4 md:p-6`; header switches `flex-col gap-3 md:flex-row md:items-center md:justify-between`.
- Action buttons become full-width on mobile in a 3-up row using `flex-1`; icons + short labels (hide "Custom Fields"/"Import CSV" text behind `hidden sm:inline`, keep icon).
- Filter row: search + stage select stack `flex-col sm:flex-row`; select gets `h-10` for tap target.
- Replace the `<table>` with: `<div className="hidden md:block">` wrapping the existing table, plus a mobile card list `<div className="md:hidden space-y-2">` rendering each contact as a tappable card (avatar, name, email, phone, stage chip, tag chips wrapped).

**ContactDetail**
- Container `p-4 md:p-6`.
- Header card: stack identity block above Edit/Delete actions on mobile (`flex-col gap-4 md:flex-row md:items-start md:justify-between`); Edit/Delete row `w-full md:w-auto justify-end`.
- Title `text-xl md:text-2xl`.
- Tabs row already uses `overflow-x-auto`; add `-mx-4 px-4 md:mx-0 md:px-0` so it edge-bleeds on mobile, and `scrollbar-none` utility (or inline style) to hide bar.
- `OverviewTab` Row grid: `grid-cols-1 md:grid-cols-3` so label sits above value on mobile.

**ContactForm**
- All `grid-cols-2` and `grid-cols-4` blocks become `grid-cols-1 sm:grid-cols-2` / `grid-cols-2 sm:grid-cols-4`.
- Footer buttons: `flex-col-reverse sm:flex-row sm:justify-end`, both `w-full sm:w-auto`.
- Container `p-4 md:p-6`.

**ContactImport**
- Stepper/columns reflow to single column on mobile; preview table wrapped in `overflow-x-auto` with `min-w-[640px]`; primary buttons full-width on mobile.

**ContactCustomFields**
- Form rows stack `grid-cols-1 sm:grid-cols-[…]`; existing field list rows become cards on mobile (label/value stacked, delete button right-aligned).

**Tab components (Policies, CNAs, Notes, Appointments, Reminders, Documents, Associations, CustomFields)**
- Replace any inner table with the same desktop-table-+-mobile-card pattern.
- Toolbar action rows: stack `flex-col sm:flex-row`, primary button `w-full sm:w-auto`.
- Quick-add forms (Policies "Quick policy", Notes textarea, etc.): inputs full width, submit button full width on mobile.
- Linked Policies / CNAs rows: on mobile show carrier/product on line 1, status + premium on line 2, action buttons in their own row with `w-full` split (`flex gap-2`).
- Reminders/Appointments date+time inputs: `grid-cols-1 sm:grid-cols-2`.
- Document upload: file input + upload button stack on mobile; document list rows wrap with filename truncation (`truncate min-w-0`).

**ContactPickerDialog**
- DialogContent: `max-w-md w-[calc(100vw-2rem)] sm:w-full`; results list `max-h-[60vh] overflow-y-auto`; each result row min-h 56px with name/email stacked.

## Shared rules applied everywhere

- Min tap target 44px: any icon-only `Button size="icon"` gets `min-h-11 min-w-11`.
- No fixed widths; all containers use `max-w-…` + `w-full`.
- Replace any horizontal-only `flex` toolbar with `flex flex-wrap gap-2` or `flex-col sm:flex-row`.
- Truncate long emails/names with `truncate min-w-0` inside flex.
- Keep existing colors, fonts, and the Evergreen `#1A4D3E` button color — purely layout/spacing changes.

## QA after implementation

Resize preview to 390×844 and walk: Contacts list → tap contact → cycle through all 9 tabs → Edit form → Add Contact → Import CSV → Custom Fields settings → open ContactPickerDialog from Policies and CNAs. Verify: no horizontal scroll on the page (only inside intentional `overflow-x-auto` wrappers), all primary actions reachable with thumb, tabs scroll smoothly, no clipped text.
