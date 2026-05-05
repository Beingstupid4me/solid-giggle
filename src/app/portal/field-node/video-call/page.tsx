"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MicOff, PhoneOff, RefreshCcw, Signal } from "lucide-react";
import { FieldBottomNav, FieldTopBar } from "@/components/field-node/FieldNodeScaffold";
import { useFieldNodePortalStore } from "@/store/fieldNodePortalStore";
import { useGetActiveConsultation } from "@/hooks/useSupabaseIntegration";
import { supabaseBrowser } from "@/lib/supabase";

interface ConsultationData {
  doctor_name?: string;
  patient_name?: string;
  patient_age?: number;
  patient_gender?: string;
  chief_complaint?: string;
  estimated_arrival_mins?: number;
  risk_level?: string;
}

export default function FieldVideoCallPage() {
  const router = useRouter();
  const { vitals, activeConsultationId } = useFieldNodePortalStore();
  const [consultation, setConsultation] = useState<ConsultationData>({});
  const [loading, setLoading] = useState(true);
  const { getActiveConsultation } = useGetActiveConsultation();

  // Load consultation details and subscribe to updates
  useEffect(() => {
    if (!activeConsultationId) {
      setLoading(false);
      return;
    }

    const loadConsultation = async () => {
      try {
        const result = await getActiveConsultation();
        if (result && result.data) {
          const data = result.data[0];
          setConsultation({
            doctor_name: data.assigned_doctor?.full_name || "Dr. Unknown",
            patient_name: data.profiles?.full_name || "Patient",
            patient_age: data.patient_age,
            patient_gender: data.patient_gender,
            chief_complaint: data.chief_complaint,
            estimated_arrival_mins: data.estimated_arrival_mins,
            risk_level: data.risk_classification || "Standard",
          });
        }
      } catch (err) {
        console.error("Failed to load consultation:", err);
      } finally {
        setLoading(false);
      }
    };

    loadConsultation();

    // Subscribe to consultation updates
    const subscription = supabaseBrowser
      .from("consultations")
      .on("postgres_changes", { event: "*", schema: "public", table: "consultations", filter: `id=eq.${activeConsultationId}` }, (payload) => {
        if (payload.new) {
          setConsultation((prev) => ({ ...prev, ...payload.new }));
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [activeConsultationId, getActiveConsultation]);

  const handleEndCall = async () => {
    // Update consultation status to completed
    if (activeConsultationId) {
      await supabaseBrowser
        .from("consultations")
        .update({ status: "completed" })
        .eq("id", activeConsultationId);
    }
    router.push("/portal/field-node");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900 pb-22 md:pb-8">
      <FieldTopBar />

      <main className="relative h-[calc(100vh-168px)] w-full md:h-[calc(100vh-84px)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_45%,rgba(110,231,183,0.32),rgba(15,23,42,0.88)_62%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.25),rgba(15,23,42,0)_34%,rgba(15,23,42,0)_68%,rgba(15,23,42,0.62))]" />

        <section className="absolute right-4 top-4 z-20 w-36 overflow-hidden rounded-xl border border-white/20 bg-slate-800/55 shadow-(--ds-shadow-lg) backdrop-blur-xl md:right-8 md:top-8 md:w-56">
          <div className="aspect-3/4 bg-[linear-gradient(165deg,#9dd6d4,#6cb5bd_45%,#0f172a_110%)]" />
          <div className="bg-black/40 p-3">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-white">{consultation.doctor_name || "Dr. Unknown"}</p>
            <p className="mt-1 inline-flex items-center gap-2 text-xs font-semibold text-emerald-200">
              <Signal className="h-3.5 w-3.5" />
              {loading ? "Connecting..." : "Live • HD"}
            </p>
          </div>
        </section>

        <section className="absolute left-4 top-[52%] z-20 flex -translate-y-1/2 flex-col gap-3 md:left-8">
          <article className="w-48 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-md md:w-64">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/80">Blood Pressure</p>
            <p className="mt-1 font-serif text-2xl font-semibold text-white md:text-3xl">
              {vitals.systolic}
              <span className="mx-2 text-white/40">/</span>
              {vitals.diastolic}
            </p>
          </article>

          <article className="w-48 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-md md:w-64">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/80">Pulse Rate</p>
            <p className="mt-1 font-serif text-2xl font-semibold text-white md:text-3xl">{vitals.heartRate}</p>
          </article>

          <article className="w-48 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-md md:w-64">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/80">O2 Saturation</p>
            <p className="mt-1 font-serif text-2xl font-semibold text-white md:text-3xl">{vitals.spo2}%</p>
          </article>
        </section>

        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 md:bottom-8">
          <button className="grid h-12 w-12 place-items-center rounded-xl border border-white/25 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20">
            <MicOff className="h-5 w-5" />
          </button>
          <button
            onClick={handleEndCall}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-red-700 px-6 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-red-800 md:h-14 md:text-base"
          >
            <PhoneOff className="h-5 w-5" />
            End Call
          </button>
          <button className="grid h-12 w-12 place-items-center rounded-xl border border-white/25 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20">
            <RefreshCcw className="h-5 w-5" />
          </button>
        </div>

        <div className="absolute bottom-7 left-4 z-20 md:left-8 md:bottom-10">
          <p className="font-serif text-xl font-semibold text-white md:text-2xl">
            {consultation.patient_name ? `${consultation.patient_name.split(" ")[0]}, ${consultation.patient_age || "?"}${consultation.patient_gender === "M" ? "M" : "F"}` : "Patient"}
          </p>
          <div className="mt-2 flex gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
            <span className="rounded bg-sky-700/50 px-2 py-1">{consultation.risk_level || "Standard"}</span>
            <span className="rounded bg-emerald-700/45 px-2 py-1">ETA: {consultation.estimated_arrival_mins || "?"} mins</span>
          </div>
        </div>
      </main>

      <FieldBottomNav />
    </div>
  );
}
