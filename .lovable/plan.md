

# SureLC Setup Page -- Step 2 of 2

## Overview
Replace the current "Continue to Step 2" reload behavior with a branded, interactive SureLC onboarding page. This page guides agents through watching instructional videos, registering their SureLC profile, and uploading a completion screenshot. Every interaction is tracked for managers in real-time.

## New Component: `SureLCSetup.tsx`

A full-page branded experience with the following sections:

### Header
- Branded dark green banner with congratulations message
- Personalized greeting using `{firstName}`

### Content Sections (letter-style card)
1. **Welcome paragraph** -- congratulates agent on signing agreement, welcomes to team
2. **Step indicator** -- "Next Steps: Getting Appointed with the Carriers. Steps 2 of 2"
3. **Compliance warning** -- instructs agent to carefully review videos
4. **Video 1 button** -- "Click to watch | SureLC - Producer Registration Video Instructions" linking to `https://www.youtube.com/watch?v=6Sc1qas71SU`
5. **Video 2 button** -- "Click to watch | SureLC - How To Create A Contract Request" linking to `https://www.youtube.com/watch?v=xWrbs1tcxsI`
6. **SureLC Registration button** -- "Click to Register | Create Your SureLC Profile" linking to the SureLC OAuth URL
7. **Screenshot upload section** -- Agent must upload a screenshot of their completed SureLC account to proceed
8. **Carrier warning** -- Only request carriers cleared by manager
9. **Footer** -- "Best Regards, Everence Wealth"

### Link Click Tracking
Each button click (Video 1, Video 2, SureLC Register) logs an entry to `contracting_activity_logs` with:
- `action`: e.g., `"link_clicked"`
- `description`: e.g., `"Watched SureLC Producer Registration video"`
- `metadata`: `{ "link_type": "surelc_video_1", "url": "...", "clicked_at": "ISO timestamp" }`

The button opens the link in a new tab and simultaneously fires a non-blocking activity log insert. Managers see these in real-time via the existing activity log feeds.

### Screenshot Upload
Reuses the existing upload pattern from `AgentDashboard`:
- Uploads file to `contracting-documents` storage bucket under `{agentId}/surelc/`
- Inserts into `contracting_documents` table
- Marks the SureLC step (ID: `1e83a6c7-2d4f-4d09-b04f-4ee86fc47ac5`) as `completed` in `contracting_agent_steps`
- This triggers `auto_advance_pipeline_stage` to advance from `surelc_setup` to `bundle_selected`
- Logs activity for manager visibility
- Shows success toast and transitions to the next stage

### Manager Notification
On screenshot upload, calls the existing `notify-contracting-step` edge function to alert the manager/contracting team that the agent completed SureLC setup.

## Routing Changes: `ContractingDashboard.tsx`

Currently, agents in `surelc_setup` stage see the generic `AgentDashboard` checklist. Change this:

```
// Before: only intake_submitted/agreement_pending get special treatment
if (stage === "intake_submitted" || stage === "agreement_pending") {
  return <AgentWelcome ... />;
}
return <AgentDashboard ... />;

// After: surelc_setup also gets its own page
if (stage === "intake_submitted" || stage === "agreement_pending") {
  return <AgentWelcome ... />;
}
if (stage === "surelc_setup") {
  return <SureLCSetup ... />;
}
return <AgentDashboard ... />;
```

## Changes to `AgentWelcome.tsx`

The "Continue to Step 2" button currently calls `window.location.reload()`. This already works correctly because after signing, the pipeline stage advances to `surelc_setup`, and on reload the routing in ContractingDashboard will now show SureLCSetup. No change needed here.

## Persistence

- On mount, SureLCSetup queries `contracting_activity_logs` for this agent to check which links have already been clicked, and shows check marks next to completed actions
- Queries `contracting_agent_steps` + `contracting_documents` for the SureLC step to check if screenshot already uploaded
- If agent leaves and returns, they see exactly where they left off with visual indicators of completed actions

## Visual Design

- Same brand colors: `#1A4D3E` (dark green), `#C9A84C` (gold accent)
- Video buttons: large, card-style with play icon, gold accent border
- SureLC register button: prominent green CTA
- Upload section: dashed border upload zone with drag-and-drop feel
- Completed actions get green checkmarks
- Modern rounded cards with subtle shadows matching existing design system

## Files

| File | Action |
|---|---|
| `src/pages/portal/advisor/contracting/SureLCSetup.tsx` | Create -- new branded Step 2 page |
| `src/pages/portal/advisor/contracting/ContractingDashboard.tsx` | Modify -- route `surelc_setup` stage to new component |
| No database changes | All tracking uses existing `contracting_activity_logs` and `contracting_agent_steps` tables |

