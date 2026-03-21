"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BellRing, CircleGauge, ListChecks, LogOut, Siren, Video, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePortalAuthStore } from "@/store/portalAuthStore";

const links = [
  { href: "/portal/field-node", label: "Duty Dashboard", icon: Siren },
  { href: "/portal/field-node/alert", label: "Dispatch Alert", icon: ListChecks },
  { href: "/portal/field-node/vitals", label: "Vitals Capture", icon: Wrench },
  { href: "/portal/field-node/video-call", label: "Tele-Triage", icon: Video },
] as const;

export function FieldNodeSideDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = usePortalAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.replace("/portal");
  };

  return (
    <aside className="fixed right-0 top-0 hidden h-screen w-76 border-l border-slate-200/70 bg-white/92 p-5 backdrop-blur-xl xl:flex xl:flex-col">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-primary">
          <CircleGauge className="h-6 w-6" />
        </div>
        <div>
          <p className="font-serif text-2xl font-semibold text-primary">Unit 42 - On Duty</p>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Paramedic Alpha</p>
        </div>
      </div>

      <nav className="space-y-2" aria-label="Field node module navigation">
        {links.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
                active ? "bg-sky-100 text-primary" : "text-slate-600 hover:bg-slate-100",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl bg-slate-100 p-4">
        <div className="mb-2 flex items-center gap-2 text-slate-700">
          <BellRing className="h-4 w-4" />
          <p className="text-xs font-bold uppercase tracking-[0.14em]">System status</p>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">Network latency 14ms • Dispatch feed is live.</p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
