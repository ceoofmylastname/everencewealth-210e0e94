
# Fix Document Upload and Client View/Download

## Problem
1. The Upload button shows "Select a file" error -- the file input ref may not be capturing files reliably in certain environments
2. Client documents page needs verified download via signed URLs (the bucket is private)

## Changes

### 1. Fix Upload in `src/pages/portal/advisor/AdvisorDocuments.tsx`
- Replace the `Input type="file"` + separate Upload button with a hidden native `<input type="file">` and a single "Choose & Upload" flow
- Add a visible file name display so the advisor can see what they picked
- Use a native `<input>` element directly (not the shadcn Input wrapper) for the file picker to avoid any ref forwarding issues
- Keep all existing upload logic (storage upload, DB insert, notification)

### 2. Verify Client Download in `src/pages/portal/client/ClientDocuments.tsx`
- The existing `handleDownload` function uses `createSignedUrl` which is correct for private buckets
- Storage RLS already has a "Clients can view their documents" SELECT policy -- this allows `createSignedUrl` to work
- No changes needed here; the client page is already functional

### Technical Details
- **File**: `src/pages/portal/advisor/AdvisorDocuments.tsx` (lines 189-194)
  - Replace `<Input type="file" ref={fileRef}>` with a native `<input type="file" ref={fileRef} className="hidden">` 
  - Add a "Choose File" button that triggers `fileRef.current?.click()`
  - Show selected file name in a span
  - Keep the Upload button calling `handleUpload()` as-is
- No database or storage policy changes needed -- everything is already configured correctly
