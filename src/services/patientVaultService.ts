/**
 * Patient Vault — Supabase Service Layer
 *
 * All database queries for the Phase 8 Patient Health Vault.
 * Uses the anon key supabase client (no auth for dev phase).
 */
import { supabase } from "@/lib/supabase";

/* ─── Types ─── */
export type Relationship = "Self" | "Spouse" | "Child" | "Parent";
export type VisitStatus = "pending" | "assigned" | "in_transit" | "arrived" | "vitals_captured" | "in_consultation" | "closed" | "cancelled";

export interface FamilyMember {
  id: string;
  user_id: string;
  full_name: string;
  relationship: Relationship;
  age: number | null;
  blood_group: string | null;
  allergies: string | null;
  created_at: string;
}

export interface ConsultationRow {
  id: string;
  patient_id: string;
  medic_id: string | null;
  doctor_id: string | null;
  status: VisitStatus;
  service_category: string;
  address_line: string | null;
  created_at: string;
  assigned_at: string | null;
  arrived_at: string | null;
  closed_at: string | null;
  notes: string | null;
  // Phase 8 extended columns
  family_member_id: string | null;
  meet_link: string | null;
  doctor_notes: string | null;
  prescription_url: string | null;
  base_cost: number;
  time_cost: number;
  distance_cost: number;
  cost_total: number;
}

export interface VitalsRow {
  id: string;
  consultation_id: string;
  systolic: number | null;
  diastolic: number | null;
  heart_rate: number | null;
  temperature: number | null;
  spo2: number | null;
  notes: string | null;
  captured_at: string;
}

export interface ProfileRow {
  id: string;
  email?: string | null;
  phone: string;
  full_name: string;
  role: string;
}

/* ─── Enriched consultation for the UI ─── */
export interface EnrichedConsultation {
  id: string;
  status: VisitStatus;
  serviceType: string;
  doctorName: string;
  doctorSpeciality: string;
  createdAt: string;
  assignedAt: string | null;
  arrivedAt: string | null;
  closedAt: string | null;
  addressLine: string | null;
  meetLink: string | null;
  doctorNotes: string | null;
  prescriptionUrl: string | null;
  notes: string | null;
  baseCost: number;
  timeCost: number;
  distanceCost: number;
  totalCost: number;
  vitals: {
    bp: string;
    temperature: string;
    spo2: string;
    heartRate: string;
  } | null;
}

/* ─────────────────────────────────────────────────────────────────────
   FAMILY MEMBERS
   ───────────────────────────────────────────────────────────────────── */

/**
 * Get all family members for a given user.
 * If none exist, auto-creates a "Self" record using the user's profile name.
 */
export async function getFamilyMembers(userId: string): Promise<FamilyMember[]> {
  const { data, error } = await supabase
    .from("family_members")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[PatientVaultService] getFamilyMembers error:", error);
    return [];
  }

  if (!data || data.length === 0) {
    // Auto-create a "Self" record
    const selfMember = await autoCreateSelfMember(userId);
    return selfMember ? [selfMember] : [];
  }

  return data as FamilyMember[];
}

async function autoCreateSelfMember(userId: string): Promise<FamilyMember | null> {
  // Fetch the user's profile name
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .single();

  const fullName = profile?.full_name ?? "Patient";
  const bloodGroup = null;
  const allergies = null;

  const { data, error } = await supabase
    .from("family_members")
    .insert({
      user_id: userId,
      full_name: fullName,
      relationship: "Self",
      blood_group: bloodGroup,
      allergies: allergies,
    })
    .select()
    .single();

  if (error) {
    console.error("[PatientVaultService] autoCreateSelfMember error:", error);
    return null;
  }

  return data as FamilyMember;
}

/* ─────────────────────────────────────────────────────────────────────
   CONSULTATIONS
   ───────────────────────────────────────────────────────────────────── */

/**
 * Get all consultations for a patient, optionally filtered by family_member_id.
 * Joins with doctor profile and vitals.
 */
export async function getConsultations(
  patientId: string,
  familyMemberId?: string
): Promise<EnrichedConsultation[]> {
  let query = supabase
    .from("consultations")
    .select(`
      *,
      doctor:profiles!consultations_doctor_id_fkey(full_name, role),
      vitals(systolic, diastolic, heart_rate, temperature, spo2, captured_at)
    `)
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (familyMemberId) {
    query = query.eq("family_member_id", familyMemberId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[PatientVaultService] getConsultations error:", error);
    return [];
  }

  return (data ?? []).map((row: any) => enrichConsultation(row));
}

/**
 * Get active consultation (non-closed, non-cancelled) for a patient.
 */
export async function getActiveConsultation(
  patientId: string,
  familyMemberId?: string
): Promise<EnrichedConsultation | null> {
  let query = supabase
    .from("consultations")
    .select(`
      *,
      doctor:profiles!consultations_doctor_id_fkey(full_name, role),
      vitals(systolic, diastolic, heart_rate, temperature, spo2, captured_at)
    `)
    .eq("patient_id", patientId)
    .not("status", "in", '("closed","cancelled")')
    .order("created_at", { ascending: false })
    .limit(1);

  if (familyMemberId) {
    query = query.eq("family_member_id", familyMemberId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[PatientVaultService] getActiveConsultation error:", error);
    return null;
  }

  if (!data || data.length === 0) return null;

  return enrichConsultation(data[0]);
}

/* ─────────────────────────────────────────────────────────────────────
   PROFILE
   ───────────────────────────────────────────────────────────────────── */

export async function getPatientProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, phone, full_name, role")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("[PatientVaultService] getPatientProfile error:", error);
    return null;
  }

  return data as ProfileRow;
}

/**
 * Get all patient profiles (for dev — no auth filter).
 */
export async function getAllPatientProfiles(): Promise<ProfileRow[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, phone, full_name, role")
    .eq("role", "patient");

  if (error) {
    console.error("[PatientVaultService] getAllPatientProfiles error:", JSON.stringify(error, null, 2));
    return [];
  }

  return (data ?? []) as ProfileRow[];
}

/* ─────────────────────────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────────────────────────── */

function enrichConsultation(row: any): EnrichedConsultation {
  const latestVitals = row.vitals && row.vitals.length > 0
    ? row.vitals.sort((a: any, b: any) =>
        new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime()
      )[0]
    : null;

  const doctorName = row.doctor?.full_name ?? "Unassigned";
  const doctorRole = row.doctor?.role ?? "";

  const serviceTypeLabels: Record<string, string> = {
    homecare: "Homecare",
    teleconsult: "Teleconsultation",
    diagnostics: "Diagnostics",
    "Doctor Home Visit": "Doctor Home Visit",
    "Nursing Care": "Nursing Care",
  };

  return {
    id: row.id,
    status: row.status,
    serviceType: serviceTypeLabels[row.service_category] ?? row.service_category,
    doctorName,
    doctorSpeciality: doctorRole === "doctor" ? "General Practice" : doctorRole,
    createdAt: row.created_at,
    assignedAt: row.assigned_at,
    arrivedAt: row.arrived_at,
    closedAt: row.closed_at,
    addressLine: row.address_line,
    meetLink: row.meet_link ?? null,
    doctorNotes: row.doctor_notes ?? row.notes ?? null,
    prescriptionUrl: row.prescription_url ?? null,
    notes: row.notes,
    baseCost: row.base_cost ?? row.cost_service ?? 0,
    timeCost: row.time_cost ?? row.cost_time ?? 0,
    distanceCost: row.distance_cost ?? row.cost_distance ?? 0,
    totalCost: row.cost_total ?? 0,
    vitals: latestVitals
      ? {
          bp: `${latestVitals.systolic ?? "--"}/${latestVitals.diastolic ?? "--"} mmHg`,
          temperature: latestVitals.temperature
            ? `${latestVitals.temperature}°F`
            : "--",
          spo2: latestVitals.spo2 ? `${latestVitals.spo2}%` : "--",
          heartRate: latestVitals.heart_rate
            ? `${latestVitals.heart_rate} bpm`
            : "--",
        }
      : null,
  };
}

/* ─────────────────────────────────────────────────────────────────────
   DATE FORMATTING HELPERS
   ───────────────────────────────────────────────────────────────────── */

export function formatDateLabel(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTimeLabel(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatRelativeDate(isoDate: string): string {
  const now = new Date();
  const d = new Date(isoDate);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDateLabel(isoDate);
}
