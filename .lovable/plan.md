
# Rebrand Location Pages: Remove Real Estate, Align to Financial Services

## Problem
Several location page components still contain legacy real estate language ("property buyers", "buyer profiles", "housing affordability", "Euro" icon, WhatsApp to a Spanish number, "10+ Languages"). These need to be updated to reflect Everence Wealth's identity as a US-based insurance and financial services firm.

## Changes

### 1. `src/components/location/BestAreasSection.tsx`
- Line 32: Change `"Top neighborhoods for property buyers"` to `"Top regions for retirement and wealth planning"`

### 2. `src/components/location/UseCaseSection.tsx`
- Line 28: Change `"Ideal scenarios and buyer profiles"` to `"Ideal scenarios and client profiles"`

### 3. `src/components/location/CostBreakdownSection.tsx`
- Line 1: Replace `Euro` icon import with `DollarSign`
- Line 32: Replace `<Euro>` with `<DollarSign>`
- Line 38: Change `"Current market prices and fees"` to `"Current costs and fee structures"`

### 4. `src/components/location/LocationCTASection.tsx`
- Line 60: The hardcoded fallback `"Connect with our local experts who can help you find your perfect property"` to `"Connect with our expert advisors who can help you build your financial strategy"` (matches the translation files which are already correct)
- Line 82: Change WhatsApp link from `wa.me/34630039090` (Spanish number) to the Everence Wealth contact page `/contact`
- Line 84: Change button text fallback from `"Contact via WhatsApp"` to `"Schedule a Consultation"`
- Line 102: Change `"10+ Languages"` fallback to `"EN/ES"` (matches translation files)
- Line 98: Change `"Licensed Agents"` fallback to `"Licensed Advisors"` (matches translation files)

### 5. `src/components/location-hub/WhatToExpectSection.tsx`
- Line 49: Change `"housing affordability"` in the Cash Flow card description to `"lifestyle affordability"` (both EN and ES versions)

### 6. `src/components/location-hub/FeaturedCitiesSection.tsx`
- Lines 24-44: Change `avgPrice` labels from real estate prices like `"From $500K"` to financial planning context labels like `"High Cost of Living"`, `"Moderate Cost of Living"`, etc. -- these currently read as property prices which is misleading for a financial services firm.

### 7. `src/pages/LocationPage.tsx`
- Line 208: Change fallback `"Key takeaways for buyers"` to `"Key takeaways for clients"`

## Summary
Approximately 10-12 small text/icon swaps across 6 files. No schema changes, no backend changes, no new files.
