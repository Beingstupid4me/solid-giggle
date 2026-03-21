"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, FileText, Home, LogOut, LineChart, Moon, Sun, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePortalAuthStore } from "@/store/portalAuthStore";
import { usePortalTheme } from "@/hooks/usePortalTheme";

interface PatientTopBarProps {
  title?: string;
  subtitle?: string;
  showNotification?: boolean;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export function PatientTopBar({
  title,
  subtitle,
  showNotification = true,
  leftSlot,
  rightSlot,
}: PatientTopBarProps) {
  const router = useRouter();
  const logout = usePortalAuthStore((state) => state.logout);
  const { isDark, toggleTheme } = usePortalTheme();

  const handleLogout = () => {
    logout();
    router.replace("/portal");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur-xl md:px-6">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {leftSlot ?? (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <span className="text-sm font-bold">S</span>
            </div>
          )}
          <div>
            {title ? <p className="font-serif text-lg font-semibold leading-tight text-slate-900 md:text-xl">{title}</p> : null}
            {subtitle ? <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{subtitle}</p> : null}
          </div>
        </div>

        {rightSlot ?? (
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-primary"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {showNotification ? (
              <button
                type="button"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-primary"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </button>
            ) : (
              <div className="h-8 w-8" />
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-primary"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

interface PatientBottomNavProps {
  className?: string;
  basePath?: string;
}

const navItems = [
  { segment: "", label: "Home", icon: Home },
  { segment: "/tracking", label: "Tracking", icon: LineChart },
  { segment: "/vault", label: "Records", icon: FileText },
  { segment: "/profile", label: "Profile", icon: UserRound },
] as const;

export function PatientBottomNav({ className, basePath = "/portal/patient" }: PatientBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/70 bg-white/90 px-2 pb-2 pt-1.5 backdrop-blur-xl md:hidden",
        className,
      )}
      aria-label="Patient navigation"
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-1">
        {navItems.map((item) => {
          const href = `${basePath}${item.segment}`;
          const active = pathname === href;
          const Icon = item.icon;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-16 flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-2 text-[9px] font-bold uppercase tracking-[0.1em] transition",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

interface SyncPillProps {
  status?: "online" | "offline";
  text?: string;
  className?: string;
}

export function SyncPill({ status = "online", text = "Synced", className }: SyncPillProps) {
  return (
    <div
      className={cn(
        "fixed bottom-20 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-slate-800/30 bg-slate-900/90 px-3 py-1.5 text-[11px] font-semibold text-slate-100 shadow-lg",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", status === "online" ? "bg-emerald-400" : "bg-amber-400")} />
      <span className="uppercase tracking-wide">{status}</span>
      <span className="h-2 w-px bg-slate-700" />
      <span>{text}</span>
    </div>
  );
}
