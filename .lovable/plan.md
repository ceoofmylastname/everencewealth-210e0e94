

## Change Advisor Dropdown to Show First Name + Last Initial

### What changes
**File: `src/pages/portal/advisor/ClientInvite.tsx`** (line 229)

Change the `SelectItem` label from:
```
{a.first_name} {a.last_name} — {a.email}{a.isContracting && " (Contracting)"}
```
To:
```
{a.first_name} {a.last_name?.charAt(0)}.{a.isContracting ? " (Contracting)" : ""}
```

This displays "Admin U." instead of "Admin User — jrmenterprisegroup@gmail.com". Single line change, dropdown only — the selected value display will also update automatically since it renders the same label.

