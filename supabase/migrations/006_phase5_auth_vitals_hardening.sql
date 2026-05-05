-- Phase 5 hardening: lock profile role and support idempotent vitals sync.

ALTER TABLE public.vitals
ADD COLUMN IF NOT EXISTS sync_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_vitals_consultation_sync_key
ON public.vitals (consultation_id, sync_key)
WHERE sync_key IS NOT NULL;

CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    RAISE EXCEPTION 'profiles.role is read-only after registration';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_role_change ON public.profiles;

CREATE TRIGGER trg_prevent_profile_role_change
BEFORE UPDATE OF role ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_role_change();
