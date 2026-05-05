"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, FileText, Stethoscope, Search, Download, X } from "lucide-react";
import { usePatientVaultStore } from "@/store/patientVaultStore";
import { formatDateLabel, formatTimeLabel } from "@/services/patientVaultService";
import type { EnrichedConsultation } from "@/services/patientVaultService";

const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

export default function TimelinePage() {
  const router = useRouter();
  const { isLoading, consultations, selectedFamily } = usePatientVaultStore();
  const family = selectedFamily();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "completed" | "active">("all");
  const [selectedRecord, setSelectedRecord] = useState<EnrichedConsultation | null>(null);

  const filtered = useMemo(() => {
    return consultations.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || c.doctorName.toLowerCase().includes(q) || c.doctorSpeciality.toLowerCase().includes(q) || (c.notes ?? "").toLowerCase().includes(q);
      const matchFilter = filterType === "all" || (filterType === "completed" && c.status === "closed") || (filterType === "active" && c.status !== "closed" && c.status !== "cancelled");
      return matchSearch && matchFilter;
    });
  }, [consultations, searchQuery, filterType]);

  // Group by month
  const grouped = useMemo(() => {
    const map: Record<string, EnrichedConsultation[]> = {};
    filtered.forEach((c) => {
      const d = new Date(c.createdAt);
      const key = d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
      (map[key] ??= []).push(c);
    });
    return Object.entries(map);
  }, [filtered]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary/25 border-t-primary" />
          <p className="text-text-secondary text-sm">Loading timeline…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(43,140,238,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(224,242,254,0.95),transparent_26%),linear-gradient(180deg,#f8fbff_0%,#eef6ff_56%,#f8f9fa_100%)]">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 md:px-6 md:py-6">
        {/* Header */}
        <div className="glass-panel sticky top-3 z-20 mb-5 rounded-3xl px-4 py-3 shadow-[0_18px_50px_rgba(43,140,238,0.08)] md:px-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => router.push("/portal/patient")} className="rounded-full bg-white/50 p-2 text-primary transition hover:bg-white md:hidden">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Clinical Timeline</p>
                <h1 className="font-serif text-xl font-semibold tracking-tight text-text-main md:text-2xl">
                  {family?.full_name ?? "Your"}&apos;s Health History
                </h1>
              </div>
            </div>
            <button type="button" onClick={() => router.push("/portal/patient")} className="hidden rounded-full border border-primary/15 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5 md:inline-flex">
              Back to Home
            </button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
          <section className="space-y-5">
            {/* Search & Filters */}
            <div className="glass-panel rounded-3xl p-4 shadow-[0_14px_40px_rgba(43,140,238,0.08)]">
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <Search className="h-4 w-4 text-text-secondary" />
                  <input type="text" placeholder="Search by doctor, specialty, or description…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 border-none bg-transparent text-sm outline-none placeholder:text-slate-400" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {([{ label: "All Visits", value: "all" }, { label: "Completed", value: "completed" }, { label: "Active", value: "active" }] as const).map((f) => (
                    <button key={f.value} type="button" onClick={() => setFilterType(f.value)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${filterType === f.value ? "bg-primary text-white" : "border border-primary/15 bg-white text-primary hover:bg-primary/5"}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline */}
            {grouped.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-sm text-text-secondary">No records found</p>
              </div>
            ) : (
              <section className="space-y-8">
                {grouped.map(([month, records]) => (
                  <div key={month} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">{month}</p>
                      <div className="flex-1 border-t border-slate-200" />
                    </div>
                    <div className="space-y-3 pl-4">
                      {records.map((rec, i) => (
                        <motion.button key={rec.id} type="button" onClick={() => setSelectedRecord(rec)}
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                          className="group w-full text-left">
                          <div className="rounded-3xl border border-slate-200/70 bg-white p-4 transition hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_18px_50px_rgba(43,140,238,0.12)]">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                                  <Stethoscope className="h-3.5 w-3.5 text-primary" /> {rec.doctorSpeciality}
                                </div>
                                <h3 className="font-serif text-lg font-semibold text-text-main md:text-xl">{rec.notes?.slice(0, 50) ?? rec.serviceType}</h3>
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
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            )}
          </section>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="glass-panel rounded-3xl p-5 shadow-[0_22px_70px_rgba(43,140,238,0.1)] md:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Timeline Stats</p>
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">Total Visits</span>
                  <span className="mt-1 block text-2xl font-semibold text-text-main">{consultations.length}</span>
                </div>
                <div className="rounded-2xl bg-emerald-50 px-4 py-3">
                  <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Completed</span>
                  <span className="mt-1 block text-2xl font-semibold text-emerald-700">{consultations.filter((c) => c.status === "closed").length}</span>
                </div>
                <div className="rounded-2xl bg-primary/10 px-4 py-3">
                  <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-primary">Active</span>
                  <span className="mt-1 block text-2xl font-semibold text-primary">{consultations.filter((c) => c.status !== "closed" && c.status !== "cancelled").length}</span>
                </div>
              </div>
            </div>
            <div className="glass-panel rounded-3xl p-5 shadow-[0_22px_70px_rgba(43,140,238,0.1)] md:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Help</p>
              <div className="mt-4 rounded-2xl bg-text-main p-4 text-white">
                <p className="font-semibold">About Your Timeline</p>
                <p className="mt-2 text-sm leading-6 text-white/75">All consultations, tests, and visits stored chronologically. Tap any entry for full details, notes, and prescriptions.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Visit Detail Modal */}
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
                  <p className="mt-1 text-sm text-text-secondary">{selectedRecord.doctorName} • {formatDateLabel(selectedRecord.createdAt)}</p>
                </div>
                <button type="button" onClick={() => setSelectedRecord(null)} className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid gap-5 px-5 py-5 md:grid-cols-2 md:px-6">
                <section className="space-y-4">
                  {selectedRecord.vitals && (
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">Vitals</p>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        {Object.entries(selectedRecord.vitals).map(([k, v]) => (
                          <div key={k} className="rounded-2xl bg-white px-4 py-3">
                            <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">{k === "bp" ? "BP" : k === "heartRate" ? "Heart Rate" : k === "bloodSugar" ? "Blood Sugar" : k.charAt(0).toUpperCase() + k.slice(1)}</span>
                            <span className="mt-1 block font-semibold text-text-main">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">Prescription</p>
                    <p className="mt-3 text-sm text-text-secondary">{selectedRecord.prescriptionUrl ? "Ready for download." : "Pending."}</p>
                    <button type="button" disabled={!selectedRecord.prescriptionUrl} onClick={() => selectedRecord.prescriptionUrl && window.open(selectedRecord.prescriptionUrl, "_blank")} className="mt-4 inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white disabled:opacity-50 transition hover:bg-primary/90">
                      <Download className="h-4 w-4" /> Download
                    </button>
                  </div>
                </section>
                <section className="space-y-4">
                  <div className="rounded-3xl bg-text-main p-4 text-white">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65">Doctor Notes</p>
                    <p className="mt-3 text-sm leading-7 text-white/85">{selectedRecord.doctorNotes ?? "Notes pending."}</p>
                  </div>
                  <button type="button" onClick={() => setSelectedRecord(null)} className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-text-main hover:bg-primary/5">Close</button>
                </section>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
