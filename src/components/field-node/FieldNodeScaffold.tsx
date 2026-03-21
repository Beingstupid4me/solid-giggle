"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BellRing, ListChecks, LogOut, Moon, Siren, Sun, UserRound, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePortalAuthStore } from "@/store/portalAuthStore";
import { usePortalTheme } from "@/hooks/usePortalTheme";

interface FieldTopBarProps {
  title?: string;
  rightSlot?: React.ReactNode;
}

export function FieldTopBar({ title = "Field Operations", rightSlot }: FieldTopBarProps) {
  const router = useRouter();
  const logout = usePortalAuthStore((state) => state.logout);
  const { isDark, toggleTheme } = usePortalTheme();

  const handleLogout = () => {
    logout();
    router.replace("/portal");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-xl md:px-6">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Siren className="h-4 w-4" />
          </div>
          <p className="font-serif text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">{title}</p>
        </div>

        {rightSlot ?? (
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-primary"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              aria-label="Open notifications"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-primary"
            >
              <BellRing className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Logout"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-primary"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

const navItems = [
  { href: "/portal/field-node", label: "Duty", icon: Siren },
  { href: "/portal/field-node/alert", label: "Queue", icon: ListChecks },
  { href: "/portal/field-node/vitals", label: "Tools", icon: Wrench },
  { href: "/portal/field-node/video-call", label: "Profile", icon: UserRound },
] as const;

export function FieldBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/70 bg-white/95 px-2 pb-2 pt-1.5 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-16 flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-2 text-[9px] font-bold uppercase tracking-[0.1em] transition",
                active ? "bg-sky-100 text-primary" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
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
