-- Compliance hardening for realtime, RLS, and distance calculation
-- Date: 2026-03-25

-- 1) Ensure realtime publication includes required tables.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'consultations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.consultations;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'vitals'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.vitals;
  END IF;
END $$;

-- 2) Vitals RLS baseline required by field + doctor workflows.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'vitals'
      AND policyname = 'vitals_insert_authenticated'
  ) THEN
    CREATE POLICY vitals_insert_authenticated
      ON public.vitals
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'vitals'
      AND policyname = 'vitals_select_authenticated'
  ) THEN
    CREATE POLICY vitals_select_authenticated
      ON public.vitals
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- 3) Safe live-location access surface for maps.
-- Note: PostgreSQL does not support column-only RLS; expose a dedicated map view.
CREATE OR REPLACE VIEW public.medic_live_locations AS
SELECT
  p.id,
  p.full_name,
  p.live_location,
  p.location_updated_at,
  p.is_online,
  p.battery_percent
FROM public.profiles p
WHERE p.role = 'medic';

GRANT SELECT ON public.medic_live_locations TO authenticated;

-- 4) PostGIS distance helper used by backend billing logic.
-- Returns distance in KM between carehub location and patient location for a consultation.
CREATE OR REPLACE FUNCTION public.consultation_distance_km(p_consultation_id uuid)
RETURNS double precision
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_distance double precision := 0;
  v_has_carehub boolean := false;
  v_has_location boolean := false;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'carehubs'
  ) INTO v_has_carehub;

  IF NOT v_has_carehub THEN
    RETURN 0;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'carehubs' AND column_name = 'location'
  ) INTO v_has_location;

  IF NOT v_has_location THEN
    RETURN 0;
  END IF;

  EXECUTE '
    SELECT COALESCE(
      ST_Distance(ch.location::geography, c.patient_location::geography) / 1000.0,
      0
    )
    FROM public.consultations c
    LEFT JOIN public.carehubs ch ON ch.id = c.carehub_id
    WHERE c.id = $1
  '
  INTO v_distance
  USING p_consultation_id;

  RETURN COALESCE(v_distance, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.consultation_distance_km(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.consultation_distance_km(uuid) TO service_role;
