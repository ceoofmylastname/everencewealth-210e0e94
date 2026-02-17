
# Update Logo and Brand Name Across All Portal Dashboards

## Overview
Replace the Shield icon + "Everence" text with the actual Everence Wealth logo image and a modern "Everence Wealth" text treatment in all three portal layouts.

## Files to Modify

### 1. `src/components/portal/PortalLayout.tsx`
**Sidebar brand area (line 76-82):** Replace the `Shield` icon div with an `<img>` tag using the provided logo URL. Update the text from "Everence" to a two-line or styled "Everence Wealth" treatment:
- "Everence" in bold serif font
- "Wealth" in lighter weight with tracking/letter-spacing for a premium editorial feel

**Mobile header (line 143-144):** Update the text from "Advisor Portal" / "Client Portal" to show a small logo + "Everence Wealth"

### 2. `src/components/portal/AdminPortalLayout.tsx`
**Sidebar brand area (line 45-52):** Same treatment -- replace `Shield` icon with the logo image, update "Everence" to "Everence Wealth" with modern styling. Keep the "Admin" badge.

**Mobile header (line ~103):** Update "Admin Panel" text to include the logo

### 3. Remove unused `Shield` import
Remove the `Shield` import from both layout files since it will no longer be used for the brand logo (check if it's used elsewhere in the file first -- it is used in the advisor nav items in PortalLayout, so only remove from AdminPortalLayout).

## Design Treatment
The brand will use:
- Logo image: `https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly611tCI/media/6993ada8dcdadb155342f28e.png` displayed at ~32px height
- "Everence" in bold serif (`font-serif font-bold text-lg`)
- "Wealth" in a lighter weight with wide letter-spacing (`font-light tracking-[0.2em] text-xs uppercase`) positioned below or inline, creating a luxury editorial look

## What Stays the Same
- All navigation items, routing, auth logic, sign-out behavior
- Sidebar structure and responsive behavior
- NotificationBell and user profile sections
