
# Salestrail Call Tracking UI for Lead Detail Page

## Overview

Add a dedicated UI section to display incoming webhook call data from Salestrail on the Lead Detail page (`/crm/admin/leads/:id`). This will show call history with phone number matching, call direction indicators, duration, recording playback, and auto-logged badges.

## Current State

- **Webhook**: `supabase/functions/salestrail-webhook/index.ts` is configured and logs calls to `crm_activities`
- **Database fields available**:
  - `salestrail_call_id` - Unique Salestrail call identifier
  - `salestrail_recording_url` - Audio recording URL
  - `salestrail_metadata` - Full webhook payload as JSON
  - `salestrail_transcription` - Call transcription (if available)
  - `call_direction` - "inbound" or "outbound"
  - `call_answered` - Boolean
  - `call_duration` - Seconds
- **UI Gap**: The Activity Timeline shows basic call data but doesn't display Salestrail-specific fields (recordings, direction badges, auto-logged indicators)

---

## Implementation Plan

### 1. Create SalestrailCallsCard Component

**New file**: `src/components/crm/detail/SalestrailCallsCard.tsx`

A dedicated card component to display Salestrail-logged calls with:

- **Header**: "Call History" with phone icon and Salestrail badge
- **Call List**: Chronological list of calls with:
  - Direction badge (Inbound/Outbound with arrow icons)
  - Answered/Missed status indicator
  - Duration display (formatted as mm:ss)
  - Recording playback button (if URL exists)
  - Auto-logged indicator badge
  - Timestamp

```text
+----------------------------------------+
|  Phone  Call History  [Salestrail]     |
+----------------------------------------+
|  [->] Outbound | Answered | 2m 34s     |
|  [Play] Recording available            |
|  [Auto-logged via Salestrail]          |
|  5 minutes ago                         |
|----------------------------------------|
|  [<-] Inbound | Missed | 0s            |
|  No recording                          |
|  [Auto-logged via Salestrail]          |
|  2 hours ago                           |
+----------------------------------------+
```

### 2. Update ActivityTimeline Component

**File**: `src/components/crm/detail/ActivityTimeline.tsx`

Enhance the existing timeline to show Salestrail-specific data for call activities:

- Add direction badge (incoming/outgoing arrow icon)
- Add recording playback inline if `salestrail_recording_url` exists
- Add "Auto-logged" badge for activities with `salestrail_call_id`
- Show call answered/missed status more prominently

### 3. Create Audio Player Component

**New file**: `src/components/crm/detail/CallRecordingPlayer.tsx`

A small audio player component for playing Salestrail recordings:

- Play/Pause button
- Progress bar
- Duration display
- Download button

### 4. Update LeadDetailPage Layout

**File**: `src/pages/crm/agent/LeadDetailPage.tsx`

Add the SalestrailCallsCard to the right column sidebar, positioned below Admin Controls and above Lead Source:

```text
+------------------+------------------+
|  Left Column     |  Right Column    |
|  (2/3 width)     |  (1/3 width)     |
|------------------|------------------|
|  Contact Info    |  Admin Controls  |
|  Property        |  [NEW] Salestrail|
|  Emma Chat       |  Lead Source     |
|  Form Submission |  Assignment      |
|  Activity        |  Quick Notes     |
+------------------+------------------+
```

### 5. Create useSalestrailCalls Hook

**New file**: `src/hooks/useSalestrailCalls.ts`

A dedicated hook to fetch Salestrail-logged calls for a lead:

- Query `crm_activities` where `salestrail_call_id IS NOT NULL`
- Filter by `lead_id`
- Include real-time subscription for new calls
- Return calls, loading state, and count

---

## Technical Details

### New Component: SalestrailCallsCard.tsx

```typescript
interface SalestrailCallsCardProps {
  leadId: string;
  phoneNumber?: string;
}

// Features:
// - Filter activities by salestrail_call_id presence
// - Display direction with PhoneIncoming/PhoneOutgoing icons
// - Show call_answered status with color coding
// - Audio player for salestrail_recording_url
// - Collapsible to show/hide older calls
// - "No calls yet" empty state
```

### ActivityTimeline Enhancements

```typescript
// Add to ActivityTimelineItem:
{activity.salestrail_call_id && (
  <>
    {/* Direction badge */}
    <Badge variant="outline" className="text-xs">
      {activity.call_direction === 'inbound' 
        ? <PhoneIncoming className="w-3 h-3 mr-1" />
        : <PhoneOutgoing className="w-3 h-3 mr-1" />}
      {activity.call_direction}
    </Badge>
    
    {/* Auto-logged indicator */}
    <Badge variant="outline" className="text-xs bg-purple-50">
      Auto-logged
    </Badge>
    
    {/* Recording player */}
    {activity.salestrail_recording_url && (
      <CallRecordingPlayer url={activity.salestrail_recording_url} />
    )}
  </>
)}
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/crm/detail/SalestrailCallsCard.tsx` | Create | Dedicated Salestrail call history card |
| `src/components/crm/detail/CallRecordingPlayer.tsx` | Create | Audio player for call recordings |
| `src/components/crm/detail/ActivityTimeline.tsx` | Modify | Add direction badges, auto-logged indicators, recording player |
| `src/hooks/useSalestrailCalls.ts` | Create | Hook to fetch Salestrail calls with real-time updates |
| `src/pages/crm/agent/LeadDetailPage.tsx` | Modify | Add SalestrailCallsCard to sidebar |

---

## UI Features

### Call Direction Indicators
- Inbound calls: Blue badge with incoming arrow icon
- Outbound calls: Green badge with outgoing arrow icon

### Call Status
- Answered: Green checkmark, shows duration
- Missed/No Answer: Amber warning icon, 0s duration

### Recording Playback
- Play button appears if recording URL exists
- Inline audio player with controls
- Download option for recordings

### Auto-logged Badge
- Purple "Auto-logged via Salestrail" badge
- Distinguishes automatic logs from manual entries

### Phone Number Matching
- Display matched lead phone number confirmation
- Show "Call from: +1702..." when phone differs from lead's stored number
