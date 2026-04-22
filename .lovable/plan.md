

## Fix Cloudflare build: regenerate package-lock.json

`package.json` pins `zod@3.23.8` (from the earlier build-fix patch) but `package-lock.json` still has `^3.25.76` from before that pin. Cloudflare runs `npm ci` which fails on mismatch.

### Steps

1. **Run `npm install`** at project root to regenerate `package-lock.json` against the current `package.json`. This will:
   - Resolve `zod` back down to `3.23.8` in the lockfile
   - Update any other transitive dependencies that drifted
2. **Verify alignment** by re-running `grep '"zod"' package.json package-lock.json` — both must show `3.23.8`.
3. **Run `npm ci` locally** to confirm Cloudflare's exact command will now succeed.
4. **Report the diff** from `git diff --stat package-lock.json` plus a short summary of any other packages whose versions changed (e.g. `@hookform/resolvers`, recharts, react types) so you know nothing unexpected was downgraded/upgraded.

### Guardrails

- Will **not** edit `package.json` (no upgrading zod to silence the lock).
- If `npm install` tries to upgrade zod beyond `3.23.8`, that means a peer dep (likely `@hookform/resolvers`) requires it — in that case I'll stop and report rather than force the install. Default behavior of an exact pin (`"zod": "3.23.8"` with no caret) is that npm respects it.
- No code changes, no edge function changes, no DB changes.

### Files touched

- **Edited:** `package-lock.json` only

### After deploy

Cloudflare will auto-trigger a new build on the lockfile commit. Expected outcome: `npm ci` succeeds, TypeScript build runs clean (zod v3 types restored), Cloudflare Pages publishes.

