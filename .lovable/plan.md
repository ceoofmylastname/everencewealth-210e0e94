

## Plan: Add "Contact Submissions" Tab to Admin Agents Page

### What it does
Adds a new tab on `/portal/admin/agents` called "Contact Leads" that displays all submissions from the `/en/contact` and `/es/contact` forms. Admins can view name, email, phone, subject, message, language, source, and submission date in a searchable, filterable table.

### Technical Changes

**1. Create `src/components/portal/admin/ContactLeadsTab.tsx`**
- New component that queries the `leads` table filtered by `source = 'contact_page'`
- Displays a table with columns: Name, Email, Phone, Language, Subject (parsed from comment), Message, Date
- Includes search (by name/email) and language filter
- Shows submission count in the tab badge
- Expandable message preview (truncated in table, full on click)

**2. Modify `src/pages/portal/admin/AdminAgents.tsx`**
- Import the new `ContactLeadsTab` component
- Add a 4th tab trigger: "Contact Leads" with a count badge (like Pending tab)
- Add corresponding `TabsContent` rendering `<ContactLeadsTab />`
- Add `MessageSquare` icon from lucide-react

### Data Source
The `leads` table already stores contact form submissions with `source = 'contact_page'`. No database changes needed — this is purely a read-only admin view of existing data.

### No new RLS policies needed
The admin already has access to the `leads` table through existing policies.

