

# Fix: Training Creation Failing Due to Invalid Category

## Problem
The "Failed to create" error happens because the category value `product_knowledge` does not match the database's allowed values. The database has a check constraint that only allows these categories:
- `account_setup`
- `product_training`
- `sales_techniques`
- `compliance`
- `technology`
- `carrier_specific`
- `advanced_strategies`

The form's default category is set to `product_knowledge`, which is not in the list. The category input is also a free-text field, so any typo or unsupported value will cause this error.

## Fix

**File:** `src/pages/portal/admin/AdminTraining.tsx`

1. Change the default category from `product_knowledge` to `product_training` (line 12)
2. Replace the free-text category input with a dropdown (`<select>`) that only shows the valid category options, preventing future mismatches

## Technical Details

- Line 12: Change `defaultForm.category` from `"product_knowledge"` to `"product_training"`
- In the dialog form (around line 100), replace the `<Input>` for category with a `<select>` containing these options:
  - Account Setup (`account_setup`)
  - Product Training (`product_training`)
  - Sales Techniques (`sales_techniques`)
  - Compliance (`compliance`)
  - Technology (`technology`)
  - Carrier Specific (`carrier_specific`)
  - Advanced Strategies (`advanced_strategies`)

No database changes needed.
