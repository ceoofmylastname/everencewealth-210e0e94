

## Show All Questions & Answers in Assessment Leads Admin

### Problem
1. **Missing data**: The 8 existing submissions only saved 3 answer fields (`retirement_concern`, `age_range`, `tax_strategy_familiarity`). The other 7 answers and all scores are `null` because the DB columns were added after those submissions. Future submissions will save correctly now that the columns exist.
2. **Admin can't see answers**: The table only shows summary columns. Full Q&A is hidden behind a detail dialog click, and even there, empty answers are filtered out.

### Changes

#### 1. Update the Detail Dialog in `src/pages/crm/admin/AssessmentLeads.tsx`
- Import `QUESTIONS` from `@/lib/assessment-scoring`
- Replace the hardcoded answer list with a loop over all 10 `QUESTIONS`, showing:
  - The actual **question text** (e.g., "What is your primary retirement concern?")
  - The user's **selected answer** (or "Not answered" if null)
- Show all 10 questions regardless of whether answered, so admin always sees the full picture
- Display the question label prominently and the answer below it, in a card-style layout

#### 2. No schema changes needed
The columns already exist. Future submissions will populate all fields. The 8 legacy submissions will simply show "Not answered" for the missing fields.

### Files to change
- `src/pages/crm/admin/AssessmentLeads.tsx` — update the "Assessment Answers" section in the detail dialog to show all questions with their full text

