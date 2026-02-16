

## Client Policy Detail Page

### Overview
Create a detail page at `/portal/client/policies/:id` that shows comprehensive policy information when a client clicks on a policy card from the policies list.

### Files to Create

**1. `src/pages/portal/client/ClientPolicyDetail.tsx`**

A full detail page with these sections:

- **Header**: Back button to `/portal/client/policies`, carrier name, policy number, status badge
- **Policy Overview Card**: Product type, death benefit, cash value, monthly premium, premium frequency, issue date, maturity date
- **Beneficiaries Section**: Parsed from the `beneficiaries` JSON column on the policies table. Displayed as a list/table with name and relationship (or whatever fields exist in the JSON). Shows "No beneficiaries listed" if null/empty.
- **Riders Section**: Parsed from the `riders` JSON column. Displayed as a list of rider names/descriptions. Shows "No riders on this policy" if null/empty.
- **Policy Documents Section**: Fetched from `portal_documents` table filtered by `policy_id` and `is_client_visible = true`. Each document shows file name, type, size, and a download link. Shows "No documents available" if empty.
- **Agent Contact Card**: Fetched by joining the policy's `advisor_id` to `portal_users` (via the client's `advisor_id` field). Shows advisor name, email, phone, and avatar.
- **"Message My Advisor" Button**: Links to `/portal/client/messages` to open the existing messaging interface.

Data fetching:
```typescript
// Fetch policy with advisor info
const { data: policy } = await supabase
  .from("policies")
  .select("*")
  .eq("id", policyId)
  .eq("client_id", portalUser.id)
  .single();

// Fetch advisor from portal_users
const { data: advisor } = await supabase
  .from("portal_users")
  .select("first_name, last_name, email, phone, avatar_url")
  .eq("id", portalUser.advisor_id)
  .single();

// Fetch documents for this policy
const { data: documents } = await supabase
  .from("portal_documents")
  .select("*")
  .eq("policy_id", policyId)
  .eq("is_client_visible", true)
  .order("created_at", { ascending: false });
```

Note: There is no separate `premium_payments` table in the database. The premium information (amount and frequency) is stored directly on the policy record, so a "Premium Payment History" section cannot be built without a new table. Instead, the page will display the current premium details prominently. A note will be added about this limitation.

### Files to Modify

**2. `src/pages/portal/client/ClientPolicies.tsx`**
- Wrap each policy card in a `<Link to={/portal/client/policies/${p.id}}>` so clicking navigates to the detail page.
- Add a subtle "View Details" indicator (chevron icon or text).

**3. `src/App.tsx`**
- Add lazy import for `ClientPolicyDetail`
- Add route: `<Route path="policies/:id" element={<ClientPolicyDetail />} />` inside the client routes block (after the existing `policies` route on line 347)

### Styling
- Follows existing portal patterns: `text-foreground`, `text-muted-foreground`, Card/CardContent components, Playfair Display headings
- Responsive grid layout (single column on mobile, two columns on desktop for side-by-side sections)

### No database changes required
All data already exists in the `policies`, `portal_documents`, and `portal_users` tables. The `beneficiaries` and `riders` JSON columns on `policies` are already available. RLS policies already restrict clients to their own data.

### Premium Payment History - Limitation
The database does not have a `premium_payments` or payment history table. To add this in the future, a new table would need to be created. For now, the detail page will show the current premium amount and frequency from the policy record.
