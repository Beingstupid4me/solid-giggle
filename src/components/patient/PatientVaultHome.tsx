"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, CalendarDays, CheckCircle2, Download, FileText,
  HeartPulse, LayoutGrid, Sparkles, Stethoscope, Users, Video, X,
} from "lucide-react";
import { usePatientVaultStore } from "@/store/patientVaultStore";
import { formatDateLabel, formatTimeLabel } from "@/services/patientVaultService";
import type { EnrichedConsultation } from "@/services/patientVaultService";

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

export function PatientVaultHome() {
  const router = useRouter();
  const timelineRef = useRef<HTMLElement | null>(null);
  const familyRef = useRef<HTMLElement | null>(null);

  const {
    isLoading, familyMembers, selectedFamilyId, consultations,
    activeConsultation, profile, selectFamily, selectedFamily,
  } = usePatientVaultStore();

  const family = selectedFamily();
  const [selectedRecord, setSelectedRecord] = useState<EnrichedConsultation | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // Countdown timer
  useMemo(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const countdownLabel = useMemo(() => {
    if (!activeConsultation?.assignedAt) return "ETA: ~30 Mins";
    const eta = new Date(activeConsultation.assignedAt).getTime() + 30 * 60 * 1000;
    const mins = Math.max(0, Math.ceil((eta - now) / 60_000));
    return mins <= 0 ? "Medic arriving any moment." : `ETA: ~${mins} Mins`;
  }, [activeConsultation, now]);

  const totalRecords = consultations.length;
  const pendingRx = consultations.filter((c) => !c.prescriptionUrl && c.status === "closed").length;

  if (isLoading || !family) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary/25 border-t-primary" />
          <p className="text-text-secondary text-sm">Loading your vault…</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(43,140,238,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(224,242,254,0.95),transparent_26%),linear-gradient(180deg,#f8fbff_0%,#eef6ff_56%,#f8f9fa_100%)] text-text-main">
      <div className="pointer-events-none absolute inset-0 bg-dna-pattern opacity-35" />

      <motion.div variants={stagger} initial="hidden" animate="visible" className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 md:px-6 md:py-6">
        {/* ── Header ── */}
        <motion.header variants={fadeUp} className="glass-panel sticky top-3 z-20 mb-5 rounded-3xl px-4 py-3 shadow-[0_18px_50px_rgba(43,140,238,0.08)] md:px-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Patient Health Vault</p>
                <h1 className="font-serif text-xl font-semibold tracking-tight text-text-main md:text-2xl">
                  Welcome back, {family.full_name.split(" ")[0]}.
                </h1>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => router.push("/portal/patient/timeline")} className="inline-flex h-10 items-center gap-2 rounded-full border border-primary/15 bg-white px-4 text-sm font-semibold text-primary transition hover:bg-primary/5">
                <FileText className="h-4 w-4" /> Timeline
              </button>
              <button type="button" onClick={() => router.push("/portal/patient/profile")} className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark">
                <Users className="h-4 w-4" /> Profile
              </button>
            </div>
          </div>
        </motion.header>

        <section className="mb-5 grid gap-5 lg:grid-cols-[1.55fr_0.95fr]">
          <div className="space-y-5">
            {/* ── Welcome + Family Switcher ── */}
            <motion.article variants={fadeUp} className="glass-panel overflow-hidden rounded-[2rem] p-5 shadow-[0_25px_80px_rgba(43,140,238,0.12)] md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-xl space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                    <Sparkles className="h-3.5 w-3.5" /> {family.relationship} profile
                  </div>
                  <h2 className="font-serif text-3xl font-semibold tracking-tight text-text-main md:text-4xl">
                    Good day, {family.full_name.split(" ")[0]}.
                  </h2>
                  <p className="max-w-lg text-sm leading-7 text-text-secondary md:text-base">
                    Your active consultation, clinical history, and family context — all in one clean workspace.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:min-w-[18rem]">
                  {[
                    { label: "Consultations", value: totalRecords, tone: "bg-primary/10 text-primary", icon: LayoutGrid },
                    { label: "Records", value: totalRecords, tone: "bg-slate-100 text-text-main", icon: FileText },
                    { label: "Pending Rx", value: pendingRx, tone: "bg-emerald-50 text-emerald-700", icon: Sparkles },
                  ].map((c) => {
                    const Icon = c.icon;
                    return (
                      <div key={c.label} className={`rounded-2xl px-3 py-3 ${c.tone}`}>
                        <Icon className="h-4 w-4" />
                        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] opacity-80">{c.label}</p>
                        <p className="mt-1 text-xl font-semibold">{c.value}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Family member switcher */}
              <div ref={familyRef as any} className="mt-6 grid gap-3 sm:grid-cols-3">
                {familyMembers.map((fm) => {
                  const sel = fm.id === family.id;
                  return (
                    <motion.button key={fm.id} type="button" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      onClick={() => selectFamily(fm.id)}
                      className={`rounded-3xl border p-4 text-left transition ${sel ? "border-primary bg-primary text-white shadow-[0_18px_40px_rgba(43,140,238,0.18)]" : "border-slate-200/80 bg-white/85 hover:border-primary/25"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${sel ? "text-white/75" : "text-text-secondary"}`}>{fm.relationship}</p>
                          <p className="mt-1 text-lg font-semibold leading-tight">{fm.full_name}</p>
                        </div>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${sel ? "bg-white/15" : "bg-primary/10"}`}>
                          <Users className={`h-4 w-4 ${sel ? "text-white" : "text-primary"}`} />
                        </div>
                      </div>
                      <div className={`mt-4 grid gap-2 text-xs ${sel ? "text-white/80" : "text-text-secondary"}`}>
                        <p>Age {fm.age ?? "—"}</p>
                        <p>Blood group {fm.blood_group ?? "—"}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.article>

            {/* ── Active Consultation Card ── */}
            <motion.article variants={fadeUp} className="overflow-hidden rounded-[2rem] bg-text-main px-5 py-5 text-white shadow-[0_24px_70px_rgba(13,20,27,0.18)] md:px-6 md:py-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">Active consultation</p>
                  <h3 className="mt-2 font-serif text-2xl font-semibold md:text-3xl">
                    {activeConsultation ? activeConsultation.doctorName : "No active visit right now"}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/75">
                    {activeConsultation ? `${activeConsultation.doctorSpeciality} • ${activeConsultation.serviceType}` : "Your next consultation will appear here when a booking is live."}
                  </p>
                </div>
                {activeConsultation && (
                  <div className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
                    {activeConsultation.status.replace("_", " ")}
                  </div>
                )}
              </div>
              {activeConsultation && (
                <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                  <div className="space-y-4">
                    <div className="rounded-3xl bg-white/8 p-4 backdrop-blur-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">Countdown</p>
                      <p className="mt-2 text-2xl font-semibold md:text-3xl">{countdownLabel}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <div className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
                        Case #{activeConsultation.id.slice(-4).toUpperCase()}
                      </div>
                      <div className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
                        {activeConsultation.doctorSpeciality}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <button type="button" disabled={!activeConsultation.meetLink}
                      onClick={() => activeConsultation.meetLink && window.open(activeConsultation.meetLink, "_blank", "noopener")}
                      className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-3xl bg-white px-5 text-base font-semibold text-primary transition hover:-translate-y-px hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40">
                      <Video className="h-5 w-5" /> Join Call
                    </button>
                    <p className="text-center text-xs leading-5 text-white/65">
                      {activeConsultation.meetLink ? "Medic: Use this button to start the consultation with the doctor." : "Meeting link will appear once dispatched."}
                    </p>
                  </div>
                </div>
              )}
            </motion.article>

            {/* ── Quick Stats ── */}
            <motion.section variants={fadeUp} className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: CalendarDays, label: "Recent visit", value: consultations[0] ? formatDateLabel(consultations[0].createdAt) : "—", sub: consultations[0]?.notes?.slice(0, 40) ?? "No visits yet" },
                { icon: CheckCircle2, label: "All records", value: `${totalRecords} consultations`, sub: "Clean, chronological clinical history." },
                { icon: FileText, label: "Pending Rx", value: `${pendingRx} items`, sub: "Waiting for closure or upload." },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="glass-panel rounded-3xl p-4 shadow-[0_14px_40px_rgba(43,140,238,0.08)]">
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Icon className="h-4 w-4 text-primary" />
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">{s.label}</p>
                    </div>
                    <p className="mt-3 font-semibold text-text-main">{s.value}</p>
                    <p className="mt-1 text-xs text-text-secondary truncate">{s.sub}</p>
                  </div>
                );
              })}
            </motion.section>

            {/* ── Timeline Preview ── */}
            <motion.section ref={timelineRef as any} variants={fadeUp} className="glass-panel rounded-[2rem] p-5 shadow-[0_22px_70px_rgba(43,140,238,0.1)] md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Clinical timeline</p>
                  <h3 className="mt-2 font-serif text-2xl font-semibold text-text-main">Recent consultations</h3>
                </div>
                <button type="button" onClick={() => router.push("/portal/patient/timeline")} className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/15">
                  View all records <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-5 space-y-3">
                {consultations.slice(0, 4).map((rec, i) => (
                  <motion.button key={rec.id} type="button" onClick={() => setSelectedRecord(rec)}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="group w-full rounded-3xl border border-slate-200/70 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_18px_50px_rgba(43,140,238,0.12)]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                          <Stethoscope className="h-3.5 w-3.5 text-primary" /> {rec.doctorSpeciality}
                        </div>
                        <h4 className="font-serif text-lg font-semibold text-text-main md:text-xl">{rec.notes?.slice(0, 50) ?? rec.serviceType}</h4>
                        <p className="text-sm text-text-secondary">{rec.doctorName} • {formatDateLabel(rec.createdAt)} • {formatTimeLabel(rec.createdAt)}</p>
                      </div>
                      <div className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${rec.status === "closed" ? "bg-emerald-50 text-emerald-700" : "bg-primary/10 text-primary"}`}>
                        {rec.status === "closed" ? "Completed" : rec.status.replace("_", " ")}
                      </div>
                    </div>
                    {rec.vitals && (
                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs lg:grid-cols-4">
                        <div className="rounded-2xl bg-slate-50 px-3 py-2"><span className="block font-semibold text-text-main">BP</span><span className="text-text-secondary">{rec.vitals.bp}</span></div>
                        <div className="rounded-2xl bg-slate-50 px-3 py-2"><span className="block font-semibold text-text-main">Temp</span><span className="text-text-secondary">{rec.vitals.temperature}</span></div>
                        <div className="rounded-2xl bg-slate-50 px-3 py-2"><span className="block font-semibold text-text-main">SpO2</span><span className="text-text-secondary">{rec.vitals.spo2}</span></div>
                        <div className="rounded-2xl bg-slate-50 px-3 py-2"><span className="block font-semibold text-text-main">HR</span><span className="text-text-secondary">{rec.vitals.heartRate}</span></div>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.section>
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-5">
            <motion.section variants={fadeUp} className="glass-panel rounded-[2rem] p-5 shadow-[0_22px_70px_rgba(43,140,238,0.1)] md:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Selected profile</p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-2xl font-semibold text-primary">{family.full_name.charAt(0)}</div>
                <div>
                  <h3 className="font-serif text-2xl font-semibold text-text-main">{family.full_name}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{family.relationship} • {family.age ?? "—"} years</p>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm">
                {[
                  { label: "Blood group", value: family.blood_group ?? "—" },
                  { label: "Allergies", value: family.allergies ?? "None known" },
                  { label: "Emergency contact", value: profile?.phone ?? "—" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">{item.label}</span>
                    <span className="mt-1 block font-semibold text-text-main">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section variants={fadeUp} className="glass-panel rounded-[2rem] p-5 shadow-[0_22px_70px_rgba(43,140,238,0.1)] md:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Patient workflow</p>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-text-secondary">
                <li className="rounded-2xl bg-slate-50 px-4 py-3">1. Review active consultation or family history.</li>
                <li className="rounded-2xl bg-slate-50 px-4 py-3">2. Tap any visit to see vitals, notes, and prescriptions.</li>
                <li className="rounded-2xl bg-slate-50 px-4 py-3">3. Use "Join Call" when the medic arrives at your home.</li>
              </ol>
            </motion.section>
          </aside>
        </section>
      </motion.div>

      {/* ── Visit Summary Modal ── */}
      <AnimatePresence>
        {selectedRecord && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 px-4 py-4 backdrop-blur-sm md:items-center">
            <button type="button" aria-label="Close" className="absolute inset-0 cursor-default" onClick={() => setSelectedRecord(null)} />
            <motion.article initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white shadow-[0_35px_100px_rgba(15,23,42,0.35)]">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 md:px-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Visit summary</p>
                  <h3 className="mt-2 font-serif text-2xl font-semibold text-text-main md:text-3xl">{selectedRecord.notes?.slice(0, 50) ?? selectedRecord.serviceType}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{selectedRecord.doctorName} • {formatDateLabel(selectedRecord.createdAt)} • {formatTimeLabel(selectedRecord.createdAt)}</p>
                </div>
                <button type="button" onClick={() => setSelectedRecord(null)} className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid gap-5 px-5 py-5 md:grid-cols-[0.95fr_1.05fr] md:px-6 md:py-6">
                <section className="space-y-4">
                  {selectedRecord.vitals && (
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">Vitals</p>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        {Object.entries(selectedRecord.vitals).map(([k, v]) => (
                          <div key={k} className="rounded-2xl bg-white px-4 py-3">
                            <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">{k === "bp" ? "BP" : k === "heartRate" ? "Heart rate" : k === "bloodSugar" ? "Blood sugar" : k.charAt(0).toUpperCase() + k.slice(1)}</span>
                            <span className="mt-1 block font-semibold text-text-main">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">Prescription</p>
                    <p className="mt-3 text-sm leading-6 text-text-secondary">{selectedRecord.prescriptionUrl ? "Ready for download." : "Pending."}</p>
                    <button type="button" disabled={!selectedRecord.prescriptionUrl} onClick={() => selectedRecord.prescriptionUrl && window.open(selectedRecord.prescriptionUrl, "_blank")} className="mt-4 inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50">
                      <Download className="h-4 w-4" /> Download prescription
                    </button>
                  </div>
                </section>
                <section className="space-y-4">
                  <div className="rounded-3xl bg-text-main p-4 text-white">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65">Doctor notes</p>
                    <p className="mt-3 text-sm leading-7 text-white/85">{selectedRecord.doctorNotes ?? "Notes will appear once the consultation is closed."}</p>
                  </div>
                  <div className="rounded-3xl bg-primary/10 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Summary</p>
                    <p className="mt-3 text-sm leading-6 text-text-secondary">{selectedRecord.notes ?? "—"}</p>
                  </div>
                  <button type="button" onClick={() => setSelectedRecord(null)} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-text-main transition hover:border-primary/25 hover:bg-primary/5">
                    Close summary
                  </button>
                </section>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}