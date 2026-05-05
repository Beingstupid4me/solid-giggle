"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { ArrowLeft, FileText, Stethoscope, Search, Filter } from "lucide-react";

type VisitStatus = "closed" | "dispatched" | "in_consultation";

interface VisitRecord {
  id: string;
  title: string;
  doctorName: string;
  speciality: string;
  dateLabel: string;
  timeLabel: string;
  status: VisitStatus;
  summary: string;
  vitals: {
    bp: string;
    temperature: string;
    spo2: string;
    heartRate: string;
  };
  doctorNotes: string;
  prescriptionUrl?: string | null;
}

interface PatientTimelineScreenProps {
  records: VisitRecord[];
  familyName: string;
  onRecordSelect: (record: VisitRecord) => void;
}

export function PatientTimelineScreen({
  records,
  familyName,
  onRecordSelect,
}: PatientTimelineScreenProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "completed" | "pending">("all");

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.speciality.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.title.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        filterType === "all" ||
        (filterType === "completed" && record.status === "closed") ||
        (filterType === "pending" && record.status !== "closed");

      return matchesSearch && matchesFilter;
    });
  }, [records, searchQuery, filterType]);

  // Group records by month
  const groupedByMonth = useMemo(() => {
    const grouped: Record<string, VisitRecord[]> = {};
    filteredRecords.forEach((record) => {
      const monthKey = record.dateLabel.split(" ").slice(1).join(" "); // "May 2026"
      if (!grouped[monthKey]) grouped[monthKey] = [];
      grouped[monthKey].push(record);
    });
    return Object.entries(grouped).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [filteredRecords]);

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(43,140,238,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(224,242,254,0.95),transparent_26%),linear-gradient(180deg,#f8fbff_0%,#eef6ff_56%,#f8f9fa_100%)]">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 md:px-6 md:py-6">
        {/* Header */}
        <div className="glass-panel sticky top-3 z-20 mb-5 rounded-3xl px-4 py-3 shadow-[0_18px_50px_rgba(43,140,238,0.08)] md:px-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-full bg-white/50 p-2 text-primary transition hover:bg-white md:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Clinical Timeline
                </p>
                <h1 className="font-serif text-xl font-semibold tracking-tight text-text-main md:text-2xl">
                  {familyName}'s Health History
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.back()}
              className="hidden rounded-full border border-primary/15 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5 md:inline-flex"
            >
              Back
            </button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
          {/* Main Timeline */}
          <section className="space-y-5">
            {/* Search & Filters */}
            <div className="glass-panel rounded-3xl p-4 shadow-[0_14px_40px_rgba(43,140,238,0.08)]">
              <div className="space-y-4">
                {/* Search */}
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <Search className="h-4 w-4 text-text-secondary" />
                  <input
                    type="text"
                    placeholder="Search by doctor, specialty, or title…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 border-none bg-transparent text-sm outline-none placeholder:text-text-muted"
                  />
                </div>

                {/* Filter Chips */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "All Visits", value: "all" as const },
                    { label: "Completed", value: "completed" as const },
                    { label: "Pending", value: "pending" as const },
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => setFilterType(filter.value)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                        filterType === filter.value
                          ? "bg-primary text-white"
                          : "border border-primary/15 bg-white text-primary hover:bg-primary/5"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline */}
            {groupedByMonth.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-sm text-text-secondary">No records found</p>
              </div>
            ) : (
              <section className="space-y-8">
                {groupedByMonth.map(([month, monthRecords]) => (
                  <div key={month} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                        {month}
                      </p>
                      <div className="flex-1 border-t border-slate-200" />
                    </div>

                    <div className="space-y-3 pl-4">
                      {monthRecords.map((record) => (
                        <button
                          key={record.id}
                          type="button"
                          onClick={() => onRecordSelect(record)}
                          className="group w-full text-left"
                        >
                          <div className="rounded-3xl border border-slate-200/70 bg-white p-4 transition hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_18px_50px_rgba(43,140,238,0.12)]">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div className="space-y-2 flex-1">
                                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                                  <Stethoscope className="h-3.5 w-3.5 text-primary" />
                                  {record.speciality}
                                </div>
                                <h3 className="font-serif text-lg font-semibold text-text-main md:text-xl">
                                  {record.title}
                                </h3>
                                <p className="text-sm text-text-secondary">
                                  {record.doctorName} • {record.dateLabel} • {record.timeLabel}
                                </p>
                              </div>

                              <div className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${record.status === "closed" ? "bg-emerald-50 text-emerald-700" : "bg-primary/10 text-primary"}`}>
                                {record.status === "closed" ? "Completed" : "Active"}
                              </div>
                            </div>

                            <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
                              <p className="text-sm leading-6 text-text-secondary">{record.summary}</p>

                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="rounded-2xl bg-slate-50 px-3 py-2">
                                  <span className="block font-semibold text-text-main">BP</span>
                                  <span className="text-text-secondary">{record.vitals.bp}</span>
                                </div>
                                <div className="rounded-2xl bg-slate-50 px-3 py-2">
                                  <span className="block font-semibold text-text-main">Temp</span>
                                  <span className="text-text-secondary">{record.vitals.temperature}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </button>
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Timeline Stats
              </p>
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">
                    Total Visits
                  </span>
                  <span className="mt-1 block text-2xl font-semibold text-text-main">
                    {records.length}
                  </span>
                </div>
                <div className="rounded-2xl bg-emerald-50 px-4 py-3">
                  <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                    Completed
                  </span>
                  <span className="mt-1 block text-2xl font-semibold text-emerald-700">
                    {records.filter((r) => r.status === "closed").length}
                  </span>
                </div>
                <div className="rounded-2xl bg-primary/10 px-4 py-3">
                  <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                    Active/Pending
                  </span>
                  <span className="mt-1 block text-2xl font-semibold text-primary">
                    {records.filter((r) => r.status !== "closed").length}
                  </span>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-5 shadow-[0_22px_70px_rgba(43,140,238,0.1)] md:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Help
              </p>
              <div className="mt-4 rounded-2xl bg-text-main p-4 text-white">
                <p className="font-semibold">About Your Timeline</p>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  All your consultations, tests, and doctor visits are stored chronologically. Click any entry to view full details, notes, and prescriptions.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
