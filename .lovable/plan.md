
# Fix: 4 Security Errors

## Issue 1: Security Definer View

**Problem**: The `duplicate_image_articles` view in migration `20251229085557` was created with `CREATE OR REPLACE VIEW` — no `security_invoker = true` option. This means it runs with the definer's (superuser) privileges, bypassing RLS. If any user can query this view, they can see data they shouldn't. The later migration (`20251229085625`) re-creates it with `security_invoker = true`, but the scanner is flagging the original.

**Fix**: Create a new migration to explicitly `DROP` and `RECREATE` the `duplicate_image_articles` view and the `hreflang_siblings` view with `WITH (security_invoker = true)`. Both are plain `CREATE OR REPLACE VIEW` without the security option, running as the definer. The `hreflang_siblings` view especially needs this since it reads from `blog_articles`, `qa_pages`, `location_pages`, and `comparison_pages`.

---

## Issue 2: Guide Content Generation Endpoint Has No Authentication

**Problem**: The `generate-guide-content` edge function has `verify_jwt = false` in `config.toml` and performs zero authentication checks. Any anonymous user or external actor can call it freely, consuming AI credits and generating content. This is an admin-only operation (brochure generation).

**Fix**:
1. **Add JWT authentication** to the edge function — verify the caller is an authenticated admin before processing
2. **Update the client calls** in `AdminBrochureForm.tsx` and `AdminBrochures.tsx` to include the user's `Authorization` bearer token in request headers
3. Keep `verify_jwt = false` in config.toml (the recommended pattern) but add manual JWT + admin role verification inside the function using `getClaims()`

---

## Issue 3: AI Content Generation Vulnerable to Prompt Injection

**Problem**: User-supplied inputs (`topic`, `target_audience`, `state`, `category`) are interpolated directly into the AI prompt string with no sanitization or length limits:
```ts
const prompt = `... about "${topic}" ... for ${target_audience} ...${stateContext}`;
```
An attacker could inject prompt text like `topic = 'X". Ignore all previous instructions and...'` to manipulate the AI's behavior, exfiltrate data, or generate harmful content.

**Fix**: Add input validation and sanitization in the edge function:
- Length limits: `topic` ≤ 200 chars, `target_audience` ≤ 150 chars, `state` ≤ 50 chars, `category` from allowlist only
- Strip special characters that could break prompt context (quotes, backticks, injection markers)
- Validate `language` is one of `['en', 'es']`
- Reject oversized payloads early before calling the AI

---

## Issue 4: Multiple Tables Have Overly Permissive Public Access Policies

**Problem**: Several tables still have policies using `USING (true)` or `WITH CHECK (true)` for write operations, allowing any authenticated user (or even unauthenticated in some cases) to modify data. The previous migration fixed `blog_articles`, `authors`, and `categories`, but the scanner is reporting additional tables.

Looking at the migrations, the tables with overly permissive write policies are:
- `link_suggestions` — INSERT/UPDATE/DELETE all use `USING (true)`
- `image_regeneration_queue` — `FOR ALL USING (true) WITH CHECK (true)` 
- `email_tracking` — `INSERT WITH CHECK (true)`

**Fix**: Create a migration to tighten these policies — restricting write operations to authenticated admins only.

---

## Technical Implementation Plan

### Files to Change

**1. New migration** — `supabase/migrations/[timestamp]_security_fixes.sql`:
- Fix `duplicate_image_articles` view with `security_invoker = true`
- Fix `hreflang_siblings` view with `security_invoker = true`
- Fix `link_suggestions` policies to admin-only writes
- Fix `image_regeneration_queue` policies to admin-only writes  
- Fix `email_tracking` INSERT policy (service role or admin only)

**2. `supabase/functions/generate-guide-content/index.ts`**:
- Add JWT authentication check at function start (verify token, confirm admin role)
- Add input validation: length limits, allowlist for `category` and `language`, strip dangerous characters from `topic`, `target_audience`, `state`

**3. `src/pages/portal/admin/AdminBrochureForm.tsx`**:
- Add `Authorization: Bearer ${session.access_token}` header to both `fetch` calls

**4. `src/pages/portal/admin/AdminBrochures.tsx`**:
- Add `Authorization: Bearer ${session.access_token}` header to the `fetch` call

### Auth Header Pattern for Client Calls

```ts
import { supabase } from "@/integrations/supabase/client";

const { data: { session } } = await supabase.auth.getSession();
const res = await fetch(`${url}/generate-guide-content`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    "Authorization": `Bearer ${session?.access_token}`,
  },
  body: JSON.stringify({ ... }),
});
```

### Admin Validation in Edge Function

```ts
const authHeader = req.headers.get('Authorization');
if (!authHeader?.startsWith('Bearer ')) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, ... });
}
const supabaseClient = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
const token = authHeader.replace('Bearer ', '');
const { data, error } = await supabaseClient.auth.getClaims(token);
if (error || !data?.claims) return 401;

// Check admin role via user_roles table
const { data: roleCheck } = await adminClient.rpc('is_admin', { _user_id: data.claims.sub });
if (!roleCheck) return 403;
```

### Input Sanitization

```ts
const ALLOWED_LANGUAGES = ['en', 'es'];
const sanitize = (str: string, maxLen: number) =>
  str.replace(/[`"\\]/g, '').replace(/\n{3,}/g, '\n\n').trim().substring(0, maxLen);

// Validate
if (!ALLOWED_LANGUAGES.includes(language)) throw new Error('Invalid language');
const safeTopic = sanitize(topic, 200);
const safeAudience = sanitize(target_audience || 'pre-retirees aged 50-65', 150);
const safeState = state ? sanitize(state, 50) : null;
```

### Summary

| # | Issue | Files Changed |
|---|-------|---------------|
| 1 | Security Definer Views | 1 new migration |
| 2 | No Auth on Guide Endpoint | edge function + 2 client files |
| 3 | Prompt Injection | edge function |
| 4 | Permissive Table Policies | 1 new migration |
