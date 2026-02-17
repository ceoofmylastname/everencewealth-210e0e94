

# Add Advisor Portal Link to Main Site Footer

## What Changes

**File: `src/components/home/Footer.tsx`**

Add an "Advisor Login" link to the footer's bottom legal/links bar (next to Privacy Policy, Terms, and Disclosures). This mirrors the pattern already used in the landing page footer.

The link will point to `/portal/login` and use the same styling as the existing legal links (gray-400 text with gold hover effect).

**Before:**
```
Privacy Policy | Terms | Disclosures
```

**After:**
```
Privacy Policy | Terms | Disclosures | Advisor Login
```

No other files need to change.

