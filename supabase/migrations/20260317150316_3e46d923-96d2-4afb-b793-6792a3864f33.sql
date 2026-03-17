
-- Species table
CREATE TABLE public.species (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  common_name TEXT NOT NULL,
  scientific_name TEXT NOT NULL,
  kingdom TEXT NOT NULL DEFAULT 'Animalia',
  conservation_status TEXT NOT NULL DEFAULT 'LC' CHECK (conservation_status IN ('LC', 'NT', 'VU', 'EN', 'CR')),
  population_estimate INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.species ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read species" ON public.species FOR SELECT USING (true);
CREATE POLICY "Anyone can insert species" ON public.species FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update species" ON public.species FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete species" ON public.species FOR DELETE USING (true);

-- Habitats table
CREATE TABLE public.habitats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  habitat_type TEXT NOT NULL,
  location TEXT NOT NULL,
  area_hectares NUMERIC,
  threat_level TEXT NOT NULL DEFAULT 'low' CHECK (threat_level IN ('low', 'moderate', 'high', 'critical')),
  biodiversity_index NUMERIC,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.habitats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read habitats" ON public.habitats FOR SELECT USING (true);
CREATE POLICY "Anyone can insert habitats" ON public.habitats FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update habitats" ON public.habitats FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete habitats" ON public.habitats FOR DELETE USING (true);

-- Observations table
CREATE TABLE public.observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  species_id UUID REFERENCES public.species(id) ON DELETE SET NULL,
  habitat_id UUID REFERENCES public.habitats(id) ON DELETE SET NULL,
  observer_name TEXT NOT NULL,
  observation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  latitude NUMERIC,
  longitude NUMERIC,
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read observations" ON public.observations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert observations" ON public.observations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update observations" ON public.observations FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete observations" ON public.observations FOR DELETE USING (true);

-- Surveys table
CREATE TABLE public.surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  habitat_id UUID REFERENCES public.habitats(id) ON DELETE SET NULL,
  lead_researcher TEXT NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  methodology TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed')),
  species_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read surveys" ON public.surveys FOR SELECT USING (true);
CREATE POLICY "Anyone can insert surveys" ON public.surveys FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update surveys" ON public.surveys FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete surveys" ON public.surveys FOR DELETE USING (true);

-- Threats table
CREATE TABLE public.threats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'moderate' CHECK (severity IN ('low', 'moderate', 'high', 'critical')),
  affected_area TEXT NOT NULL,
  description TEXT,
  mitigation_plan TEXT,
  reported_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.threats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read threats" ON public.threats FOR SELECT USING (true);
CREATE POLICY "Anyone can insert threats" ON public.threats FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update threats" ON public.threats FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete threats" ON public.threats FOR DELETE USING (true);

-- Researchers table
CREATE TABLE public.researchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  specialization TEXT NOT NULL,
  institution TEXT NOT NULL,
  field_experience_years INTEGER NOT NULL DEFAULT 0,
  active_surveys INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.researchers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read researchers" ON public.researchers FOR SELECT USING (true);
CREATE POLICY "Anyone can insert researchers" ON public.researchers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update researchers" ON public.researchers FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete researchers" ON public.researchers FOR DELETE USING (true);
