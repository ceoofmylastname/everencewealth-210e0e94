

# Phase 1: Portal Foundation -- Database, Auth, and Login

This is the first phase of the Client & Agent Portal system. We will lay the foundation with database tables, authentication, and a login page. Subsequent phases will add dashboard features, policies, documents, and invitations.

## What Gets Built in Phase 1

### 1. Database Schema (6 new tables + 1 alter)

**portal_users** -- Central user table for both clients and advisors
- id (UUID, PK)
- auth_user_id (UUID, references auth.users, unique)
- role: 'client' | 'advisor' | 'admin'
- first_name, last_name, email, phone, avatar_url
- advisor_id (self-referencing FK for clients linked to their advisor)
- is_active, created_at, updated_at

**advisors** -- Extended advisor profile (linked to portal_users)
- id (UUID, PK)
- auth_user_id (UUID, references auth.users, unique)
- portal_user_id (FK to portal_users)
- first_name, last_name, email, phone
- title, bio, photo_url, license_number
- specializations (TEXT[]), languages (TEXT[])
- is_active, created_at, updated_at

**policies** -- Client policy records
- As specified in the spec (client_id FK to portal_users, advisor_id FK to advisors)
- All fields: carrier_name, policy_number, product_type, status, death_benefit, cash_value, etc.

**client_invitations** -- Advisor-sent client invites
- As specified (advisor_id FK to advisors, email, token, status, expiry)

**agent_resources** -- Professional tools and documents for advisors
- As specified (title, resource_type, category, file_url, etc.)

**carriers** -- Insurance carrier directory
- As specified (carrier_name, logo, AM Best rating, products, etc.)

**notifications** -- Portal notifications
- As specified (user_id FK to portal_users, title, message, type, read status)

**documents table** -- Add 3 columns to existing or create new portal_documents table
- policy_id, document_type, is_client_visible

### 2. RLS Policies
- Clients see only their own data (policies, notifications, documents)
- Advisors see their own clients' data
- Admin sees everything
- All tables have RLS enabled with security-definer helper functions

### 3. Portal Login Page (`/portal/login`)
- Branded login form matching the site's evergreen/gold aesthetic
- Email + password authentication via Supabase Auth
- After login, checks `portal_users` table for role
- Redirects advisors to `/portal/advisor/dashboard`
- Redirects clients to `/portal/client/dashboard`
- Error handling for inactive accounts, non-portal users, and invalid credentials
- Domain restriction: advisor accounts must use `@everencewealth.com`

### 4. Route Guard Components
- `PortalRoute` -- checks auth + portal_users membership
- `AdvisorRoute` -- checks portal_users role = advisor/admin
- `ClientRoute` -- checks portal_users role = client

### 5. Placeholder Dashboard Pages
- `/portal/advisor/dashboard` -- Simple "Welcome, [name]" card with logout
- `/portal/client/dashboard` -- Simple "Welcome, [name]" card with logout
- These will be built out in Phase 2

### 6. App.tsx Route Registration
- Add portal routes before the `/:lang` catch-all
- `/portal/login` (public)
- `/portal/advisor/*` (advisor-protected)
- `/portal/client/*` (client-protected)

## Technical Details

### New app_role enum values
We will NOT modify the existing `app_role` enum (used by the blog CMS). Instead, the `portal_users` table will use a TEXT column with CHECK constraint for roles ('client', 'advisor', 'admin'). This keeps the portal auth system completely separate from the CMS admin auth.

### Security-definer functions
```sql
-- Check if user is a portal advisor
CREATE FUNCTION is_portal_advisor(_user_id UUID) ...
-- Check if user is a portal admin  
CREATE FUNCTION is_portal_admin(_user_id UUID) ...
-- Get portal user ID from auth.uid()
CREATE FUNCTION get_portal_user_id(_auth_uid UUID) ...
```

### Files to Create
- `src/pages/portal/PortalLogin.tsx` -- Login page
- `src/pages/portal/advisor/AdvisorDashboard.tsx` -- Placeholder
- `src/pages/portal/client/ClientDashboard.tsx` -- Placeholder
- `src/components/portal/PortalRoute.tsx` -- Auth guard
- `src/components/portal/AdvisorRoute.tsx` -- Role guard
- `src/components/portal/ClientRoute.tsx` -- Role guard
- `src/components/portal/PortalLayout.tsx` -- Shared layout with sidebar

### Files to Modify
- `src/App.tsx` -- Add portal routes

### Database Migration
One migration with all 6 tables, indexes, RLS policies, triggers, and helper functions.

## What is NOT in Phase 1
- Policy CRUD UI
- Document upload/download
- Client invitation flow
- Carrier management UI
- Notification system UI
- Agent resources/tools UI
- Messaging between advisor and client

These will be added in Phases 2-4.
