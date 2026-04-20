
Trivial one-line fix. The user already specified the exact change.

**File:** `src/pages/strategies/AssetProtection.tsx` line 31
**Change:** `const baseUrl = 'https://everencewealth.com'` → `const baseUrl = 'https://www.everencewealth.com'`

This aligns the canonical URL on the Asset Protection page with the `www.` prefix used by the middleware and the rest of the deployed site, eliminating canonical/hreflang mismatch.

No other files affected. No DB or edge function changes.
