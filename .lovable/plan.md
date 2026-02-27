

## Analysis of Contracting Messages

### Current State

**RLS policies are correct** — they already allow:
- Agents: see/send in their own thread
- Managers: see/send in threads of agents assigned to them (`manager_id = portal_users.id`)
- Admins/contracting: see/send in ALL threads

**What's broken or missing:**

1. **Build error** — `approve-agent/index.ts` and `contracting-intake/index.ts` use `import { Resend } from "npm:resend@4.0.0"` which doesn't resolve. Other functions use `https://esm.sh/resend@2.0.0`. Fix the import.

2. **Agent view is too limited** — Agents (`!canViewAll`) are hardcoded to only see their own thread. They cannot see or message their manager. They should be able to see threads involving them (their own thread + any thread where they're a participant).

3. **Manager filtering missing** — Managers see ALL threads (same as admin) because `canViewAll` is true. They should only see threads for agents assigned to them (where `manager_id = their portal_users.id`), unless they're also admin.

4. **"No conversations" for admin** — The screenshot shows the admin seeing "No conversations." This is likely because no contracting messages have been sent yet, not a code bug. The fetch logic and RLS both support admin visibility.

### Plan

#### 1. Fix Resend build error
- **`supabase/functions/approve-agent/index.ts`** — Change `import { Resend } from "npm:resend@4.0.0"` to `import { Resend } from "https://esm.sh/resend@2.0.0"`
- **`supabase/functions/contracting-intake/index.ts`** — Same fix

#### 2. Improve agent messaging experience
- **`ContractingMessages.tsx`** — For agents (`!canViewAll`):
  - Fetch their manager's contracting agent ID from the DB
  - Show a simple thread list: "My Thread" (their own) + "Manager: [Name]" (their manager's thread where they can message)
  - Allow agents to toggle between their own thread and messaging their manager
  - The RLS INSERT policy already allows agents to post in their own thread (`thread_id = own ID`), and the manager sees it there

#### 3. Filter manager threads
- For managers who are NOT admin: filter `fetchThreads` to only show threads where the thread agent's `manager_id` matches the current user's `portal_users.id`

#### 4. Admin access (already works)
- Admins can already see all threads and message any agent via "New Message" dialog. No changes needed beyond ensuring `canManage` is correctly true.

### Files to modify
- `supabase/functions/approve-agent/index.ts` — fix Resend import
- `supabase/functions/contracting-intake/index.ts` — fix Resend import
- `src/pages/portal/advisor/contracting/ContractingMessages.tsx` — improve agent view with manager thread, filter manager threads

