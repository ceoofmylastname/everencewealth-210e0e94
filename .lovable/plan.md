
Trivial single-file replacement. The user specified the exact action.

**File:** `wrangler.toml`
**Action:** Replace entire contents with the single comment:
```
# Legacy file — not in use. Cloudflare Pages uses functions/_middleware.js
```

Replacing rather than deleting preserves the path so any external reference doesn't 404, and the comment documents why the file is empty. No other files touched.
