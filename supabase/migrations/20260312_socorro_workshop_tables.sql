-- Socorro ISD Workshop Registration System
-- Tables, RLS policies, and indexes

-- 1. Workshop Advisors (standalone, no FK to existing advisors table)
CREATE TABLE IF NOT EXISTS socorro_workshop_advisors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  headshot_url TEXT,
  bio TEXT,
  is_approved BOOLEAN DEFAULT false,
  auth_user_id UUID REFERENCES auth.users(id),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Advisor Availability (time slots per date)
CREATE TABLE IF NOT EXISTS socorro_advisor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id UUID NOT NULL REFERENCES socorro_workshop_advisors(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  is_booked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(advisor_id, event_date, time_slot)
);

-- 3. Workshop Registrations
CREATE TABLE IF NOT EXISTS socorro_workshop_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id UUID NOT NULL REFERENCES socorro_workshop_advisors(id),
  availability_slot_id UUID NOT NULL REFERENCES socorro_advisor_availability(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  selected_date DATE NOT NULL,
  selected_time TEXT NOT NULL,
  ghl_webhook_sent BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_socorro_avail_advisor_date ON socorro_advisor_availability(advisor_id, event_date);
CREATE INDEX idx_socorro_avail_not_booked ON socorro_advisor_availability(is_booked) WHERE is_booked = false;
CREATE INDEX idx_socorro_reg_advisor ON socorro_workshop_registrations(advisor_id);
CREATE INDEX idx_socorro_reg_email ON socorro_workshop_registrations(email);

-- RLS
ALTER TABLE socorro_workshop_advisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE socorro_advisor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE socorro_workshop_registrations ENABLE ROW LEVEL SECURITY;

-- Public can read approved advisors
CREATE POLICY "Public read approved socorro advisors" ON socorro_workshop_advisors
  FOR SELECT USING (is_approved = true);

-- Public can read all availability (to see which slots are taken)
CREATE POLICY "Public read socorro availability" ON socorro_advisor_availability
  FOR SELECT USING (true);

-- Public can insert registrations (for the edge function with anon key fallback)
CREATE POLICY "Public insert socorro registrations" ON socorro_workshop_registrations
  FOR INSERT WITH CHECK (true);

-- Advisor self-management of availability
CREATE POLICY "Advisor manage own socorro availability" ON socorro_advisor_availability
  FOR ALL USING (
    advisor_id IN (
      SELECT id FROM socorro_workshop_advisors WHERE auth_user_id = auth.uid()
    )
  );

-- Advisor read own registrations
CREATE POLICY "Advisor read own socorro registrations" ON socorro_workshop_registrations
  FOR SELECT USING (
    advisor_id IN (
      SELECT id FROM socorro_workshop_advisors WHERE auth_user_id = auth.uid()
    )
  );

-- Admin full access
CREATE POLICY "Admin full access socorro advisors" ON socorro_workshop_advisors
  FOR ALL USING (
    EXISTS (SELECT 1 FROM portal_users WHERE auth_user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin full access socorro availability" ON socorro_advisor_availability
  FOR ALL USING (
    EXISTS (SELECT 1 FROM portal_users WHERE auth_user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin full access socorro registrations" ON socorro_workshop_registrations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM portal_users WHERE auth_user_id = auth.uid() AND role = 'admin')
  );
