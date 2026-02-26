

## Current State

| Person | Auth Email | Portal Role | Contracting Record | CRM (user_roles) |
|--------|-----------|-------------|-------------------|-------------------|
| **David** | david.rosenberg@everencewealth.com (`c6fd1541`) | admin | Jazmine's record is linked to his auth ID; `contracting_role: agent` | None |
| **Steven** | srosenberg@everencewealth.com (`239045d7`) | admin | None | None |
| **Jazmine** | jrosenberg@everencewealth.com (`54ae359b`) | advisor | No record linked to her own auth ID | None |

### Problems Identified

1. **Jazmine and David are sharing a login**: The contracting_agents record for Jazmine (email `jrosenberg@everencewealth.com`) has `auth_user_id = c6fd1541` which is **David's** auth account. Jazmine has her own separate auth account (`54ae359b`) but nothing in contracting points to it.

2. **David and Steven lack full admin access**: Neither has a `user_roles` entry (needed for CRM/blog admin). David's contracting role is `agent` instead of `admin`. Steven has no contracting record at all.

---

## Changes Required

### 1. Separate Jazmine from David (data fix)
- Update the contracting_agents record (`cbff6acb-...`) to point `auth_user_id` to Jazmine's own auth account (`54ae359b-d3c1-4445-93e0-aef8aff8df13`) instead of David's.

### 2. Give David full admin access
- Update his contracting_agents `contracting_role` from `agent` to `admin`.
- Insert a `user_roles` record granting him the `admin` role (for CRM/blog access).

### 3. Give Steven full admin access
- Insert a `user_roles` record granting him the `admin` role (for CRM/blog access).
- No contracting record exists for Steven — he can be added if needed, or his portal admin status already grants contracting oversight.

All changes are data updates only — no code or schema modifications needed.

