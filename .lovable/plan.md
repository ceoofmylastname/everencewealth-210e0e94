

# Add 2-Second Rate Limiting + Agent Randomization

## What This Fixes
Resend's rate limit (2 req/sec) causes ~33% email failures when 3+ emails fire simultaneously. This adds a 2-second delay between sends and randomizes agent order for fairness.

## Changes

**Single file:** `supabase/functions/send-lead-notification/index.ts`

1. **Add sleep helper** (top of file, after imports):
   - Simple `sleep(ms)` promise-based utility

2. **Replace the agent loop** (line 331):
   - Shuffle agents randomly before iterating
   - Convert `for...of` to index-based `for` loop
   - Add `await sleep(2000)` before each email send (skipping the first)
   - Add console logging for rate limit delays

## Timing Impact

| Agents | Extra Time | Within 150s Timeout? |
|--------|-----------|---------------------|
| 1      | 0s        | Yes                 |
| 3      | 4s        | Yes                 |
| 5      | 8s        | Yes                 |
| 10     | 18s       | Yes                 |

## No Other Files Need Changes
- `send-escalating-alarms` already batches recipients in a single API call
- `register-crm-lead` calls are sequential and will inherit the per-agent throttling

