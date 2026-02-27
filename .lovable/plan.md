

## Problem

The send button doesn't work because admin users without a `contracting_agents` record have `myAgentId = undefined`. The `handleSend` function silently exits at the guard check `if (!myAgentId) return`. Two of the three admin portal users (David Rosenberg, Steven Rosenberg) have no `contracting_agents` row.

## Fix

**1. Auto-provision contracting_agents rows for admins** — In `ContractingMessages.tsx`, add an `ensureContractingAgent()` function that runs on mount for admin users. If `contractingAgent` is null but `portalUser` exists with admin role, auto-insert a `contracting_agents` row with `contracting_role: 'admin'` and `pipeline_stage: 'completed'`, then re-fetch.

**2. Add error feedback** — Wrap the insert in `handleSend` with a toast error if it fails, so the user sees feedback instead of silent failure.

### Files
- `src/pages/portal/advisor/contracting/ContractingMessages.tsx` — add auto-provisioning logic in a `useEffect` for admins missing a contracting_agents record, add toast error on send failure

### Alternative considered
Could insert rows via a migration, but that only covers current admins. Auto-provisioning handles future admins too.

