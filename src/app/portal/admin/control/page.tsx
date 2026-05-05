"use client";

import { useEffect, useState } from "react";
import { Activity, RefreshCw, Users } from "lucide-react";
import { useAllCases } from "@/hooks/useSupabaseIntegration";

type ControlCase = {
  id: string;
  status: string;
  created_at?: string;
  doctor_name?: string;
  profiles?: { full_name?: string };
  service_type?: string;
};

export default function AdminControlPage() {
  const [cases, setCases] = useState<ControlCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const { getAllCases } = useAllCases();

  const loadCases = async () => {
    setLoading(true);
    const result = await getAllCases({ limit: 50 });
    if (result?.data) {
      setCases(result.data as ControlCase[]);
      setLastUpdated(new Date().toLocaleTimeString());
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadCases();
  }, []);

  const pendingCount = cases.filter((item) => item.status === "pending").length;
  const activeCount = cases.filter((item) => item.status !== "completed" && item.status !== "cancelled").length;

  return (
    <section className="space-y-5 rounded-2xl bg-white p-4 shadow-(--ds-shadow-sm) md:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Admin Control</p>
          <h1 className="mt-2 font-serif text-2xl font-semibold text-slate-900 md:text-3xl">Live queue overview</h1>
          <p className="mt-2 text-sm text-slate-600">Operational summary of the latest cases surfaced from the shared admin hook.</p>
        </div>
        <button
          type="button"
          onClick={() => void loadCases()}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-primary/90"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Total Cases</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-slate-900">{cases.length}</p>
        </article>
        <article className="rounded-xl bg-red-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-700">Pending</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-red-700">{pendingCount}</p>
        </article>
        <article className="rounded-xl bg-emerald-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Active</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-emerald-700">{activeCount}</p>
        </article>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Users className="h-4 w-4" />
        <span>{loading ? "Loading cases..." : `Last updated ${lastUpdated || "just now"}`}</span>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Activity className="h-4 w-4 text-primary" />
            Recent cases
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {cases.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">No cases available</div>
          ) : (
            cases.slice(0, 10).map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.profiles?.full_name ?? "Patient"}</p>
                  <p className="text-xs text-slate-500">{item.id} · {item.service_type ?? "case"}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-700">
                  {item.status}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </section>
  );
}
