
# Fix Legacy "Andalusia" Region Data in Location Pages

## Problem
The location page cards for US cities (Los Angeles, Austin, San Francisco) are displaying "Andalusia" as the region because the database records were created with legacy Spain-focused defaults: `region = 'Andalusia'` and `country = 'Spain'`.

## Root Cause
The `location_pages` table has 6 rows where US cities incorrectly have `region: "Andalusia"` and `country: "Spain"`.

## Fix

### 1. Database Update
Run a migration to correct all affected rows:

```sql
UPDATE location_pages SET region = 'CA', country = 'United States' WHERE city_slug = 'los-angeles,-ca' AND region = 'Andalusia';
UPDATE location_pages SET region = 'TX', country = 'United States' WHERE city_slug = 'austin,-tx' AND region = 'Andalusia';
UPDATE location_pages SET region = 'CA', country = 'United States' WHERE city_slug = 'san-francisco,-ca' AND region = 'Andalusia';
```

This fixes all 6 affected rows (2 per city).

### 2. Prevent Future Occurrences
Review the admin page generation flow (AdminStatePages or similar) to ensure the default `region` and `country` values are set to the correct US state and "United States" -- not "Andalusia" / "Spain". This is a code audit step.

### 3. Legacy Spain Content Cleanup (Optional)
The files `src/constants/home.ts`, `src/constants/brochures.ts`, and `src/components/home/sections/FeaturedAreas.tsx` still contain references to Andalusia, Mijas, Estepona, and other Spanish locations. These can be cleaned up in a separate pass if desired.

## Result
After the database update, the city cards will display "CA" or "TX" instead of "Andalusia", and "United States" instead of "Spain".
