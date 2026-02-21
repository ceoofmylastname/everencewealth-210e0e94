

# Fix the Post-Application Journey + Add Apply Link

## Summary
Close the gap between form submission and dashboard access: send the recruit a welcome email with a password-set link, then redirect them to login. Also add the `/apply` link to both footers.

## Changes

### 1. Update the Edge Function (`contracting-intake`)
After creating the auth user and agent record:
- Use Resend (already configured as `RESEND_API_KEY`) to send a welcome email containing a magic link / password reset URL
- Generate the password reset link via `adminClient.auth.admin.generateLink({ type: 'recovery', email })` -- this gives a one-time link the recruit can use to set their own password
- The email includes: welcome message, their name, and a "Set Your Password" button linking to the recovery URL
- On the success screen, update the copy to say "Check your email to set your password and access your dashboard"

### 2. Update Success Screen (`ContractingIntake.tsx`)
After submission, instead of a dead-end "we'll reach out" message:
- Show "Check your email to set your password"
- Add a "Go to Login" button linking to `/portal/login`
- This makes the journey clear: apply -> check email -> set password -> login -> see agent dashboard

### 3. Add `/apply` Link to Homepage Footer
In `src/components/home/Footer.tsx`:
- Add "Become an Agent" link under the "Company" section (alongside About Us, Philosophy, Team, Careers)
- Links to `/apply`

### 4. Add `/apply` Link to Landing Footer
In `src/components/landing/Footer.tsx`:
- Add "Become an Agent" link in the footer links row

---

## Technical Details

### Edge Function Changes (`supabase/functions/contracting-intake/index.ts`)

After the agent record is created and activity is logged:

```text
1. Generate recovery link:
   adminClient.auth.admin.generateLink({ type: 'recovery', email, options: { redirectTo: '<site_url>/portal/login' } })

2. Send email via Resend:
   POST https://api.resend.com/emails
   {
     from: "Everence Wealth <onboarding@...>",
     to: email,
     subject: "Welcome to Everence Wealth - Set Your Password",
     html: styled email with "Set Your Password" button pointing to recovery link
   }

3. Return { success: true, agent_id, email_sent: true }
```

### Success Screen Changes (`ContractingIntake.tsx`)

Replace the current "we'll review" message with:
- Heading: "Application Submitted!"
- Body: "We've sent a welcome email to [email]. Click the link in the email to set your password and access your onboarding dashboard."
- Button: "Go to Login" -> navigates to `/portal/login`

### Footer Changes

**`src/components/home/Footer.tsx`** -- Add to Company links:
```text
{ label: 'Become an Agent', href: '/apply' }
```

**`src/components/landing/Footer.tsx`** -- Add link in bottom row:
```text
<a href="/apply">Become an Agent</a>
```

### No Database Changes Needed
The existing schema already supports this flow. The auth user + contracting_agents record are created; we just need to give the user a way to set their password and log in.

### Email Domain Consideration
The Resend email "from" address will need a verified domain. We should check what email domain is configured and use it. If none is configured, we'll use a fallback or prompt for setup.
