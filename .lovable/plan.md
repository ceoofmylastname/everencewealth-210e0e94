

# Fix: Manager Dashboard Not Tracking Agent Progress

## Root Cause

The `auto_advance_pipeline_stage` database trigger has a logic flaw. When an agent completes a step, the trigger checks the agent's current pipeline stage for required steps. But the first stage (`intake_submitted`) has **zero required steps**, and the trigger's condition requires `total_required > 0` to advance. This creates a deadlock -- the agent is forever stuck at `intake_submitted` no matter how many steps they complete.

Bobby (DELSOLPRIMEHOMES) has completed 2 steps (Agreement Signed + SureLC Screenshot) but the system still shows stage: `intake_submitted`, progress: 0%.

## The Fix (2 parts)

### 1. Fix the Trigger Logic (Database Migration)

Update `auto_advance_pipeline_stage` so that when a stage has zero required steps, it automatically advances to the next stage and re-checks. This creates a cascading advance that correctly moves the agent through stages without required steps.

```text
Current logic (broken):
  Agent at "intake_submitted" -> 0 required steps -> STOP (never advances)

Fixed logic:
  Agent at "intake_submitted" -> 0 required steps -> auto-advance to "agreement_pending"
  -> 1 required step, 1 completed -> advance to "surelc_setup"
  -> 1 required step, 1 completed -> advance to "bundle_selected"
  -> STOP (step not completed yet)
```

The trigger will use a loop with a safety limit (max 8 iterations) to cascade through stages with no required steps, stopping when it reaches a stage with incomplete requirements.

### 2. Fix Bobby's Existing Data (Data Update)

Run the corrected trigger logic against Bobby's record to update his `pipeline_stage` and `progress_pct` to reflect his actual completed steps. Based on his 2 completed steps (Agreement + SureLC), he should be at stage `bundle_selected` with ~33% progress.

## What the Manager Will See After This Fix

- Bobby's stage will correctly show "Bundle Selected" instead of "Intake Submitted"
- Progress bar will show 33% instead of 0%
- Future step completions will correctly advance the pipeline
- Real-time subscriptions (already implemented) will push these changes to the dashboard live
- All stats cards (Active, Completed, Stuck counts) will reflect accurate data

## Files Changed

| Item | Detail |
|---|---|
| Database migration | Updated `auto_advance_pipeline_stage` trigger function |
| Data fix | Update Bobby's `pipeline_stage` and `progress_pct` |
| Code changes | None needed -- the dashboard and real-time code are already correct |

