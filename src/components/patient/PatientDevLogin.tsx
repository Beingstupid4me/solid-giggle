"use client";

import { useEffect, useState, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Sparkles,
  ShieldCheck,
  UserRound,
  Heart,
  Activity,
  Users,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";

/* ─── Dev credentials ─── */
const DEV_CREDENTIALS = {
  email: "patient@sanocare.dev",
  password: "vault1234",
};

/* ─── Value proposition cards ─── */
const valueCards = [
  {
    icon: Users,
    title: "Family-first vault",
    description:
      "Switch between self and family profiles seamlessly without leaving the main flow.",
  },
  {
    icon: Activity,
    title: "Active case focus",
    description:
      "Your home screen surfaces the consultation that matters right now — front and centre.",
  },
  {
    icon: Clock,
    title: "Timeline clarity",
    description:
      "Every past visit is presented as a clean, readable clinical record you can revisit anytime.",
  },
] as const;

/* ─── Roadmap items ─── */
const roadmapItems = [
  "Patient home dashboard in the new vault style",
  "Family switching, active case card, and timeline preview",
  "Record detail sheets for notes, vitals, and prescriptions",
  "Secure video consultation via one-tap Join Call",
] as const;

/* ─── Floating orb component ─── */
function FloatingOrb({
  size,
  color,
  top,
  left,
  delay,
}: {
  size: number;
  color: string;
  top: string;
  left: string;
  delay: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        top,
        left,
        background: color,
        filter: `blur(${size * 0.6}px)`,
      }}
      animate={{
        y: [0, -20, 0, 15, 0],
        x: [0, 10, -5, 8, 0],
        scale: [1, 1.05, 0.97, 1.02, 1],
      }}
      transition={{
        duration: 12 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

/* ─── Pulse ring for the logo ─── */
function PulseRing() {
  return (
    <motion.div
      className="absolute inset-0 rounded-2xl border-2 border-[#2b8cee]"
      initial={{ opacity: 0.6, scale: 1 }}
      animate={{ opacity: 0, scale: 1.6 }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
    />
  );
}

/* ─── Main component ─── */
export function PatientDevLogin() {
  const router = useRouter();
  const [email, setEmail] = useState(DEV_CREDENTIALS.email);
  const [password, setPassword] = useState(DEV_CREDENTIALS.password);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  /* Auto-redirect if already logged in */
  useEffect(() => {
    try {
      if (window.localStorage.getItem("sanocare.patient.devSession")) {
        router.push("/portal/patient");
      }
    } catch {
      // No-op
    }
  }, [router]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      email.trim().toLowerCase() !== DEV_CREDENTIALS.email ||
      password !== DEV_CREDENTIALS.password
    ) {
      setError("Invalid credentials. Use the dev credentials shown below.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Simulate a brief auth delay for polish
    setTimeout(() => {
      try {
        window.localStorage.setItem(
          "sanocare.patient.devSession",
          JSON.stringify({
            email: DEV_CREDENTIALS.email,
            role: "patient",
            mode: "dev",
            signedInAt: new Date().toISOString(),
          })
        );

        setSuccess(true);

        // Short delay for the success animation before navigating
        setTimeout(() => {
          router.push("/portal/patient");
        }, 800);
      } catch (err) {
        setError("Failed to enter vault. Please try again.");
        console.error("Login error:", err);
        setIsSubmitting(false);
      }
    }, 600);
  };

  const autofill = () => {
    setEmail(DEV_CREDENTIALS.email);
    setPassword(DEV_CREDENTIALS.password);
    setError(null);
  };

  /* ─── Animation variants ─── */
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const cardHover = {
    scale: 1.02,
    transition: { duration: 0.2 },
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f8fc] px-4 py-5 text-[#0d141b] md:px-6 md:py-6 lg:px-8">
      {/* ─── Background decoration ─── */}
      <div className="pointer-events-none absolute inset-0">
        {/* Gradient mesh */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 15% 10%, rgba(43,140,238,0.12), transparent)," +
              "radial-gradient(ellipse 50% 60% at 85% 80%, rgba(96,165,250,0.08), transparent)," +
              "radial-gradient(ellipse 40% 40% at 50% 50%, rgba(224,242,254,0.3), transparent)",
          }}
        />

        {/* DNA pattern overlay */}
        <div className="absolute inset-0 bg-dna-pattern opacity-30" />

        {/* Floating orbs */}
        <FloatingOrb
          size={200}
          color="rgba(43,140,238,0.06)"
          top="5%"
          left="8%"
          delay={0}
        />
        <FloatingOrb
          size={150}
          color="rgba(96,165,250,0.05)"
          top="60%"
          left="75%"
          delay={3}
        />
        <FloatingOrb
          size={120}
          color="rgba(43,140,238,0.04)"
          top="80%"
          left="20%"
          delay={6}
        />
        <FloatingOrb
          size={90}
          color="rgba(224,242,254,0.15)"
          top="15%"
          left="85%"
          delay={2}
        />
      </div>

      {/* ─── Main content grid ─── */}
      <motion.div
        className="relative mx-auto grid min-h-[calc(100vh-2.5rem)] w-full max-w-[1280px] items-stretch gap-5 lg:grid-cols-[1.08fr_0.92fr]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ════════════════════════════════════════════════════════════════
            LEFT PANEL — Brand + Value Proposition
            ════════════════════════════════════════════════════════════════ */}
        <motion.section
          variants={itemVariants}
          className="relative overflow-hidden rounded-[1.75rem] border border-white/60 p-6 shadow-[0_20px_60px_rgba(43,140,238,0.1)] md:p-8 lg:p-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(248,251,255,0.75) 50%, rgba(255,255,255,0.85) 100%)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          {/* Subtle inner glow */}
          <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] border border-white/40" />

          <div className="relative flex h-full flex-col justify-between gap-7">
            {/* Header bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2b8cee] to-[#1a6bb5] text-white shadow-lg shadow-[#2b8cee]/25">
                  <PulseRing />
                  <Heart className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <div>
                  <p
                    className="text-2xl font-semibold leading-none tracking-tight text-[#0d141b] md:text-[1.7rem]"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    Sanocare
                  </p>
                  <p className="mt-1 text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#4c739a]">
                    Patient Health Vault
                  </p>
                </div>
              </div>

              <div className="hidden items-center gap-2 rounded-full border border-[#2b8cee]/15 bg-white/80 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#4c739a] shadow-sm backdrop-blur-sm md:flex">
                <ShieldCheck className="h-3.5 w-3.5 text-[#2b8cee]" />
                Development Build
              </div>
            </div>

            {/* Hero copy */}
            <div className="max-w-xl space-y-5">
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-2 rounded-full bg-[#2b8cee]/8 px-4 py-2 text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#2b8cee]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Phase 8 · Patient-first experience
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-3">
                <h1
                  className="max-w-lg text-[2.25rem] font-semibold leading-[1.08] tracking-tight text-[#0d141b] md:text-[2.75rem] lg:text-[3.25rem]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  Your health records,{" "}
                  <span className="bg-gradient-to-r from-[#2b8cee] to-[#60a5fa] bg-clip-text text-transparent">
                    beautifully organised.
                  </span>
                </h1>
                <p className="max-w-lg text-[0.9rem] leading-7 text-[#4c739a]">
                  A hardcoded development login for the new patient vault. Build
                  the full experience first, swap in real authentication later
                  without changing the UX direction.
                </p>
              </motion.div>
            </div>

            {/* Value cards */}
            <motion.div
              variants={containerVariants}
              className="grid gap-3 sm:grid-cols-3"
            >
              {valueCards.map((card) => {
                const Icon = card.icon;
                return (
                  <motion.article
                    key={card.title}
                    variants={itemVariants}
                    whileHover={cardHover}
                    className="group cursor-default rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur-sm transition-colors hover:border-[#2b8cee]/20 hover:bg-white/90"
                  >
                    <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#2b8cee]/8 text-[#2b8cee] transition-colors group-hover:bg-[#2b8cee]/12">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-[13px] font-semibold text-[#0d141b]">
                      {card.title}
                    </p>
                    <p className="mt-1 text-[11.5px] leading-[1.65] text-[#4c739a]">
                      {card.description}
                    </p>
                  </motion.article>
                );
              })}
            </motion.div>

            {/* Bottom info cards */}
            <motion.div
              variants={containerVariants}
              className="grid gap-3 sm:grid-cols-2"
            >
              {/* Demo account card */}
              <motion.div
                variants={itemVariants}
                className="rounded-2xl border border-[#2b8cee]/12 bg-gradient-to-br from-[#2b8cee]/6 to-white/80 p-5 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#2b8cee] to-[#1a6bb5] text-white shadow-md shadow-[#2b8cee]/20">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#4c739a]">
                      Demo account
                    </p>
                    <p className="mt-0.5 text-[13px] font-semibold text-[#0d141b]">
                      patient@sanocare.dev
                    </p>
                  </div>
                </div>
                <div className="mt-3.5 rounded-xl bg-white/65 px-3.5 py-2.5 text-[11.5px] leading-[1.65] text-[#4c739a]">
                  Use the preview credentials or tap autofill to continue into the vault.
                </div>
              </motion.div>

              {/* Roadmap card */}
              <motion.div
                variants={itemVariants}
                className="rounded-2xl bg-[#0d141b] p-5 text-white shadow-[0_16px_48px_rgba(13,20,27,0.22)]"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                  Vault roadmap
                </p>
                <ul className="mt-3.5 space-y-2.5">
                  {roadmapItems.map((item, i) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="flex items-start gap-2.5 text-[12px] leading-[1.6] text-white/80"
                    >
                      <CheckCircle2 className="mt-[2px] h-3.5 w-3.5 shrink-0 text-[#2b8cee]" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* ════════════════════════════════════════════════════════════════
            RIGHT PANEL — Login Form
            ════════════════════════════════════════════════════════════════ */}
        <motion.section
          variants={itemVariants}
          className="relative flex flex-col rounded-[1.75rem] border border-white/60 p-5 shadow-[0_20px_60px_rgba(43,140,238,0.12)] md:p-7 lg:p-8"
          style={{
            background:
              "linear-gradient(160deg, rgba(255,255,255,0.92) 0%, rgba(248,251,255,0.8) 100%)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          {/* Inner glow border */}
          <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] border border-white/40" />

          <div className="relative flex flex-1 flex-col">
            {/* Form header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#2b8cee]">
                  Dev login
                </p>
                <h2
                  className="mt-2 text-[1.75rem] font-semibold tracking-tight text-[#0d141b] md:text-[2rem]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  Enter Patient Vault
                </h2>
                <p className="mt-2 max-w-md text-[13px] leading-[1.65] text-[#4c739a]">
                  Hardcoded for the development phase. This keeps the initial
                  build clean while we shape the patient experience.
                </p>
              </div>

              <div className="hidden rounded-xl bg-[#2b8cee]/8 p-3 text-[#2b8cee] sm:block">
                <LockKeyhole className="h-5 w-5" />
              </div>
            </div>

            {/* Login form */}
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="mt-7 flex flex-1 flex-col"
            >
              <div className="space-y-4">
                {/* Email field */}
                <div>
                  <label
                    htmlFor="login-email"
                    className="mb-2 block text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#4c739a]"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <input
                      id="login-email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      type="email"
                      className="h-[3.25rem] w-full rounded-xl border border-slate-200/80 bg-white/80 px-4 text-[13.5px] text-[#0d141b] outline-none backdrop-blur-sm transition-all duration-200 placeholder:text-[#4c739a]/40 focus:border-[#2b8cee] focus:bg-white focus:shadow-[0_0_0_4px_rgba(43,140,238,0.08)]"
                      placeholder="patient@sanocare.dev"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <label
                    htmlFor="login-password"
                    className="mb-2 block text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#4c739a]"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      type={showPassword ? "text" : "password"}
                      className="h-[3.25rem] w-full rounded-xl border border-slate-200/80 bg-white/80 px-4 pr-11 text-[13.5px] text-[#0d141b] outline-none backdrop-blur-sm transition-all duration-200 placeholder:text-[#4c739a]/40 focus:border-[#2b8cee] focus:bg-white focus:shadow-[0_0_0_4px_rgba(43,140,238,0.08)]"
                      placeholder="vault1234"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[#4c739a]/60 transition-colors hover:text-[#2b8cee]"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="grid gap-3 pt-1 sm:grid-cols-2">
                  <motion.button
                    type="button"
                    onClick={autofill}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="h-[3.25rem] rounded-xl border border-[#2b8cee]/18 bg-[#2b8cee]/5 px-4 text-[13px] font-semibold text-[#2b8cee] transition-colors hover:bg-[#2b8cee]/10"
                  >
                    Autofill credentials
                  </motion.button>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting || success}
                    whileHover={!isSubmitting && !success ? { scale: 1.01 } : {}}
                    whileTap={!isSubmitting && !success ? { scale: 0.98 } : {}}
                    className="relative inline-flex h-[3.25rem] items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#2b8cee] to-[#1a6bb5] px-4 text-[13px] font-semibold text-white shadow-lg shadow-[#2b8cee]/25 transition-all hover:shadow-[#2b8cee]/35 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <AnimatePresence mode="wait">
                      {success ? (
                        <motion.span
                          key="success"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Welcome
                        </motion.span>
                      ) : isSubmitting ? (
                        <motion.span
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2"
                        >
                          <motion.div
                            className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                          Authenticating…
                        </motion.span>
                      ) : (
                        <motion.span
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2"
                        >
                          Enter Vault
                          <ArrowRight className="h-4 w-4" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl border border-rose-200/80 bg-rose-50/80 px-4 py-3 text-[13px] text-rose-700 backdrop-blur-sm">
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Spacer pushes credential card to bottom */}
              <div className="flex-1 min-h-4" />

              {/* Dev credentials card */}
              <motion.div
                variants={itemVariants}
                className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#4c739a]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#2b8cee]" />
                  Dev credentials
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-white/80 px-4 py-2.5 backdrop-blur-sm">
                    <span className="text-[12px] text-[#4c739a]">Email</span>
                    <span className="text-[12.5px] font-semibold text-[#0d141b] select-all">
                      {DEV_CREDENTIALS.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-white/80 px-4 py-2.5 backdrop-blur-sm">
                    <span className="text-[12px] text-[#4c739a]">
                      Password
                    </span>
                    <span className="text-[12.5px] font-semibold text-[#0d141b] select-all">
                      {DEV_CREDENTIALS.password}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Footer note */}
              <p className="mt-4 text-center text-[11px] leading-5 text-[#4c739a]/60">
                This login is for internal development only.
                <br />
                Real authentication will be integrated after the vault UX is finalised.
              </p>
            </form>
          </div>
        </motion.section>
      </motion.div>
    </main>
  );
}