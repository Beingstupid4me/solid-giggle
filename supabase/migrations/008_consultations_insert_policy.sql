-- Allow authenticated patients to create their own consultation records.
-- Fixes PostgREST 42501 (permission denied) on booking insert.

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'consultations'
      AND policyname = 'consultations_insert_patient_self'
  ) THEN
    CREATE POLICY consultations_insert_patient_self
      ON public.consultations
      FOR INSERT
      TO authenticated
      WITH CHECK (patient_id = auth.uid()::uuid);
  END IF;
END $$;
