

# Lower Word Count Threshold and Fix Polling

## Changes

### 1. Edge Function: `generate-cluster-chunk/index.ts`

**Word count threshold changes:**
- Line 132: Hard fail threshold from `1200` to `600`
- Line 137: Soft penalty threshold from `1500` to `800`
- Line 263: `maxAttempts` from `2` to `3`
- Line 372: Success threshold from `1500` to `800`
- Lines 239-258, 276-286, 299-331: Update prompt text references from "1,500" to "800" minimum

**Prompt updates:**
- Adjust the system and user prompts to request 800+ words minimum instead of 1,500
- Keep the target range language (e.g., "target 1,200-1,800 words") reasonable

### 2. Frontend: `CreateClusterDialog.tsx`

**Polling logic fix (line 83-97):**
- Add detection for `partial` and `failed` statuses in `pollJobStatus`
- When `partial` is detected, show a toast like "Cluster partially created with X articles" and stop polling gracefully
- Close the dialog and refresh the cluster list so the user sees the result

### Technical Details

**Edge function changes (4 key lines):**
- `validateContentQuality`: Hard fail at 600 words instead of 1,200
- `validateContentQuality`: Soft penalty at 800 words instead of 1,500
- `generateSingleArticle`: `maxAttempts = 3` instead of `2`
- `generateSingleArticle`: Break out of retry loop at 800 words instead of 1,500
- Hard reject at 600 words instead of 1,200

**Frontend polling changes:**
- Currently only checks for `completed` and `failed` -- add `partial` status handling
- On `partial`: toast success with actual count, stop polling, close dialog, trigger refresh

