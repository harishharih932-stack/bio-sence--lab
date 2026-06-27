
CREATE TABLE public.test_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id TEXT NOT NULL,
  sample_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.test_sessions TO anon, authenticated;
GRANT ALL ON public.test_sessions TO service_role;
ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read sessions" ON public.test_sessions FOR SELECT USING (true);
CREATE POLICY "Public can create sessions" ON public.test_sessions FOR INSERT WITH CHECK (true);

CREATE TABLE public.channel_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.test_sessions(id) ON DELETE CASCADE,
  channel_num INT NOT NULL,
  pathogen_name TEXT NOT NULL,
  infection_pct NUMERIC NOT NULL,
  wavelength_nm NUMERIC NOT NULL,
  k_value NUMERIC NOT NULL,
  neff_shift NUMERIC NOT NULL,
  confidence_score NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.channel_results TO anon, authenticated;
GRANT ALL ON public.channel_results TO service_role;
ALTER TABLE public.channel_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read channel results" ON public.channel_results FOR SELECT USING (true);
CREATE POLICY "Public can create channel results" ON public.channel_results FOR INSERT WITH CHECK (true);

CREATE INDEX idx_channel_results_session ON public.channel_results(session_id);
