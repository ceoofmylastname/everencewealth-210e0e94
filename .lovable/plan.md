

## Fix the Citation Discovery modal so all 12 articles scroll

### What's wrong
The modal caps at `max-h-[85vh]` and uses Radix `ScrollArea` inside a flex column. Radix's `ScrollArea.Viewport` wraps content in a `display: table` element, which doesn't honor the parent flex height. The result: the inner area never becomes scrollable, content gets clipped at the dialog edge, and you can only see the first 1–2 articles.

The footer ("Apply 0 Citations") stays pinned at the bottom because it's outside the scroll region — so the missing 10 article cards are simply hidden between header and footer.

### The fix
In `src/components/admin/cluster-manager/ClusterCitationsTab.tsx`, replace the `ScrollArea` wrapping the discovery results (lines ~561 and ~635) with a plain native scroll container:

```tsx
<div className="flex-1 min-h-0 overflow-y-auto pr-4">
  <div className="space-y-4">
    {discoveryResult?.results.map((result) => ( ... ))}
  </div>
</div>
```

Also tighten the `DialogContent` so the flex column is unambiguous:
- Change `max-w-5xl max-h-[85vh] overflow-hidden flex flex-col` → `max-w-5xl h-[85vh] flex flex-col p-6 gap-4` (fixed height + explicit flex beats the base `grid` class).

### Apply the same fix to the sibling modal
The "Cluster-Wide Competitor Scan" dialog right below (line ~664) has the identical pattern and will exhibit the same bug once it has many results. Fix it the same way for consistency.

### Out of scope
- No logic changes to citation discovery, selection, or apply flow.
- No changes to the base `Dialog` or `ScrollArea` primitives (other modals in the app rely on them).
- No styling changes beyond what's needed to make scrolling work.

### File changed
- `src/components/admin/cluster-manager/ClusterCitationsTab.tsx` (two modal sections)

### Verification after fix
- Open Citation Discovery Results with 12 articles → all 12 article cards reachable by scrolling inside the modal.
- Footer with "Apply N Citations" stays pinned at the bottom.
- Header stays pinned at the top.
- No horizontal scroll, no layout jump.

