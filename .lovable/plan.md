

# Fix: Recruits Can't Log In After Applying

## The Problem

When a recruit submits the `/apply` form, the backend creates:
1. An auth user (login credentials)
2. A `contracting_agents` record (their onboarding data)

But it does **NOT** create a `portal_users` record. The login page at `/portal/login` checks `portal_users` to determine the user's role and where to send them. Since there's no record, the recruit sees: **"Account setup incomplete. Please contact support."**

They can never reach the contracting/onboarding dashboard.

## The Fix (2 changes)

### 1. Edge Function -- Create a `portal_users` record on signup

In `supabase/functions/contracting-intake/index.ts`, after creating the `contracting_agents` record, also insert a row into `portal_users` with:
- `auth_user_id` = the new auth user's ID
- `email` = recruit's email
- `full_name` = first + last name
- `role` = `"advisor"` (this is how the system identifies portal users who should route to the advisor/contracting side)
- `is_active` = `true`

### 2. Login Page -- Route new agents to contracting dashboard

In `src/pages/portal/PortalLogin.tsx`, after login, check if the user has a `contracting_agents` record. If they do and their pipeline stage is not `"active"`, route them to `/portal/advisor/contracting/dashboard` (the onboarding step-by-step) instead of the general advisor dashboard.

This ensures recruits land directly on the onboarding checklist after logging in, not the client dashboard or the general advisor dashboard.

## Technical Details

### Edge Function Change (`contracting-intake/index.ts`)
After the `contracting_agents` insert (around line 118), add:

```
await adminClient.from("portal_users").insert({
  auth_user_id: authUserId,
  email: email.toLowerCase(),
  full_name: `${first_name} ${last_name}`,
  role: "advisor",
  is_active: true,
});
```

### Login Page Change (`PortalLogin.tsx`)
After the `portal_users` role check (around line 73), add a secondary check:

```
// If advisor/admin, check if they're a contracting agent in onboarding
if (portalUser.role === "advisor" || portalUser.role === "admin") {
  const { data: contractingAgent } = await supabase
    .from("contracting_agents")
    .select("pipeline_stage")
    .eq("auth_user_id", authData.user.id)
    .maybeSingle();

  if (contractingAgent && contractingAgent.pipeline_stage !== "active") {
    navigate("/portal/advisor/contracting/dashboard", { replace: true });
  } else {
    navigate("/portal/advisor/dashboard", { replace: true });
  }
} else {
  navigate("/portal/client/dashboard", { replace: true });
}
```

## Result
After these changes:
1. A recruit submits the form and their portal account is created automatically
2. They log in at `/portal/login` with their chosen password
3. They land directly on the contracting onboarding dashboard with their step-by-step checklist
4. Once they complete onboarding and reach "active" status, they'll be routed to the regular advisor dashboard instead

