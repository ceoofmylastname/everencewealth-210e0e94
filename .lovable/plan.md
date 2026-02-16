

## Enhanced Client Policy Detail Page

### What Already Exists
The page at `src/pages/portal/client/ClientPolicyDetail.tsx` (routed at `/portal/client/policies/:id`) already implements all 6 requested sections with working data fetching. This plan covers the styling and content enhancements needed to match the requirements.

### Changes to `src/pages/portal/client/ClientPolicyDetail.tsx`

**1. Add Breadcrumb Navigation**
- Replace the simple "Back to Policies" arrow link with a proper breadcrumb using the existing `Breadcrumb` component
- Format: Home > My Policies > [Product Type]
- Home links to `/portal/client/dashboard`, My Policies links to `/portal/client/policies`

**2. Apply Everence Brand Styling**
- Section headings use Evergreen (#1A4D3E) color
- Body text uses Slate (#4A5565)
- Page background set to Cream (#F0F2F1)
- Cards use white backgrounds with subtle shadow (`shadow-sm`)
- Status badges keep their existing color coding
- Product type badge added next to status badge in the header

**3. Enhance Beneficiaries Display**
- Show percentage allocation (from `b.percentage` or `b.Percentage` JSONB field) alongside name and relationship
- Three-column layout: Name | Relationship | Percentage

**4. Enhance Documents Display**
- Add upload date column showing formatted `created_at` date (e.g., "Jan 15, 2025")
- Already shows file name, type, and size -- upload date completes the requirement

**5. Split Policy Overview into two cards as requested**
- **Policy Overview Card**: carrier name, policy number, product type badge, status badge, issue date, maturity date
- **Coverage Details Card**: death benefit, cash value, premium amount and frequency

**6. Minor UI Polish**
- Advisor "Message Advisor" button uses Evergreen (#1A4D3E) background
- Card section headings use consistent Evergreen color via inline style

### Technical Details

- No database changes needed -- the `policies` table already has all required columns
- No new routes needed -- `/portal/client/policies/:id` is already registered in `App.tsx`
- Imports added: `Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator` from `@/components/ui/breadcrumb`, `Calendar` icon from lucide-react
- The `next_payment_due` field does not exist in the database schema, so it will be omitted (the table has no such column)
- Carrier logo is not stored in the database, so carrier name is shown as text (consistent with current implementation)

