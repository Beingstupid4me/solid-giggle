"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpenText, Clock3, LogOut, MenuSquare, Moon, Plus, Stethoscope, Sun, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePortalAuthStore } from "@/store/portalAuthStore";
import { usePortalTheme } from "@/hooks/usePortalTheme";

const sideNav = [
  { href: "/portal/doctor/queue", label: "Queue", icon: MenuSquare },
  { href: "/portal/doctor", label: "Cockpit", icon: Stethoscope },
  { href: "/portal/doctor/case-close", label: "Case Closure", icon: BookOpenText },
] as const;

const topNav = [
  { href: "/portal/doctor/queue", label: "Queue" },
  { href: "/portal/doctor", label: "Consultation" },
  { href: "/portal/doctor/case-close", label: "Summary" },
] as const;

export function DoctorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = usePortalAuthStore((state) => state.logout);
  const { isDark, toggleTheme } = usePortalTheme();

  const handleLogout = () => {
    logout();
    router.replace("/portal");
  };

  return (
    <div className="portal-app min-h-screen bg-slate-100 text-slate-900 md:grid md:grid-cols-[15rem_1fr]">
      <aside className="hidden border-r border-slate-200/70 bg-white/90 p-4 md:flex md:flex-col">
        <div className="mb-8 px-2">
          <p className="font-serif text-2xl font-semibold text-slate-900">SanoCare Doctor</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Clinical Node</p>
        </div>

        <nav className="space-y-2">
          {sideNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  active ? "bg-sky-100 text-primary" : "text-slate-600 hover:bg-slate-100",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2 pt-6">
          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" />
            New Consultation
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 py-2 text-sm font-medium text-slate-700"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <section className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur-xl md:px-6">
          <div className="mx-auto flex max-w-300 items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <p className="font-serif text-2xl font-semibold italic text-primary">SanoCare Clinical</p>
              <nav className="hidden items-center gap-4 md:flex">
                {topNav.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "text-sm font-semibold",
                        active ? "border-b-2 border-primary pb-1 text-primary" : "text-slate-500 hover:text-primary",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-3 text-slate-500">
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-primary"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <Clock3 className="h-4 w-4" />
              <UserCircle2 className="h-6 w-6 text-primary" />
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-primary md:hidden"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-300 px-4 py-4 md:px-6 md:py-6">{children}</main>

        <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-3 border-t border-slate-200/70 bg-white/95 px-2 py-2 backdrop-blur-xl md:hidden">
          {sideNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-semibold uppercase tracking-[0.12em]",
                  active ? "bg-sky-100 text-primary" : "text-slate-500",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </section>
    </div>
  );
}
