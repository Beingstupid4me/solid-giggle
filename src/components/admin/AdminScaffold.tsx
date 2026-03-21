"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  Cpu,
  HelpCircle,
  History,
  LogOut,
  Map,
  Moon,
  ReceiptText,
  Settings,
  ShieldAlert,
  Sun,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePortalAuthStore } from "@/store/portalAuthStore";
import { usePortalTheme } from "@/hooks/usePortalTheme";

const navItems = [
  { href: "/portal/admin", label: "Heatmap", icon: Map },
  { href: "/portal/admin/control", label: "Control", icon: Cpu },
  { href: "/portal/admin/operations", label: "Operations", icon: ReceiptText },
  { href: "/portal/admin/roster", label: "Roster", icon: Users },
  { href: "/portal/admin/analytics", label: "Analytics", icon: BarChart3 },
] as const;

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = usePortalAuthStore((state) => state.logout);
  const { isDark, toggleTheme } = usePortalTheme();

  const handleLogout = () => {
    logout();
    router.replace("/portal");
  };

  return (
    <div className="portal-app min-h-screen bg-slate-100 text-slate-900 md:grid md:grid-cols-[16rem_1fr]">
      <aside className="hidden border-r border-slate-200/70 bg-slate-50 p-4 md:flex md:flex-col">
        <div className="mb-6 rounded-xl bg-white p-4 shadow-(--ds-shadow-sm)">
          <p className="font-serif text-2xl font-semibold leading-tight text-primary">Command Center</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Admin Portal</p>
        </div>

        <nav className="space-y-1" aria-label="Admin navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/portal/admin" ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  active ? "bg-white text-primary shadow-(--ds-shadow-sm)" : "text-slate-600 hover:bg-slate-100",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-1 border-t border-slate-200 pt-4">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100">
            <HelpCircle className="h-4 w-4" />
            Support
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100">
            <History className="h-4 w-4" />
            Logs
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <section className="min-w-0 pb-0 md:pb-0">
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur-xl md:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div>
              <p className="font-serif text-lg font-semibold text-slate-900 md:text-xl">Sano Command Center</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Dispatch & Operations</p>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="hidden items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-red-700 md:inline-flex">
                <ShieldAlert className="h-3.5 w-3.5" />
                Manual Intervention: 02
              </span>
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-primary"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-primary" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </button>
              <button className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-primary" aria-label="Settings">
                <Settings className="h-4 w-4" />
              </button>
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

        <main className="w-full px-0 py-0">{children}</main>

        <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur-xl md:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/portal/admin" ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-semibold uppercase tracking-widest",
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
