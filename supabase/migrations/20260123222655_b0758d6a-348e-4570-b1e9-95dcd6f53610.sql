-- Make phone_number nullable for incomplete leads
ALTER TABLE crm_leads 
ALTER COLUMN phone_number DROP NOT NULL;

-- Add contact_complete flag for easy filtering
ALTER TABLE crm_leads 
ADD COLUMN IF NOT EXISTS contact_complete boolean DEFAULT true;

-- Add index for filtering incomplete leads
CREATE INDEX IF NOT EXISTS idx_crm_leads_contact_complete 
ON crm_leads(contact_complete);

-- Update existing leads to have contact_complete = true (all current leads have phone)
UPDATE crm_leads SET contact_complete = true WHERE contact_complete IS NULL;