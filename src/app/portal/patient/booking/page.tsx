"use client";

import { useRouter } from "next/navigation";
import { Crosshair, WalletCards } from "lucide-react";
import { PatientBottomNav, PatientTopBar } from "@/components/patient/PatientScaffold";
import { usePatientPortalStore } from "@/store/patientPortalStore";

const serviceOptions = [
  { label: "Doorstep Homecare", value: "homecare" },
  { label: "Teleconsultation", value: "teleconsult" },
  { label: "Diagnostics", value: "diagnostics" },
] as const;

const carehubOptions = [
  { label: "North Residency CareHub", value: "north-hub" },
  { label: "Central Vista CareHub", value: "central-hub" },
  { label: "South Enclave CareHub", value: "south-hub" },
] as const;

export default function BookingEnginePage() {
  const router = useRouter();
  const {
    profiles,
    selectedProfileId,
    bookingDraft,
    setSelectedProfile,
    updateBookingDraft,
    captureGps,
    confirmBooking,
  } = usePatientPortalStore();

  const selectedProfile = profiles.find((profile) => profile.id === selectedProfileId);

  const onConfirm = () => {
    if (!bookingDraft.paymentNoticeAccepted) return;
    confirmBooking();
    router.push("/portal/patient/tracking");
  };

  return (
    <div className="pb-28 md:pb-8">
      <PatientTopBar title="Booking Engine" subtitle="Workflow 1.2" />

      <main className="mx-auto w-full max-w-6xl px-4 pb-6 pt-6 md:px-6">
        <div className="space-y-5 md:grid md:grid-cols-[1.55fr_0.95fr] md:gap-5 md:space-y-0">
          <section className="space-y-5">
            <article className="rounded-2xl bg-white p-5 shadow-(--ds-shadow-sm)">
              <h1 className="font-serif text-xl font-semibold md:text-2xl">Who is this for?</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => setSelectedProfile(profile.id)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                      selectedProfileId === profile.id ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {profile.relationship === "self" ? "Myself" : profile.fullName.split(" ")[0]}
                  </button>
                ))}
              </div>
            </article>

            <article className="rounded-2xl bg-white p-5 shadow-(--ds-shadow-sm)">
              <h2 className="font-serif text-lg font-semibold md:text-xl">Select Service</h2>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                {serviceOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateBookingDraft({ serviceType: option.value })}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold ${
                      bookingDraft.serviceType === option.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </article>

            <article className="rounded-2xl bg-white p-5 shadow-(--ds-shadow-sm)">
              <h2 className="font-serif text-lg font-semibold md:text-xl">Address / Hub Selector</h2>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateBookingDraft({ mode: "now" })}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                    bookingDraft.mode === "now" ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Sanocare NOW
                </button>
                <button
                  onClick={() => updateBookingDraft({ mode: "carehub" })}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                    bookingDraft.mode === "carehub" ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  CareHub
                </button>
              </div>

              {bookingDraft.mode === "now" ? (
                <div className="mt-3 space-y-2">
                  <button
                    onClick={captureGps}
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-700"
                  >
                    <Crosshair className="h-4 w-4" />
                    Capture High Accuracy GPS
                  </button>
                  <input
                    value={bookingDraft.addressLine}
                    onChange={(e) => updateBookingDraft({ addressLine: e.target.value })}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary"
                    placeholder="Flat / Street / Landmark"
                  />
                  {bookingDraft.gpsLatitude ? (
                    <p className="text-xs font-medium text-emerald-700">
                      GPS locked at {bookingDraft.gpsLatitude}, {bookingDraft.gpsLongitude}
                    </p>
                  ) : null}
                </div>
              ) : (
                <select
                  value={bookingDraft.carehubId}
                  onChange={(e) => updateBookingDraft({ carehubId: e.target.value })}
                  className="mt-3 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary"
                >
                  {carehubOptions.map((hub) => (
                    <option key={hub.value} value={hub.value}>
                      {hub.label}
                    </option>
                  ))}
                </select>
              )}
            </article>
          </section>

          <aside className="md:sticky md:top-24 md:h-fit">
            <section className="rounded-2xl bg-white p-5 shadow-(--ds-shadow-md)">
              <h2 className="font-serif text-lg font-semibold md:text-xl">Authorization</h2>
              <p className="mt-2 rounded-xl bg-slate-100 p-3 text-sm leading-relaxed text-slate-700">
                ₹499 for 15 mins + ₹100 per 5 mins thereafter. UPI/Razorpay mandate will be held as a security deposit.
              </p>

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                <p className="font-semibold text-slate-700">Booking For</p>
                <p className="text-slate-500">{selectedProfile?.fullName ?? "Select profile"}</p>
                <p className="mt-2 font-semibold text-slate-700">Service</p>
                <p className="text-slate-500">{bookingDraft.serviceType}</p>
                <p className="mt-2 font-semibold text-slate-700">Mode</p>
                <p className="text-slate-500">{bookingDraft.mode}</p>
              </div>

              <label className="mt-3 flex items-start gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={bookingDraft.paymentNoticeAccepted}
                  onChange={(e) => updateBookingDraft({ paymentNoticeAccepted: e.target.checked })}
                  className="mt-1"
                />
                I authorize payment hold and consent to timer-based billing once the consult starts.
              </label>

              <button
                onClick={onConfirm}
                className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!bookingDraft.paymentNoticeAccepted}
              >
                <WalletCards className="h-4 w-4" />
                Confirm & Dispatch
              </button>
            </section>
          </aside>
        </div>
      </main>
      <PatientBottomNav basePath="/portal/patient" />
    </div>
  );
}
