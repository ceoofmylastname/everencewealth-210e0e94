
## Fix Author Photos in Blog Articles

### Problem
Two components display broken or incorrect author photos because they use **hardcoded image paths** instead of the actual author photo from the database.

1. **Reviewer card** (top of article) -- hardcoded to `/images/hans-blog.jpg?v=3` (a legacy team member photo)
2. **Author byline** (bottom of article) -- hardcoded to `/images/steven-blog.jpg?v=2` (a static file that appears broken)

The correct photo is already stored in the database on the `authors` table (`photo_url` field).

### Fix

**File 1: `src/components/blog-article/ArticleHeader.tsx`** (line 126)
- Replace the hardcoded `/images/hans-blog.jpg?v=3` with `reviewer.photo_url` so it dynamically pulls the reviewer's actual photo from the database.

**File 2: `src/components/blog-article/AuthorByline.tsx`** (lines 14-16)
- This component currently ignores the database entirely and uses hardcoded static paths based on a `context` prop.
- Add an optional `photoUrl` prop and use it when provided, falling back to the existing static paths for backwards compatibility.
- Update the parent component that renders `AuthorByline` to pass the author's `photo_url` from the database.

Both photos will then display the same correct image from the author record.
