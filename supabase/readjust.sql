-- 1. Create Family Members Table (Multi-profile support)
CREATE TABLE public.family_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  primary_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  relationship text NOT NULL, -- 'Self', 'Spouse', 'Child', 'Parent'
  age integer,
  blood_group text,
  allergies text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT family_members_pkey PRIMARY KEY (id)
);

-- 2. Add Clinical & Operational columns to Consultations
ALTER TABLE public.consultations 
ADD COLUMN family_member_id uuid REFERENCES public.family_members(id),
ADD COLUMN doctor_notes text,
ADD COLUMN prescription_url text, -- For Supabase Storage PDF links
ADD COLUMN meet_link text,       -- 3rd party Google Meet/Jitsi link
ADD COLUMN base_cost numeric DEFAULT 0,
ADD COLUMN time_cost numeric DEFAULT 0,
ADD COLUMN distance_cost numeric DEFAULT 0;

-- 3. Enable RLS for Family Members
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own family" 
ON public.family_members FOR ALL 
USING (auth.uid() = primary_user_id);
