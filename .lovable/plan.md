

## Problem

The "View all" link and individual client links in "Recent Clients" on the Advisor Dashboard navigate to `/portal/advisor/clients/:id`, but there is no `clients/:id` route defined — only `/portal/advisor/clients`. This causes a 404.

## Fix

**File: `src/pages/portal/advisor/AdvisorDashboard.tsx`**

Change the individual client `<Link>` elements from `/portal/advisor/clients/${c.id}` to `/portal/advisor/clients` so they navigate to the clients list page instead of a non-existent detail page.

The "View all" link already points to `/portal/advisor/clients` and is correct.

