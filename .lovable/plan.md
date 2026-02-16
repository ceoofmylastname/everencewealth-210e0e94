# Phase 1: Portal Foundation -- Database, Auth, and Login ✅ COMPLETE

## What Was Built

### 1. Database Schema
- `users` table with `email`, `password`, `role` (advisor/client), `created_at`
- `clients` table with `advisor_id`, `name`, `email`, `phone`, `created_at`
- `policies` table with `client_id`, `name`, `type`, `premium`, `coverage`, `status`, `created_at`
- `documents` table with `client_id`, `advisor_id`, `name`, `type`, `file_path`, `is_client_visible`, `created_at`
- `invitations` table with `advisor_id`, `email`, `token`, `status`, `created_at`

### 2. Authentication
- Supabase Auth for user signup/login/logout
- Row Level Security (RLS) policies to restrict data access based on user role and relationships

### 3. Login Page
- Simple login form with email/password fields
- Redirects to advisor or client dashboard based on user role

# Phase 2: Dashboard, Policy CRUD, Documents, Invitations ✅ COMPLETE

## What Was Built

### 1. Portal Layout (`PortalLayout.tsx`)
- Shared sidebar navigation for advisor and client views
- Mobile-responsive with hamburger menu
- User info display with role badge and sign-out

### 2. Advisor Dashboard & Pages
- **Dashboard** — Overview stats (clients, active policies, documents, pending invites) + quick actions
- **Clients** — Searchable client list with cards, links to policies/docs per client
- **Policies** — Full CRUD: list, create, edit, view detail, delete. Search/filter by client
- **Documents** — Upload with client selector, type, visibility toggle. Download/delete. Toggle client visibility
- **Invite Client** — Create invitation with name/email/phone, token generation, invitation history

### 3. Client Dashboard & Pages
- **Dashboard** — Policy count, document count, recent policies list
- **My Policies** — Read-only view of all policies with status, benefits, premiums
- **My Documents** — Download documents marked as client-visible by advisor

### 4. Storage
- `portal-documents` private storage bucket with RLS policies for advisor upload/client download

### 5. Routes Added
- `/portal/advisor/dashboard`, `/clients`, `/policies`, `/policies/new`, `/policies/:id`, `/policies/:id/edit`, `/documents`, `/invite`
- `/portal/client/dashboard`, `/policies`, `/documents`

# Phase 3: Email Invitations, Client Signup, Notifications, Messaging ✅ COMPLETE

## What Was Built

### 1. Invitation Email (`send-portal-invitation` edge function)
- Edge function that sends branded HTML invitation emails via Resend
- Triggered automatically when advisor creates a new invitation
- Includes signup link with invitation token
- Updates `sent_at` on the invitation record

### 2. Client Self-Signup (`/portal/signup`)
- Token-based signup page validates invitation token, expiry, and status
- Client creates password, Supabase Auth user is created
- `portal_users` record auto-created with client role and advisor linkage
- Invitation marked as `accepted` after successful signup
- Email verification required before login

### 3. Notification System
- `portal_notifications` table with RLS (users see own notifications only)
- `NotificationBell` component in portal sidebar and mobile header
- Real-time notification updates via Supabase Realtime
- Mark individual or all notifications as read
- Click-to-navigate for actionable notifications

### 4. Advisor-Client Messaging
- `portal_conversations` table (unique advisor-client pairs)
- `portal_messages` table with RLS (conversation participants only)
- **Advisor Messages** page: multi-conversation view, start new conversations with clients, real-time message delivery
- **Client Messages** page: single-conversation view with assigned advisor, real-time updates
- Both views have chat-style UI with sender alignment and timestamps
- Realtime enabled for instant message delivery

### 5. Routes Added
- `/portal/signup` — Public client signup with token
- `/portal/advisor/messages` — Advisor messaging hub
- `/portal/client/messages` — Client messaging view

## What is NOT in Phase 3
- Push notifications (browser/mobile)
- Agent resources/tools UI
- File attachments in messages
- Read receipts in messaging UI
