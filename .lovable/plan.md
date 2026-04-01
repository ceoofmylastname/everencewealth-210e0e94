

## Verification: Data Capture + Mobile Optimization

### Data capture status — CONFIRMED COMPLETE

Every single form field is already being captured and stored correctly:

| Form Field | Stored in DB | Shown in Advisor Dashboard |
|---|---|---|
| Selected Agent | `assigned_advisor_id` (UUID FK) | RLS filters by this — advisor only sees their own |
| First Name | `first_name` | Yes |
| Last Name | `last_name` | Yes |
| Marital Status | `marital_status` | Yes |
| Email | `email` | Yes |
| Phone | `phone` | Yes |
| Street Address | `street_address` | Yes |
| Address Line 2 | `address_line_2` | Yes (in address block) |
| City | `city` | Yes |
| State | `state` | Yes |
| Zip Code | `zip_code` | Yes |
| Income Range | `income_range` | Yes |
| Free Consultation | `wants_free_consultation` | Yes |
| Meeting Topics | `meeting_topics` (array) | Yes (bullet list) |
| Availability | `availability` | Yes |
| Comments | `comments` | Yes |
| Submission Date | `submitted_at` (auto) | Yes |
| Reviewed Status | `reviewed` (default false) | Yes (toggle button) |

**RLS enforced at database level**: Advisors can ONLY see rows where `assigned_advisor_id` matches their advisor record. No data leaks between agents.

### Mobile optimization — what needs improving

The current form works on mobile but isn't truly mobile-first optimized for 95% phone usage. Here's what I'll fix:

**File**: `src/pages/ResponseCard.tsx`

1. **Touch targets**: Increase pill buttons from `py-2.5` to `py-3.5` (meets 44px minimum)
2. **Address grid**: Change `grid-cols-2 sm:grid-cols-3` to stack vertically on mobile (`grid-cols-1 sm:grid-cols-3`), city/state/zip as a 3-col row only on sm+
3. **Input sizing**: Bump inputs from `py-3` to `py-3.5` for easier thumb tapping
4. **Font sizes**: Step titles from `text-2xl sm:text-3xl` to `text-xl sm:text-3xl` so they don't overflow on narrow screens
5. **Agent list scroll area**: Change `max-h-[45vh]` to `max-h-[50vh]` and add `-webkit-overflow-scrolling: touch` for smooth iOS scrolling
6. **Footer buttons**: Increase padding from `py-3` to `py-3.5` and make Continue/Submit button wider on mobile
7. **Content padding**: Reduce horizontal padding from `px-6` to `px-4 sm:px-6` to reclaim space on small screens
8. **Card select items**: Ensure minimum height of 48px for comfortable tapping
9. **Consultation yes/no buttons**: Already `flex-1 py-3`, bump to `py-4`
10. **Nav logo area**: Tighten padding on mobile

**No database or logic changes** — purely CSS/layout adjustments for mobile-first experience.

