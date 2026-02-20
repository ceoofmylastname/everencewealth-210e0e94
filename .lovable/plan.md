
# Mobile-First Optimization Across All Portals

## Summary
A comprehensive pass to make every page across the Advisor, Client, and Admin portals feel native and polished on mobile devices. The site already has responsive foundations (sidebar collapse, grid breakpoints) but many pages have oversized elements, wasted whitespace, truncated content, and desktop-oriented layouts that need refinement for touch-first usage.

## Key Issues Identified

1. **Advisor Dashboard**: Stat cards are too tall on mobile (single column with large padding). Quick Actions grid only shows 2 per row on small screens. The 3-column bottom grid stacks but has excessive padding.

2. **Client Dashboard**: Stat cards go single-column too early (sm:grid-cols-3 skips the 2-col breakpoint). Policy list rows have desktop-oriented horizontal layouts that waste mobile space.

3. **ToolsHub**: Calculator dialog uses `max-w-4xl` which doesn't respect mobile well. Tab triggers could be more touch-friendly. Filter chips scroll off-screen on small devices. 3D hover effects are wasted on touch (should disable).

4. **Messages (Both Advisor and Client)**: Fixed height `h-[calc(100vh-12rem)]` doesn't account for mobile header properly. Conversation list + messages side-by-side breaks on mobile (lg:grid-cols-3). On small screens, users see both panels crammed together.

5. **Performance Tracker**: Data table with 10 columns is unusable on mobile -- horizontal scroll exists but columns are hard to read. The "Add Entry" dialog form uses grid-cols-2 which is cramped on phones.

6. **Carrier Directory**: Filter chips for Products and Specialties overflow without scrollable container. Cards work well but action buttons at bottom can be cramped.

7. **Marketing Resources**: Filter chip rows can overflow. Stats grid needs 2-col on mobile.

8. **Training Center**: Generally OK but cards could use tighter spacing.

9. **Admin pages (AdminCarriers, AdminAgents, etc.)**: Forms and tables need mobile-friendly layouts.

10. **Layout headers**: Mobile header is 56px (h-14) but content padding could be tighter. No bottom safe-area padding for iOS on scrollable content.

---

## Changes by File

### 1. `src/components/portal/PortalLayout.tsx`
- Add bottom safe area padding to main content area for iOS devices
- Ensure mobile header height works well with notched phones

### 2. `src/pages/portal/advisor/AdvisorDashboard.tsx`
- Change stat cards grid to `grid-cols-2` on mobile (instead of single column) for a compact 2x2 layout
- Reduce stat card inner padding on mobile (`p-4` instead of `p-5`)
- Reduce font size of stat values on mobile (`text-2xl` instead of `text-3xl`)
- Quick Actions: use `grid-cols-3` on mobile (instead of `grid-cols-2`) so all 6 fit in 2 rows
- Bottom grid: reduce gap on mobile
- Tighten section spacing on mobile

### 3. `src/pages/portal/client/ClientDashboard.tsx`
- Change stat cards to `grid-cols-3` even on smallest screens (cards are compact enough)
- Reduce stat value font size to `text-2xl` on mobile
- Reduce card padding on mobile
- Advisor card: make "Send Message" button full-width touch-friendly

### 4. `src/pages/portal/advisor/ToolsHub.tsx`
- Calculator dialog: change to `max-w-full sm:max-w-4xl` with `mx-2` margin on mobile
- Filter chips: wrap in horizontally scrollable container with `overflow-x-auto` and `flex-nowrap` option
- Disable 3D perspective hover on touch devices (check for pointer:coarse media query or just remove mouse-move handler on mobile)
- Tab triggers: increase touch target size on mobile
- Calculator cards grid: keep `grid-cols-1` on mobile (already correct)

### 5. `src/pages/portal/advisor/AdvisorMessages.tsx`
- On mobile, implement a stacked view: show conversation list by default, when a conversation is selected, show full-screen messages with a back button
- This replaces the side-by-side `lg:grid-cols-3` layout which is unusable on phones
- Add proper height calculation accounting for mobile header
- Make message input sticky at bottom

### 6. `src/pages/portal/client/ClientMessages.tsx`
- Adjust height calculation to account for mobile header: `h-[calc(100vh-10rem)] sm:h-[calc(100vh-12rem)]`
- Increase message bubble max-width on mobile to `max-w-[85%]` instead of `max-w-[70%]`
- Make input area more touch-friendly with larger tap targets

### 7. `src/pages/portal/advisor/PerformanceTracker.tsx`
- On mobile, replace the data table with a card-based list view showing key metrics per entry
- Keep the table view for `md:` breakpoint and above using responsive visibility classes
- "Add Entry" dialog form: change to `grid-cols-1` on mobile, `grid-cols-2` on `sm:`
- Stats grid: use `grid-cols-2` on mobile (already correct)

### 8. `src/pages/portal/advisor/CarrierDirectory.tsx`
- Wrap filter chips in `overflow-x-auto` scrollable containers
- Search input: remove `max-w-md` constraint on mobile (full width)
- Carrier card action buttons: stack vertically on very small screens

### 9. `src/pages/portal/advisor/MarketingResources.tsx`
- Filter chips: add horizontal scroll container
- Resource cards: ensure proper text truncation on mobile

### 10. `src/pages/portal/advisor/TrainingCenter.tsx`
- Filter chips: add horizontal scroll container
- Training cards: tighten padding on mobile

### 11. `src/pages/portal/client/ClientPolicies.tsx`
- Policy card grid: change from `grid-cols-2 sm:grid-cols-4` to `grid-cols-2` with proper truncation on mobile
- Ensure all text is readable without horizontal scroll

### 12. `src/pages/portal/client/ClientDocuments.tsx`
- Ensure document cards are touch-friendly with adequate tap targets
- Download button: full-width on mobile

### 13. `src/components/portal/AdminPortalLayout.tsx`
- Add bottom safe area padding for iOS
- Ensure mobile sidebar animation is smooth

### 14. Calculator Components (all 15 files in `src/pages/portal/advisor/calculators/`)
- Ensure slider inputs have adequate touch targets (min 44px height)
- Result grids: use `grid-cols-1` on mobile where currently using `grid-cols-2`
- Charts: set minimum height and ensure ResponsiveContainer works well on narrow screens
- Reduce typography sizes on mobile for long result labels

---

## Technical Approach

- Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) consistently -- mobile-first
- Add `touch-manipulation` CSS to interactive elements for 300ms tap delay removal
- Use `scrollbar-hide` utility class for horizontal filter scrolling
- Add safe area insets via `pb-[env(safe-area-inset-bottom)]` where needed
- For the Messages stacked view on mobile, use state + conditional rendering rather than CSS-only
- Disable 3D mouse-tracking effects by checking `window.matchMedia('(pointer: coarse)')` 

## Files to Edit (15+ files)
- `src/components/portal/PortalLayout.tsx`
- `src/components/portal/AdminPortalLayout.tsx`
- `src/pages/portal/advisor/AdvisorDashboard.tsx`
- `src/pages/portal/advisor/ToolsHub.tsx`
- `src/pages/portal/advisor/AdvisorMessages.tsx`
- `src/pages/portal/advisor/PerformanceTracker.tsx`
- `src/pages/portal/advisor/CarrierDirectory.tsx`
- `src/pages/portal/advisor/MarketingResources.tsx`
- `src/pages/portal/advisor/TrainingCenter.tsx`
- `src/pages/portal/client/ClientDashboard.tsx`
- `src/pages/portal/client/ClientPolicies.tsx`
- `src/pages/portal/client/ClientDocuments.tsx`
- `src/pages/portal/client/ClientMessages.tsx`
- Select calculator components (DebtVsInvesting, CommissionCalculator, etc.)

## No New Dependencies Required
All changes use existing Tailwind utilities and React patterns.
