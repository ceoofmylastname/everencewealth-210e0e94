# Contacts: Top 25 list, score trends, and automated triggers

The explanation of the current contacts system is complete. Three things you asked about don't exist yet. This plan adds them.

## 1. Top 25 list

A dedicated ranked view of the highest-priority contacts in an advisor's book.

- New third tab on `/portal/advisor/contacts`: `[ My Contacts ] [ Top 25 ] [ Team Contacts ]`.
- Ranked by Profile Key score (8 → 0), tie-broken by status (C, then A, then R), then most recently updated.
- Numbered 1–25 with the score badge, status letter, and the traits that are checked.
- Manual pin: an advisor can pin a contact so it holds a slot regardless of score, for warm-market names not yet rated.
- Works in Team view too, so a manager sees any managed agent's Top 25 read-only.

## 2. Score trends

Currently a score is only a snapshot. This adds history.

- Every trait toggle and status change is logged with the resulting score and a timestamp.
- On the contact detail card: a small sparkline plus "up 3 in the last 30 days" style movement text.
- On the list and Top 25: a trend arrow (rising / flat / falling) next to the score badge.
- New dashboard line on the Hot Profiles card: how many contacts heated up this week.

## 3. Automated triggers

Rules that fire off score and status changes, so nothing gets forgotten.

- Crossing score 7 (Urgent) auto-creates a dated follow-up reminder for the owning advisor, if one isn't already open.
- Status change R → A → C writes a timestamped note on the contact so the progression is auditable.
- A contact sitting at score 4+ with no activity for 14 days surfaces in a "Going cold" section on the dashboard.
- All rules are per-advisor and toggleable, so an advisor can turn off auto-reminders.

## Technical details

- New table `advisor_contact_profile_key_history` (contact_id, advisor_id, score, status_code, changed_trait, created_at) with the same RLS shape as the existing profile key table: owner full access via `get_advisor_id_for_auth(auth.uid())`, managers SELECT-only via `can_manage_advisor()`, no admin bypass. GRANTs for `authenticated` and `service_role`.
- An AFTER INSERT OR UPDATE trigger on `advisor_contact_profile_key` writes the history row and, when the new score crosses 7 from below, inserts an `advisor_contact_reminders` row (guarded against duplicates by checking for an open reminder with the same generated title).
- `pinned_top` boolean added to `advisor_contact_profile_key` for the Top 25 manual pin.
- New `Top25List.tsx` component reusing `ProfileKeyBadge` and the existing score color scale; new `useProfileKeyTrend.ts` hook for sparkline data.
- Trend arrow and sparkline use the existing `--profile-key-*` CSS tokens and Framer Motion — no new dependencies.
- Per-advisor rule toggles stored on the existing advisor settings surface rather than a new table.
