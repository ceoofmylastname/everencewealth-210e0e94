

# Fix: Policy Product Type Check Constraint Mismatch

## Problem
The form in `PolicyForm.tsx` sends product type values like `whole_life`, `term_life`, `indexed_universal_life`, `universal_life`, `variable_life`, `annuity`, `disability`, `long_term_care`. But the database has a CHECK constraint (`policies_product_type_check`) that only allows: `iul`, `wl`, `term`, `annuity`, `ltc`, `disability`.

This causes the error: *"new row for relation 'policies' violates check constraint 'policies_product_type_check'"*

## Solution
Run a database migration to drop the old constraint and add a new one that accepts all the form values.

### Migration SQL
```sql
ALTER TABLE policies DROP CONSTRAINT policies_product_type_check;
ALTER TABLE policies ADD CONSTRAINT policies_product_type_check 
  CHECK (product_type = ANY (ARRAY[
    'whole_life', 'term_life', 'universal_life', 'variable_life', 
    'indexed_universal_life', 'annuity', 'disability', 'long_term_care'
  ]));
```

### Existing Data
Update any existing rows that use the old short codes to the new descriptive values:
```sql
UPDATE policies SET product_type = 'indexed_universal_life' WHERE product_type = 'iul';
UPDATE policies SET product_type = 'whole_life' WHERE product_type = 'wl';
UPDATE policies SET product_type = 'term_life' WHERE product_type = 'term';
UPDATE policies SET product_type = 'long_term_care' WHERE product_type = 'ltc';
```

### No Code Changes Needed
The form already uses the correct descriptive values. Only the database constraint needs updating.
