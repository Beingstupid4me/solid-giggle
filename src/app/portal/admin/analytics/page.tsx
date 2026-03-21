"use client";

const kpis = [
  { label: "Avg Response Time", value: "4.2m", target: "< 30m target", tone: "text-primary" },
  { label: "Consultations Today", value: "142", target: "+18% vs yesterday", tone: "text-slate-900" },
  { label: "Revenue Generated", value: "Rs 1.28L", target: "Projected EOD Rs 2.9L", tone: "text-emerald-700" },
] as const;

const carehubRows = [
  { name: "North HQ", response: "3.9m", consultations: 54, utilization: "86%" },
  { name: "East Branch", response: "5.1m", consultations: 31, utilization: "79%" },
  { name: "West Hub", response: "4.6m", consultations: 27, utilization: "83%" },
  { name: "South Relay", response: "4.8m", consultations: 30, utilization: "81%" },
] as const;

export default function AdminAnalyticsPage() {
  return (
    <section className="space-y-5">
      <header>
        <h1 className="font-serif text-2xl font-semibold text-slate-900 md:text-3xl">Financial and Performance Analytics</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Central KPI surface for operational speed, encounter volume, and city-wide revenue performance.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map((item) => (
          <article key={item.label} className="rounded-xl bg-white p-5 shadow-(--ds-shadow-sm)">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
            <p className={`mt-2 font-serif text-2xl font-semibold md:text-3xl ${item.tone}`}>{item.value}</p>
            <p className="mt-3 text-xs font-medium text-slate-500">{item.target}</p>
          </article>
        ))}
      </div>

      <section className="rounded-xl bg-white shadow-(--ds-shadow-sm)">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 md:px-6">
          <h2 className="font-serif text-xl font-semibold text-slate-900">Carehub Performance Grid</h2>
          <button className="rounded-md bg-primary px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white">
            Download CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-160 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 md:px-6">Carehub</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 md:px-6">Avg Response</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 md:px-6">Consultations</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 md:px-6">Medic Utilization</th>
              </tr>
            </thead>
            <tbody>
              {carehubRows.map((row) => (
                <tr key={row.name} className="border-b border-slate-100 last:border-none">
                  <td className="px-4 py-4 text-sm font-semibold text-slate-900 md:px-6">{row.name}</td>
                  <td className="px-4 py-4 text-sm text-slate-700 md:px-6">{row.response}</td>
                  <td className="px-4 py-4 text-sm text-slate-700 md:px-6">{row.consultations}</td>
                  <td className="px-4 py-4 text-sm text-slate-700 md:px-6">{row.utilization}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
