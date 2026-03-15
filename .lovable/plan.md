

## Problem

The thumbnail on Slide 10 (60 Minutes) is generated via an **AI image generation API call every single time** the slide mounts. This is an expensive network request that takes several seconds, which is why you see the shimmer/gray placeholder before the image appears.

## Solution

Replace the dynamic AI-generated thumbnail with a **static image**. Since this thumbnail never changes, there's no reason to regenerate it on every view.

### Approach
1. **Use the YouTube video's actual thumbnail** — YouTube provides free thumbnail URLs for any video. For video ID `eNo9HLgbax0`, the high-quality thumbnail is:
   `https://img.youtube.com/vi/eNo9HLgbax0/maxresdefault.jpg`

2. **Update `Slide10_SixtyMinutes.tsx`**:
   - Remove the `useEffect` that calls `supabase.functions.invoke("generate-image")`
   - Remove `thumbnailUrl`, `thumbnailLoading` state
   - Remove the `supabase` import
   - Set the `<img>` src directly to the YouTube thumbnail URL
   - Remove the shimmer/fallback gradient logic since the image loads instantly

This eliminates the API call entirely, making the thumbnail appear near-instantly.

