"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, X } from "lucide-react";
import { PortalRole, usePortalAuthStore } from "@/store/portalAuthStore";

const roleOptions: Array<{ value: PortalRole; label: string; hint: string }> = [
  { value: "patient", label: "Patient", hint: "Use patient123" },
  { value: "medic", label: "Field Node", hint: "Use medic123" },
  { value: "doctor", label: "Doctor", hint: "Use doctor123" },
  { value: "admin", label: "Admin", hint: "Use admin123" },
];

const roleRouteMap: Record<PortalRole, string> = {
  patient: "/portal/patient",
  medic: "/portal/field-node",
  doctor: "/portal/doctor",
  admin: "/portal/admin",
};

export function PortalLoginOverlay() {
  const router = useRouter();
  const { login } = usePortalAuthStore();

  const [role, setRole] = useState<PortalRole>("patient");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const selectedRole = useMemo(() => roleOptions.find((item) => item.value === role), [role]);

  const handleClose = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }, [router]);

  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [handleClose]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = login({ role, userId, password });

    if (!result.ok) {
      setError(result.message ?? "Unable to login.");
      return;
    }

    setError("");
    router.push(roleRouteMap[role]);
  };

  return (
    <main className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 p-3 backdrop-blur-sm sm:p-6" onClick={handleClose}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(37,99,235,0.25),transparent_38%),radial-gradient(circle_at_86%_84%,rgba(14,116,144,0.22),transparent_36%)]" />

      <div
        className="relative mx-auto grid w-full max-w-6xl gap-5 rounded-3xl border border-white/35 bg-white/95 p-4 shadow-[0_30px_90px_rgba(15,23,42,0.4)] md:grid-cols-[1.1fr_0.9fr] md:p-7"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Portal login modal"
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close login"
          className="absolute right-3 top-3 z-10 rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
        >
          <X className="h-4 w-4" />
        </button>

        <section className="rounded-2xl bg-slate-50 p-5 md:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
              <span className="text-lg font-bold">+</span>
            </div>
            <p className="font-serif text-3xl font-semibold text-primary md:text-4xl">Sano Care Portal</p>
          </div>

          <h1 className="font-serif text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">Unified Role Login</h1>
          <p className="mt-3 max-w-lg text-base leading-relaxed text-slate-600">
            Full-screen sign in overlay for role-based workspaces. Close anytime using the cross, outside click, or Esc.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {roleOptions.map((option) => (
              <div key={option.value} className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-sm font-semibold text-slate-800">{option.label}</p>
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{option.hint}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-(--ds-shadow-md) md:p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Role</label>
              <div className="grid gap-2 sm:grid-cols-2">
                {roleOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRole(option.value)}
                    className={`rounded-xl px-3 py-2 text-left ${
                      role === option.value ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <p className="text-sm font-semibold">{option.label}</p>
                    <p className={`text-[10px] uppercase tracking-[0.12em] ${role === option.value ? "text-white/80" : "text-slate-500"}`}>
                      {option.hint}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">User ID / Phone</label>
              <input
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                placeholder="Enter mobile or employee ID"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-100/80 px-4 text-base text-slate-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={selectedRole?.hint ?? "Enter password"}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-100/80 px-4 text-base text-slate-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>

            <div className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
              <p className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                Role credentials are mocked for MVP login. Real OTP and access controls will be connected to Supabase auth.
              </p>
            </div>

            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

            <button type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-base font-semibold text-white transition hover:bg-primary-dark">
              <span>Enter Role Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-5 border-t border-slate-200 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              <span>Privacy Architecture</span>
              <span>Clinical Standards</span>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-slate-600">
              <span>System Status:</span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                Encrypted & Online
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
