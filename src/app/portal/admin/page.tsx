"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { useAllCases } from "@/hooks/useSupabaseIntegration";

interface CaseCard {
  id: string;
  patientId: string;
  title: string;
  detail: string;
  time: string;
  tone: string;
  cta: string;
  ctaTone: string;
}

export default function AdminHeatmapPage() {
  const [cases, setCases] = useState<CaseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ activeMedics: 0, criticalCases: 0, avgResponse: "0m" });
  const { getAllCases } = useAllCases();

  useEffect(() => {
    const loadCases = async () => {
      setLoading(true);
      try {
        const result = await getAllCases({ status: "pending,assigned", limit: 3 });
        if (result && result.data) {
          const transformed: CaseCard[] = result.data.map((consultation: any) => {
            const date = new Date(consultation.created_at);
            const now = new Date();
            const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
            const timeLabel = diffMin < 1 ? "just now" : `${diffMin}m ago`;

            let severity = "primary";
            if (consultation.status === "pending" && diffMin > 30) severity = "red";
            else if (consultation.status === "escalate") severity = "red";
            else if (consultation.status === "monitor") severity = "amber";

            return {
              id: consultation.id.slice(0, 8),
              patientId: consultation.id,
              title: consultation.chief_complaint || "Medical Consultation",
              detail: `${consultation.profiles?.full_name || "Patient"} • ${consultation.service_type}`,
              time: timeLabel,
              tone: severity === "red" ? "border-l-red-600" : severity === "amber" ? "border-l-amber-500" : "border-l-primary",
              cta: consultation.status === "pending" ? "Dispatch Closest" : "Review Details",
              ctaTone: consultation.status === "pending" ? "bg-primary text-white" : "bg-slate-100 text-slate-700",
            };
          });
          setCases(transformed);

          // Calculate stats
          const allCasesResult = await getAllCases({});
          if (allCasesResult && allCasesResult.data) {
            const criticalCount = allCasesResult.data.filter((c: any) => c.status === "escalate" || c.status === "critical").length;
            setStats({
              activeMedics: allCasesResult.data.length || 32,
              criticalCases: criticalCount,
              avgResponse: "4.2m",
            });
          }
          setError(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load cases");
      } finally {
        setLoading(false);
      }
    };

    loadCases();
  }, [getAllCases]);
  return (
    <section className="relative overflow-hidden rounded-2xl bg-slate-950 shadow-[0_24px_48px_rgba(15,23,42,0.35)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(30,64,175,0.3),transparent_45%),radial-gradient(circle_at_80%_85%,rgba(14,116,144,0.35),transparent_40%)]" />

      <div className="relative grid min-h-[76vh] gap-4 p-3 sm:p-4 lg:grid-cols-[1fr_22rem] lg:p-6">
        <section className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/70 p-4 backdrop-blur-xl sm:p-6">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:38px_38px] opacity-25" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/40" />

          <div className="relative h-full min-h-[380px]">
            <div className="absolute left-[16%] top-[42%] h-4 w-4 rounded-full border-2 border-white bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.85)]" />
            <div className="absolute left-[44%] top-[28%] h-4 w-4 rounded-full border-2 border-white bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.9)]" />
            <div className="absolute left-[70%] top-[60%] h-4 w-4 rounded-full border-2 border-white bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.9)]" />
            <div className="absolute left-[52%] top-[80%] h-4 w-4 rounded-full border-2 border-white bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.85)]" />

            <div className="absolute left-[30%] top-[34%] rounded-lg bg-red-700 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
              Urgent Heart Rate Spike
            </div>

            <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-slate-900/75 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-200">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                {stats.activeMedics} Medics Active
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                {stats.criticalCases} Critical Pending
              </span>
            </div>

            <div className="absolute bottom-3 right-3 grid grid-cols-2 gap-2">
              <article className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">Avg Response</p>
                <p className="mt-1 text-2xl font-bold text-white">{stats.avgResponse}</p>
              </article>
              <article className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">Cases Pending</p>
                <p className="mt-1 text-2xl font-bold text-white">{cases.length}</p>
              </article>
            </div>
          </div>
        </section>

        <aside className="rounded-xl border border-white/20 bg-white/85 p-4 shadow-(--ds-shadow-md) backdrop-blur-xl sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-semibold text-slate-900">Urgent Unassigned</h2>
            <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${loading ? "bg-slate-100 text-slate-700" : "bg-red-100 text-red-700"}`}>
              {loading ? "Loading..." : "Live"}
            </span>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-red-700 border border-red-200 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-slate-600">Loading cases...</div>
          ) : cases.length === 0 ? (
            <div className="text-center py-8 text-slate-600">No pending cases</div>
          ) : (
            <div className="space-y-3">
              {cases.map((item) => (
                <article key={item.patientId} className={`rounded-lg border-l-4 bg-slate-50 p-3 ${item.tone}`}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Patient ID: {item.id}</p>
                    <span className="text-[10px] font-bold text-slate-500">{item.time}</span>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.detail}</p>
                  <button className={`mt-3 w-full rounded-md px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] transition hover:opacity-90 ${item.ctaTone}`}>
                    {item.cta}
                  </button>
                </article>
              ))}
            </div>
          )}

          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 py-2 text-xs font-semibold text-primary transition hover:bg-primary/5">
            <MapPin className="h-3.5 w-3.5" />
            View All Queued ({cases.length || 0})
          </button>
        </aside>
      </div>
    </section>
  );
}
