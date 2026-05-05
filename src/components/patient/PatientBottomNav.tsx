"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Search, Calendar, FileText, User } from "lucide-react";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const PATIENT_NAV_ITEMS: NavigationItem[] = [
  {
    label: "Home",
    href: "/portal/patient",
    icon: <Home className="h-5 w-5" />,
  },
  {
    label: "Timeline",
    href: "/portal/patient/timeline",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: "Records",
    href: "/portal/patient/records",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    label: "Profile",
    href: "/portal/patient/profile",
    icon: <User className="h-5 w-5" />,
  },
];

export function PatientBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/85 backdrop-blur-xl md:hidden">
      <div className="flex justify-around">
        {PATIENT_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => router.push(item.href)}
              className="flex flex-1 flex-col items-center justify-center gap-1.5 py-3 px-2 text-xs font-semibold transition"
              aria-current={isActive ? "page" : undefined}
            >
              <div
                className={`transition ${
                  isActive ? "text-primary" : "text-text-secondary"
                }`}
              >
                {item.icon}
              </div>
              <span className={`${isActive ? "text-primary" : "text-text-secondary"}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="h-0.5 w-6 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
