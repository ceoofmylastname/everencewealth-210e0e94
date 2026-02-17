
-- Update existing data first
UPDATE policies SET product_type = 'indexed_universal_life' WHERE product_type = 'iul';
UPDATE policies SET product_type = 'whole_life' WHERE product_type = 'wl';
UPDATE policies SET product_type = 'term_life' WHERE product_type = 'term';
UPDATE policies SET product_type = 'long_term_care' WHERE product_type = 'ltc';

-- Drop old constraint and add new one
ALTER TABLE policies DROP CONSTRAINT IF EXISTS policies_product_type_check;
ALTER TABLE policies ADD CONSTRAINT policies_product_type_check 
  CHECK (product_type = ANY (ARRAY[
    'whole_life', 'term_life', 'universal_life', 'variable_life', 
    'indexed_universal_life', 'annuity', 'disability', 'long_term_care'
  ]));
