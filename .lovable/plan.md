

# Phase 7.14: Complete Agent Sidebar Navigation

## Overview
Update the `advisorNav` array in `PortalLayout.tsx` to use the correct, distinct icons for each nav item -- matching the reference sidebar specification. Currently most items use `FileText` as a placeholder icon.

## Changes

### Update `src/components/portal/PortalLayout.tsx`

**1. Update imports** (line 5-8):
- Add: `Building2`, `TrendingUp`, `Wrench`, `GraduationCap`, `Megaphone`, `Calendar`, `Newspaper`
- Keep existing: `Shield`, `LogOut`, `LayoutDashboard`, `FileText`, `Users`, `Send`, `FolderOpen`, `Menu`, `X`, `ChevronRight`, `MessageSquare`

**2. Update `advisorNav` icon assignments** (lines 12-27):
| Nav Item | Current Icon | New Icon |
|---|---|---|
| Dashboard | LayoutDashboard | LayoutDashboard (no change) |
| Clients | Users | Users (no change) |
| Policies | FileText | FileText (no change) |
| Carriers | Shield | Building2 |
| News | FileText | Newspaper |
| Performance | FileText | TrendingUp |
| Tools | FileText | Wrench |
| Training | FileText | GraduationCap |
| Marketing | FileText | Megaphone |
| Schedule | FileText | Calendar |
| Compliance | Shield | Shield (no change) |
| Documents | FolderOpen | FolderOpen (no change) |
| Invite Client | Send | Send (no change) |
| Messages | MessageSquare | MessageSquare (no change) |

No other structural changes needed -- the layout, brand header, user footer, mobile overlay, and client nav all remain unchanged.

