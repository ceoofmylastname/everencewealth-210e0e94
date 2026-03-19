

## Replace Slide 10 Video with Direct MP4

**What changes:** Replace the YouTube embed in `src/components/presentation/slides/Slide10_SixtyMinutes.tsx` with a direct `<video>` element using the new MP4 URL.

**File:** `src/components/presentation/slides/Slide10_SixtyMinutes.tsx`

- Change the video player from a YouTube iframe toggle to a direct `<video>` element with the URL `https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69ba279c61cba549c1a200d1.mp4`
- Keep the click-to-play thumbnail pattern: show the existing `slide10Thumb` thumbnail with play button, then swap to a `<video>` element on click
- Video will have `controls`, `autoPlay`, and `playsInline` attributes
- Remove the YouTube iframe code entirely

