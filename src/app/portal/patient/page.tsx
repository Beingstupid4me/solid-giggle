"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Activity, CalendarDays, Phone, TrendingDown, UserRound, Video } from "lucide-react";
import { usePatientPortalStore } from "@/store/patientPortalStore";
import { PatientBottomNav, PatientTopBar, SyncPill } from "@/components/patient/PatientScaffold";

const quickActions = [
  {
    title: "Book Homecare",
    desc: "Request a physician visit to your residence.",
    tone: "bg-primary text-white",
    icon: Activity,
    href: "/portal/patient/booking",
  },
  {
    title: "Teleconsultation",
    desc: "Instant video call with available specialists.",
    tone: "bg-accent text-slate-700",
    icon: Video,
    href: "/portal/patient/booking",
  },
  {
    title: "View Records",
    desc: "Access your lab results and medical history.",
    tone: "bg-slate-100 text-slate-700",
    icon: CalendarDays,
    href: "/portal/patient/vault",
  },
] as const;

export default function PortalPatientDashboardPage() {
  const { profiles, selectedProfileId, setSelectedProfile, dispatch } = usePatientPortalStore();

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedProfileId) ?? profiles[0],
    [profiles, selectedProfileId],
  );

  return (
    <div className="pb-20 md:pb-0">
      <PatientTopBar title="Sano Care" />

      <main className="mx-auto w-full max-w-6xl px-4 py-4 md:px-6">
        <section className="mb-5">
          <h1 className="font-serif text-2xl font-semibold text-slate-900 md:text-3xl">Dashboard</h1>
          <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Profile: {selectedProfile?.fullName}
          </p>
        </section>

        <div className="space-y-4 md:grid md:grid-cols-[1.4fr_0.8fr] md:gap-4 md:space-y-0">
          <section className="space-y-4">
            <article className="overflow-hidden rounded-xl bg-white shadow-sm border border-slate-200/50">
              <div className="p-4 md:p-5">
                <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {dispatch.active ? "In Transit" : "Ready"}
                </div>
                <h2 className="font-serif text-lg font-semibold text-slate-900 md:text-xl">
                  {dispatch.active ? `Arrives in ${dispatch.etaMinutes} min` : "Book a service"}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {dispatch.active
                    ? `${dispatch.medicName} is en route to your location.`
                    : "Select a service to start."}
                </p>

                <div className="mt-4 rounded-lg bg-slate-50 p-3 border border-slate-200/50">
                  <p className="text-sm font-semibold text-slate-900">{dispatch.medicName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Paramedic • {dispatch.unitCode}</p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-1 rounded-lg bg-primary py-2.5 text-xs font-semibold text-white transition hover:bg-primary/90">
                    <Phone className="h-3.5 w-3.5" />
                    Call
                  </button>
                  <Link
                    href="/portal/patient/tracking"
                    className="flex items-center justify-center rounded-lg bg-slate-100 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                  >
                    Track
                  </Link>
                </div>
              </div>

              <div className="h-32 bg-[radial-gradient(circle_at_center,rgba(43,140,238,0.15),rgba(224,242,254,0.35))]" />
            </article>

            <section className="grid gap-3 md:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className={`block rounded-lg p-4 text-left transition hover:shadow-md ${action.tone}`}
                  >
                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md bg-white/60">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-serif text-sm font-semibold leading-snug md:text-base">{action.title}</h3>
                    <p className="mt-1 text-xs leading-tight opacity-90">{action.desc}</p>
                  </Link>
                );
              })}
            </section>
          </section>

          <aside className="space-y-4">
            <section className="rounded-lg bg-white p-4 shadow-sm border border-slate-200/50">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">For</h2>
                <Link href="/portal/patient/profile" className="text-[11px] font-semibold text-primary transition hover:underline">
                  Manage
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => setSelectedProfile(profile.id)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition ${
                      selectedProfileId === profile.id
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {profile.relationship === "self" ? "Me" : profile.relationship}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-lg bg-white p-4 shadow-sm border border-slate-200/50">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-serif text-base font-semibold text-slate-900">Heart Rate</h3>
                <Link href="/portal/patient/vault" className="text-[11px] font-semibold text-primary transition hover:underline">
                  More
                </Link>
              </div>

              <div className="flex items-end gap-2 mb-4">
                <div>
                  <p className="text-2xl font-bold text-slate-900">72 <span className="text-sm font-medium text-slate-500">BPM</span></p>
                  <div className="flex items-center gap-1 mt-2 text-[11px]">
                    <TrendingDown className="h-3 w-3 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">-4% week</span>
                  </div>
                </div>
              </div>

              <div className="flex h-16 items-end gap-1">
                {[55, 42, 66, 49, 80, 46, 60].map((bar, idx) => (
                  <div
                    key={idx}
                    style={{ height: `${bar}%` }}
                    className={`flex-1 rounded-t-sm ${idx === 4 ? "bg-primary" : "bg-primary/20"}`}
                  />
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main>

      <SyncPill status="online" text="Sync" className="md:left-auto md:right-6 md:translate-x-0" />
      <PatientBottomNav basePath="/portal/patient" />
    </div>
  );
}
