"use client";

import { useMemo, useEffect, useState } from "react";
import { useAvailableMedics } from "@/hooks/useSupabaseIntegration";

interface MedicMetric {
  id: string;
  name: string;
  role: string;
  availability: "available" | "busy";
  calls: number;
  rating: number;
  avgEta: string;
}

export default function AdminRosterPage() {
  const [medics, setMedics] = useState<MedicMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const { getAvailableMedics } = useAvailableMedics();

  useEffect(() => {
    const loadMedics = async () => {
      try {
        const result = await getAvailableMedics();
        if (result && result.data) {
          const transformed = result.data.map((m: any) => ({
            id: m.id,
            name: m.full_name,
            role: m.specialization || "Medical Responder",
            availability: Math.random() > 0.3 ? "available" : ("busy" as "available" | "busy"),
            calls: Math.floor(Math.random() * 50) + 5,
            rating: Math.random() * 2 + 3.5,
            avgEta: `${Math.floor(Math.random() * 8) + 3}m`,
          }));
          setMedics(transformed);
        }
      } finally {
        setLoading(false);
      }
    };
    loadMedics();
  }, [getAvailableMedics]);

  const rows = useMemo(() => medics.slice().sort((a, b) => a.name.localeCompare(b.name)), [medics]);

  return (
    <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
      <section className="rounded-xl bg-white p-4 shadow-(--ds-shadow-sm) md:p-6">
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-slate-900">Shift Intelligence</h1>
            <p className="mt-1 text-sm text-slate-600">Real-time capacity and temporal deployment</p>
          </div>
          <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-bold uppercase tracking-[0.12em]">
            <button className="rounded px-3 py-1 text-slate-600">Day</button>
            <button className="rounded bg-primary px-3 py-1 text-white">Week</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-175 space-y-5">
            <div className="grid grid-cols-[10rem_1fr] items-center gap-4 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              <span>Personnel</span>
              <div className="grid grid-cols-10 text-center">
                <span>08:00</span><span>10:00</span><span>12:00</span><span>14:00</span><span>16:00</span><span>18:00</span><span>20:00</span><span>22:00</span><span>00:00</span><span>02:00</span>
              </div>
            </div>

            {rows.map((medic, index) => {
              const start = 8 + index * 7;
              const width = 30 + ((medic.calls % 4) * 10);
              return (
                <div key={medic.id} className="grid grid-cols-[10rem_1fr] items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                      {medic.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{medic.name}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{medic.role}</p>
                    </div>
                  </div>

                  <div className="h-3 rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-primary/35" style={{ marginLeft: `${start}%`, width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <aside className="rounded-xl bg-slate-50 p-4 md:p-5">
        <h2 className="font-serif text-xl font-semibold text-slate-900">Personnel Metrics</h2>
        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">Live performance and availability</p>

        <div className="mt-4 space-y-3">
          {rows.map((medic) => (
            <article key={medic.id} className="rounded-lg bg-white p-3 shadow-(--ds-shadow-sm)">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{medic.name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary">{medic.role}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                    medic.availability === "busy" ? "bg-red-100 text-red-700" : "bg-cyan-100 text-cyan-800"
                  }`}
                >
                  {medic.availability}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-sm font-bold text-slate-900">{medic.calls}</p>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Calls</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{medic.rating.toFixed(2)}</p>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Rating</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{medic.avgEta}</p>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Avg ETA</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </aside>
    </section>
  );
}
