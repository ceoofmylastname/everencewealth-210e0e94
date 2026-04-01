
Update the mobile agent picker again, but this time stop relying on a visible iPhone scrollbar as the UX.

What I found
- `src/pages/ResponseCard.tsx` already renders the agent list in-flow with `max-h-72 overflow-y-auto`.
- The page still wraps the form in `overflow-hidden`, vertical centering, and a Framer Motion step container.
- On iPhone/live, Safari often hides scrollbar thumbs entirely, so “no scrollbar” is usually a symptom, not the root issue.

Plan
1. Keep the advisor query exactly as-is
   - Continue pulling all active advisors from `advisors`.
   - No database or sync changes.

2. Replace the mobile dropdown with a dedicated mobile-safe picker
   - On small screens, open the agent list in a bottom-sheet/full-panel picker instead of an inline dropdown.
   - Use a dedicated scroll container with:
     - `overflow-y-scroll`
     - `overscroll-contain`
     - `WebkitOverflowScrolling: "touch"`
     - a larger height like `max-h-[60vh]` or similar
   - This avoids clipping from the page shell and step animation.

3. Keep desktop as a normal dropdown/list
   - Desktop can stay inline since the issue is specifically live mobile Safari.
   - Same data source and same selected-agent behavior.

4. Add a clear mobile scrolling cue
   - Since iPhone may not show a persistent scrollbar, add a visible cue at the top of the mobile picker:
     - drag handle
     - “Scroll to see more agents”
     - subtle top/bottom fade
   - This makes the list understandable even when the OS hides the scrollbar thumb.

5. Prevent parent layout from interfering while the picker is open
   - Disable step-slide animation for step 0 when the mobile picker is open.
   - Close the picker on selection, Back, and Continue.
   - If needed, relax `overflow-hidden` on the response card shell during the mobile picker state.

Files to update
- `src/pages/ResponseCard.tsx`
- Possibly `src/index.css` only if a small reusable mobile scroll cue / scrollbar utility is needed

Technical details
- Root issue is still mobile Safari container behavior, not missing advisor records.
- A permanently visible scrollbar cannot be guaranteed on iPhone Safari, so the fix should focus on:
  - reliable scrolling
  - dedicated mobile layout
  - explicit visual cues
- Result: all agents should be reachable whether there are 10, 50, or 100+ names.
