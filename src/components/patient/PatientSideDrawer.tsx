"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardList, Compass, Home, LogOut, MapPinned, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePortalAuthStore } from "@/store/portalAuthStore";

const navItems = [
  {
    href: "/portal/patient",
    label: "Dashboard",
    icon: Home,
  },
  {
    href: "/portal/patient/booking",
    label: "Booking Engine",
    icon: ClipboardList,
  },
  {
    href: "/portal/patient/tracking",
    label: "Live Tracking",
    icon: MapPinned,
  },
  {
    href: "/portal/patient/vault",
    label: "Health Vault",
    icon: Compass,
  },
  {
    href: "/portal/patient/profile",
    label: "Profile & Family",
    icon: UserRound,
  },
] as const;

export function PatientSideDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = usePortalAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.replace("/portal");
  };

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-200/70 bg-white/85 p-4 backdrop-blur-xl md:block">
      <div className="mb-6 rounded-2xl bg-primary/10 p-4">
        <p className="font-serif text-2xl font-semibold text-primary">Sano Pulse</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Patient Portal</p>
      </div>

      <nav className="space-y-1" aria-label="Patient module navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-primary text-white" : "text-slate-700 hover:bg-slate-100",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
