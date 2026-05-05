-- Seed linked dummy data for testing workflows.
-- Anchored profile: phone ending with 6387770256

DO $$
DECLARE
  v_target_user_id uuid;
  v_paramedic_id uuid;
  v_booking_1 uuid;
  v_booking_2 uuid;
  v_consultation_closed uuid;
  v_consultation_active uuid;
BEGIN
  -- Resolve auth user by last 10 digits to support formats like +91..., 91..., etc.
  SELECT id
  INTO v_target_user_id
  FROM auth.users
  WHERE right(regexp_replace(coalesce(phone, ''), '\\D', '', 'g'), 10) = '6387770256'
     OR right(regexp_replace(coalesce(email, ''), '\\D', '', 'g'), 10) = '6387770256'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_target_user_id IS NULL THEN
    RAISE NOTICE 'No auth user found for phone 6387770256. Create/login this user first, then re-run migration.';
    RETURN;
  END IF;

  -- Ensure profile exists/updated for target user.
  INSERT INTO public.profiles (id, full_name, phone, role, is_online)
  VALUES (v_target_user_id, 'Hehe Test Patient', '916387770256', 'patient', false)
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    is_online = EXCLUDED.is_online;

  -- Seed paramedics table.
  INSERT INTO public.paramedics (name, phone, specialty, is_active)
  VALUES
    ('Ravi Kumar', '9000000001', 'General', true),
    ('Neha Sharma', '9000000002', 'Trauma', true)
  ON CONFLICT (phone) DO UPDATE SET
    name = EXCLUDED.name,
    specialty = EXCLUDED.specialty,
    is_active = EXCLUDED.is_active;

  SELECT id INTO v_paramedic_id
  FROM public.paramedics
  WHERE phone = '9000000001'
  LIMIT 1;

  -- Seed bookings linked to paramedic.
  INSERT INTO public.bookings (
    patient_name, phone, service_category, specific_ailment, manual_address, gps_location,
    status, amount, assigned_paramedic, assigned_paramedic_id, dispatched_at
  )
  VALUES (
    'Hehe Test Patient',
    '916387770256',
    'homecare',
    'Fever and fatigue',
    'Test Address, Delhi',
    '{"lat":28.6139,"lng":77.2090}'::jsonb,
    'DISPATCHED',
    499,
    'Ravi Kumar',
    v_paramedic_id,
    now() - interval '20 minutes'
  )
  RETURNING id INTO v_booking_1;

  INSERT INTO public.bookings (
    patient_name, phone, service_category, specific_ailment, manual_address, gps_location,
    status, amount, assigned_paramedic, assigned_paramedic_id, dispatched_at
  )
  VALUES (
    'Hehe Test Patient',
    '916387770256',
    'diagnostics',
    'Routine checkup',
    'Test Address, Delhi',
    '{"lat":28.6145,"lng":77.2102}'::jsonb,
    'PENDING',
    0,
    null,
    null,
    null
  )
  RETURNING id INTO v_booking_2;

  -- Seed consultations linked to the anchored profile.
  INSERT INTO public.consultations (
    patient_id, medic_id, doctor_id, status, patient_location, address_line,
    cost_total, created_at, closed_at
  )
  VALUES (
    v_target_user_id,
    v_target_user_id,
    v_target_user_id,
    'closed',
    ST_SetSRID(ST_MakePoint(77.2090, 28.6139), 4326)::geography,
    'Test Address, Delhi',
    1099,
    now() - interval '3 days',
    now() - interval '3 days' + interval '40 minutes'
  )
  RETURNING id INTO v_consultation_closed;

  INSERT INTO public.consultations (
    patient_id, medic_id, doctor_id, status, patient_location, address_line,
    cost_total, created_at, closed_at
  )
  VALUES (
    v_target_user_id,
    v_target_user_id,
    v_target_user_id,
    'assigned',
    ST_SetSRID(ST_MakePoint(77.2102, 28.6145), 4326)::geography,
    'Test Address, Delhi',
    499,
    now() - interval '10 minutes',
    null
  )
  RETURNING id INTO v_consultation_active;

  -- Seed vitals linked to consultation.
  INSERT INTO public.vitals (
    consultation_id, systolic, diastolic, heart_rate, temperature, spo2, captured_at
  )
  VALUES
    (v_consultation_closed, 122, 82, 76, 98.6, 98, now() - interval '3 days' + interval '10 minutes'),
    (v_consultation_closed, 124, 80, 78, 98.4, 99, now() - interval '3 days' + interval '20 minutes'),
    (v_consultation_active, 126, 84, 88, 99.1, 97, now() - interval '5 minutes');

  RAISE NOTICE 'Seed data inserted for user id % (phone 6387770256).', v_target_user_id;
END $$;
