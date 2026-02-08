
# Plan: Add "Back to Admin Dashboard" Button for Admins

## Current Situation

When an admin clicks "My Dashboard", "My Leads", or "My Calendar" from the admin sidebar, they navigate to the agent dashboard. However, there's no visible way to return to the admin dashboard - they would need to manually type the URL or use browser back.

| Current State | Issue |
|---------------|-------|
| Admin visits `/crm/agent/dashboard` | No button to return to admin area |
| Regular agents visit same route | Should NOT see any admin button |

---

## Solution

Add a prominent "Back to Admin Dashboard" button in the `CrmAgentLayout` header that:
- Only appears when the logged-in user has `role === "admin"`
- Provides quick navigation back to `/crm/admin/dashboard`
- Uses distinctive styling (shield icon + different color) to stand out

---

## Implementation

### File to Modify

**`src/components/crm/CrmAgentLayout.tsx`**

### Changes

1. **Check the agent's role** - The component already fetches the full agent record including `role`

2. **Add conditional button** - Display "Admin Dashboard" button only when `agent?.role === "admin"`

3. **Button placement** - Add it in the header navigation area, visible on both desktop and mobile

4. **Icon** - Use `Shield` icon (consistent with admin verification in sidebar)

---

## Visual Placement

### Desktop Header

```text
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Del Sol CRM │ Dashboard │ My Leads │ Calendar │ [Admin ↩] │ [...] │ [Profile] │
└─────────────────────────────────────────────────────────────────────┘
                                                           ▲
                                                    New button here
                                                    (only for admins)
```

### Mobile

- The button will appear in the header actions area
- Also accessible via the profile dropdown menu

---

## Code Changes

### 1. Add Shield import
```tsx
import { Shield } from "lucide-react";
```

### 2. Add conditional admin button in header (desktop)
After the desktop nav items, before the search:
```tsx
{agent?.role === "admin" && (
  <Link to="/crm/admin/dashboard">
    <Button variant="outline" size="sm" className="gap-2 border-amber-500 text-amber-600 hover:bg-amber-50">
      <Shield className="w-4 h-4" />
      Admin Dashboard
    </Button>
  </Link>
)}
```

### 3. Add to profile dropdown menu
Add an "Admin Dashboard" menu item that only appears for admins:
```tsx
{agent?.role === "admin" && (
  <>
    <DropdownMenuItem onClick={() => navigate("/crm/admin/dashboard")}>
      <Shield className="w-4 h-4 mr-2" />
      Admin Dashboard
    </DropdownMenuItem>
    <DropdownMenuSeparator />
  </>
)}
```

### 4. Add to mobile tablet menu
In the slide-down menu for tablets, add the admin link:
```tsx
{agent?.role === "admin" && (
  <Link to="/crm/admin/dashboard">
    <Button variant="outline" className="w-full justify-start gap-2 h-12 border-amber-500 text-amber-600">
      <Shield className="w-5 h-5" />
      Admin Dashboard
    </Button>
  </Link>
)}
```

---

## Security Consideration

The button visibility is controlled by checking `agent?.role === "admin"`. This is safe because:
- The role comes from the database query
- Even if someone manipulates the UI, the admin routes are protected by `CrmAdminRoute` which validates server-side
- Regular agents cannot access admin routes regardless of what the UI shows

---

## Summary

| User Type | Sees Button? | Can Access Admin Routes? |
|-----------|--------------|--------------------------|
| Admin | Yes | Yes |
| Regular Agent | No | No (blocked by route guard) |

After implementation, admins will have a clear, prominent way to switch back to their admin dashboard from anywhere in the agent view.
