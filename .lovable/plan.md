

## Optimize Author Avatar Images

### Problem
The circular author avatars in the blog article page are cutting off the top of the head because `object-cover` centers the image by default, which crops the face poorly in headshot-style photos.

### Fix
Add `object-position: top` to all three avatar locations so the image anchors from the top, keeping the head and face fully visible in the circular crop.

### Files to Change

**1. `src/components/blog-article/ArticleHeader.tsx`** (Reviewer card, line 126)
- Add `className="object-cover object-top"` to the `AvatarImage`

**2. `src/components/blog-article/AuthorByline.tsx`** (Author byline, line 35)
- Change `className="w-16 h-16 rounded-full object-cover"` to include `object-top`

**3. `src/components/blog-article/AuthorBio.tsx`** (Full author bio section, line 54)
- Change `className="object-cover"` to `"object-cover object-top"` on the `AvatarImage`

### Result
All three avatar instances will show the face/head clearly without cropping, on both desktop and mobile.

