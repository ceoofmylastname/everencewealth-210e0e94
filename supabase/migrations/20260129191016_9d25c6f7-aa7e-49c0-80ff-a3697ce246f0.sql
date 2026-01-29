-- Create team_members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  role_translations JSONB DEFAULT '{}',
  bio TEXT,
  bio_translations JSONB DEFAULT '{}',
  photo_url TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  linkedin_url TEXT,
  languages_spoken TEXT[] DEFAULT '{}',
  specializations TEXT[] DEFAULT '{}',
  areas_of_expertise TEXT[] DEFAULT '{}',
  years_experience INTEGER DEFAULT 0,
  credentials TEXT[] DEFAULT '{}',
  is_founder BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Public read policy (team members are public info)
CREATE POLICY "Team members are publicly readable"
  ON public.team_members
  FOR SELECT
  TO anon, authenticated
  USING (active = true);

-- Admin write policy for INSERT
CREATE POLICY "Admins can insert team members"
  ON public.team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin write policy for UPDATE
CREATE POLICY "Admins can update team members"
  ON public.team_members
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin write policy for DELETE
CREATE POLICY "Admins can delete team members"
  ON public.team_members
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for display order
CREATE INDEX idx_team_members_display_order ON public.team_members(display_order);
CREATE INDEX idx_team_members_active ON public.team_members(active);

-- Seed with existing founders data
INSERT INTO public.team_members (name, role, role_translations, bio, bio_translations, photo_url, linkedin_url, languages_spoken, specializations, areas_of_expertise, years_experience, credentials, is_founder, display_order, active)
VALUES 
(
  'Steven Roberts',
  'Co-Founder & Managing Director',
  '{"en": "Co-Founder & Managing Director", "nl": "Mede-oprichter & Algemeen Directeur", "de": "Mitgründer & Geschäftsführer", "fr": "Co-fondateur & Directeur Général", "sv": "Medgrundare & VD", "no": "Medgrunnlegger & Daglig leder", "da": "Medstifter & Direktør", "fi": "Perustaja & Toimitusjohtaja", "pl": "Współzałożyciel & Dyrektor Zarządzający", "hu": "Társalapító & Ügyvezető"}',
  'Scottish-born Steven Roberts arrived on the Costa del Sol in 1997, initially working in hospitality before discovering his true calling in real estate in 2010. His natural talent for connecting with clients and understanding their needs led him to co-found Sentinel Estates in 2016, which later evolved into Del Sol Prime Homes.',
  '{"en": "Scottish-born Steven Roberts arrived on the Costa del Sol in 1997, initially working in hospitality before discovering his true calling in real estate in 2010. His natural talent for connecting with clients and understanding their needs led him to co-found Sentinel Estates in 2016, which later evolved into Del Sol Prime Homes.", "nl": "De in Schotland geboren Steven Roberts arriveerde in 1997 aan de Costa del Sol, werkte aanvankelijk in de horeca voordat hij in 2010 zijn ware roeping in onroerend goed ontdekte. Zijn natuurlijke talent om met klanten in contact te komen en hun behoeften te begrijpen leidde ertoe dat hij in 2016 Sentinel Estates mede oprichtte, dat later evolueerde naar Del Sol Prime Homes.", "de": "Der in Schottland geborene Steven Roberts kam 1997 an die Costa del Sol, arbeitete zunächst im Gastgewerbe, bevor er 2010 seine wahre Berufung im Immobilienbereich entdeckte. Sein natürliches Talent, mit Kunden in Kontakt zu treten und ihre Bedürfnisse zu verstehen, führte ihn 2016 zur Mitgründung von Sentinel Estates, das sich später zu Del Sol Prime Homes entwickelte."}',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
  'https://www.linkedin.com/in/steven-roberts-delsolprimehomes/',
  ARRAY['English', 'Spanish'],
  ARRAY['Marbella', 'Golden Mile', 'Beachfront Properties'],
  ARRAY['Luxury Villas', 'Client Relations', 'Property Management'],
  28,
  ARRAY['API Licensed', 'RICS Affiliate'],
  true,
  1,
  true
),
(
  'Cédric Van Hecke',
  'Co-Founder & Sales Director',
  '{"en": "Co-Founder & Sales Director", "nl": "Mede-oprichter & Verkoopdirecteur", "de": "Mitgründer & Verkaufsleiter", "fr": "Co-fondateur & Directeur Commercial", "sv": "Medgrundare & Försäljningschef", "no": "Medgrunnlegger & Salgssjef", "da": "Medstifter & Salgsdirektør", "fi": "Perustaja & Myyntijohtaja", "pl": "Współzałożyciel & Dyrektor Sprzedaży", "hu": "Társalapító & Értékesítési Igazgató"}',
  'Belgian entrepreneur Cédric Van Hecke made Spain his home in 1998, bringing with him a keen eye for market opportunities and exceptional negotiation skills. After years of building successful ventures across various sectors, he joined forces with Steven in 2016 to create what would become one of the Costa del Sol most trusted real estate agencies.',
  '{"en": "Belgian entrepreneur Cédric Van Hecke made Spain his home in 1998, bringing with him a keen eye for market opportunities and exceptional negotiation skills. After years of building successful ventures across various sectors, he joined forces with Steven in 2016 to create what would become one of the Costa del Sol most trusted real estate agencies.", "nl": "De Belgische ondernemer Cédric Van Hecke maakte in 1998 van Spanje zijn thuis, met een scherp oog voor marktkansen en uitzonderlijke onderhandelingsvaardigheden. Na jaren van het opbouwen van succesvolle ondernemingen in verschillende sectoren, bundelde hij in 2016 zijn krachten met Steven om wat een van de meest vertrouwde makelaars van de Costa del Sol zou worden te creëren."}',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
  'https://www.linkedin.com/in/cedric-vanhecke-delsolprimehomes/',
  ARRAY['Dutch', 'French', 'English', 'Spanish'],
  ARRAY['Estepona', 'New Developments', 'Investment Properties'],
  ARRAY['Off-Plan Sales', 'International Clients', 'Market Analysis'],
  27,
  ARRAY['API Licensed', 'Property Investment Certified'],
  true,
  2,
  true
),
(
  'Hans Beeckman',
  'Partner & AI Technology Director',
  '{"en": "Partner & AI Technology Director", "nl": "Partner & AI Technologie Directeur", "de": "Partner & KI-Technologiedirektor", "fr": "Partenaire & Directeur Technologie IA", "sv": "Partner & AI-teknologichef", "no": "Partner & AI-teknologisjef", "da": "Partner & AI-teknologidirektør", "fi": "Kumppani & AI-teknologiajohtaja", "pl": "Partner & Dyrektor Technologii AI", "hu": "Partner & AI Technológiai Igazgató"}',
  'Hans Beeckman, also Belgian, joined the team in 2020 bringing extensive experience in technology and digital innovation. Since 2024, he has led Del Sol Prime Homes transformation into a tech-forward agency, implementing AI-powered property matching, multilingual chatbots, and cutting-edge marketing strategies that give clients a competitive advantage in the Costa del Sol market.',
  '{"en": "Hans Beeckman, also Belgian, joined the team in 2020 bringing extensive experience in technology and digital innovation. Since 2024, he has led Del Sol Prime Homes transformation into a tech-forward agency, implementing AI-powered property matching, multilingual chatbots, and cutting-edge marketing strategies that give clients a competitive advantage in the Costa del Sol market.", "nl": "Hans Beeckman, ook Belg, trad in 2020 toe tot het team met uitgebreide ervaring in technologie en digitale innovatie. Sinds 2024 leidt hij de transformatie van Del Sol Prime Homes naar een tech-gericht bureau, met AI-gestuurde property matching, meertalige chatbots en geavanceerde marketingstrategieën die klanten een competitief voordeel geven op de Costa del Sol-markt."}',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
  'https://www.linkedin.com/in/hans-beeckman-delsolprimehomes/',
  ARRAY['Dutch', 'French', 'English', 'German'],
  ARRAY['Fuengirola', 'Benalmádena', 'Digital Marketing'],
  ARRAY['AI Technology', 'PropTech', 'Client Experience', 'SEO Strategy'],
  5,
  ARRAY['AI Specialist', 'Digital Marketing Expert'],
  true,
  3,
  true
);