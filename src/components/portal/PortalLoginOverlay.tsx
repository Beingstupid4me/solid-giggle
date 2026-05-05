"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, X, AlertCircle, Loader } from "lucide-react";
import backendAPI from "@/lib/backendApi";
import { usePortalAuthStore } from "@/store/portalAuthStore";

export type PortalRole = "patient" | "medic" | "doctor" | "admin";

const roleOptions: Array<{ value: PortalRole; label: string; description: string }> = [
  { value: "patient", label: "Patient", description: "Patients booking medical consultations" },
  { value: "medic", label: "Field Node", description: "Field medics on the ground" },
  { value: "doctor", label: "Doctor", description: "Doctors reviewing cases" },
  { value: "admin", label: "Admin", description: "System administrators" },
];

const roleRouteMap: Record<PortalRole, string> = {
  patient: "/portal/patient",
  medic: "/portal/field-node",
  doctor: "/portal/doctor",
  admin: "/portal/admin",
};

export function PortalLoginOverlay() {
  const router = useRouter();
  const portalSignup = usePortalAuthStore((state) => state.signup);
  const portalLogin = usePortalAuthStore((state) => state.login);

  const [role, setRole] = useState<PortalRole>("patient");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpPhone, setSignUpPhone] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpName, setSignUpName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (isSignUp) {
      // Sign-up validation
      if (!signUpName || !signUpPhone || !signUpEmail || !password || !confirmPassword) {
        setError("Please fill in all fields");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }

      // Signup through backend auth proxy.
      setIsLoading(true);
      try {
        const response = await portalSignup({
          phone: signUpPhone,
          email: signUpEmail,
          password,
          fullName: signUpName,
          role,
        });
        if (!response.ok) {
          throw new Error(response.message || "Signup failed");
        }

        // Show success message
        setError(null);
        alert(
          "Signup successful! You can now login with your email or phone and password."
        );

        // Reset form and switch to login
        setIsSignUp(false);
        setSignUpPhone("");
        setSignUpEmail("");
        setPassword("");
        setConfirmPassword("");
        setSignUpName("");
        setIdentifier("");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Signup failed";
        setError(message);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // LOGIN - backend auth proxy + role validation
    setError(null);
    setIsLoading(true);

    try {
      if (!identifier || !password) {
        setError("Please enter email/phone and password");
        return;
      }

      const loginResponse = await portalLogin({ identifier, password, role });
      if (!loginResponse.ok) {
        setError(loginResponse.message || "Login failed");
        return;
      }

      const me = await backendAPI.getMe();
      const userRole = ((me as any)?.data?.role || role) as PortalRole;

      // Step 3: Validate that selected role matches user's actual role
      if (userRole !== role) {
        setError(`You are registered as a ${userRole || "user"}, not a ${role}`);
        await backendAPI.logout();
        return;
      }

      // Step 4: Role validated - navigate to role page
      router.push(roleRouteMap[role]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
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
                <p className="text-xs text-slate-500">{option.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-(--ds-shadow-md) md:p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Sign Up / Login Toggle */}
            <div className="mb-6 flex gap-2 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setError(null);
                }}
                className={`flex-1 rounded-md py-2 font-semibold text-sm transition ${
                  !isSignUp ? "bg-white text-primary shadow-sm" : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setError(null);
                }}
                className={`flex-1 rounded-md py-2 font-semibold text-sm transition ${
                  isSignUp ? "bg-white text-primary shadow-sm" : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Role Selection */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {isSignUp ? "Choose Your Role" : "Role"}
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                {roleOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setRole(option.value);
                      setError(null);
                    }}
                    className={`rounded-xl px-3 py-2 text-left transition ${
                      role === option.value ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <p className="text-sm font-semibold">{option.label}</p>
                    <p className={`text-xs ${role === option.value ? "text-white/80" : "text-slate-500"}`}>
                      {option.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Sign Up Fields */}
            {isSignUp && (
              <>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Full Name</label>
                  <input
                    type="text"
                    value={signUpName}
                    onChange={(event) => setSignUpName(event.target.value)}
                    placeholder="Enter your full name"
                    disabled={isLoading}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-100/80 px-4 text-base text-slate-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Phone Number</label>
                  <input
                    type="tel"
                    value={signUpPhone}
                    onChange={(event) => setSignUpPhone(event.target.value)}
                    placeholder="Enter your phone number"
                    disabled={isLoading}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-100/80 px-4 text-base text-slate-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Email Address</label>
                  <input
                    type="email"
                    value={signUpEmail}
                    onChange={(event) => setSignUpEmail(event.target.value)}
                    placeholder="Enter your email"
                    disabled={isLoading}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-100/80 px-4 text-base text-slate-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </>
            )}

            {/* Login Fields */}
            {!isSignUp && (
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Email or Phone</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="Enter your email or phone"
                  disabled={isLoading}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-100/80 px-4 text-base text-slate-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            )}

            {/* Password Field */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {isSignUp ? "Create Password (min 8 chars)" : "Password"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={isSignUp ? "At least 8 characters" : "Enter password"}
                disabled={isLoading}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-100/80 px-4 text-base text-slate-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Confirm Password (Sign Up Only) */}
            {isSignUp && (
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-100/80 px-4 text-base text-slate-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            )}

            <div className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
              <p className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                {isSignUp
                  ? "Passwords are securely hashed by Supabase. You can manage your profile after account creation."
                  : "All passwords are encrypted and securely stored. Your data is protected."}
              </p>
            </div>

            {error && (
              <div className="flex gap-3 rounded-xl bg-red-50 border border-red-200 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-base font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>{isSignUp ? "Creating account..." : "Logging in..."}</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? "Create Account & Enter" : "Enter Role Workspace"}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
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
