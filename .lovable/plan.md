

# Fix: Login Redirect Points to Non-Existent Route

## Problem
When a user (like Bobby) logs in and has an active contracting pipeline, the login page redirects them to `/portal/advisor/contracting/dashboard` -- but that route does not exist. The actual route for the Contracting Dashboard is `/portal/advisor/contracting`. This causes the 404 error.

## Root Cause
In `src/pages/portal/PortalLogin.tsx` (line 95), the redirect path is wrong:
```tsx
navigate("/portal/advisor/contracting/dashboard", { replace: true });
```
The correct path should be `/portal/advisor/contracting`, which matches the route defined in `App.tsx` (line 395).

## Fix

**File: `src/pages/portal/PortalLogin.tsx` (line 95)**

Change:
```tsx
navigate("/portal/advisor/contracting/dashboard", { replace: true });
```
To:
```tsx
navigate("/portal/advisor/contracting", { replace: true });
```

This is a one-line fix. No other files need to change.

