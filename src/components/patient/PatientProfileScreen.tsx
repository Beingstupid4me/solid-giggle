"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Edit3, LogOut, Plus, Settings, Heart, AlertCircle, Phone } from "lucide-react";
import { useState } from "react";

interface FamilyMember {
  id: string;
  fullName: string;
  relationship: string;
  age: number;
  bloodGroup: string;
  allergies: string;
  emergencyContact: string;
}

interface PatientProfileScreenProps {
  userEmail: string;
  userPhone?: string;
  selectedFamily: FamilyMember;
  familyMembers: FamilyMember[];
  onFamilySelect: (familyId: string) => void;
  onAddFamily?: () => void;
  onLogOut: () => void;
}

export function PatientProfileScreen({
  userEmail,
  userPhone,
  selectedFamily,
  familyMembers,
  onFamilySelect,
  onAddFamily,
  onLogOut,
}: PatientProfileScreenProps) {
  const router = useRouter();
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(43,140,238,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(224,242,254,0.95),transparent_26%),linear-gradient(180deg,#f8fbff_0%,#eef6ff_56%,#f8f9fa_100%)]">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 md:px-6 md:py-6">
        {/* Header */}
        <div className="glass-panel sticky top-3 z-20 mb-5 rounded-3xl px-4 py-3 shadow-[0_18px_50px_rgba(43,140,238,0.08)] md:px-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-full bg-white/50 p-2 text-primary transition hover:bg-white md:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Account
                </p>
                <h1 className="font-serif text-xl font-semibold tracking-tight text-text-main md:text-2xl">
                  Profile & Settings
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.back()}
              className="hidden rounded-full border border-primary/15 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5 md:inline-flex"
            >
              Back
            </button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.55fr_0.95fr]">
          {/* Main Content */}
          <section className="space-y-5">
            {/* User Account Card */}
            <div className="glass-panel rounded-4xl p-5 shadow-[0_25px_80px_rgba(43,140,238,0.12)] md:p-6">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                    Your Account
                  </p>
                  <h2 className="mt-2 font-serif text-2xl font-semibold text-text-main md:text-3xl">
                    Account Details
                  </h2>
                </div>
                <button
                  type="button"
                  className="rounded-full bg-primary/10 p-3 text-primary transition hover:bg-primary/20"
                >
                  <Edit3 className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                    Email Address
                  </span>
                  <span className="mt-2 block font-semibold text-text-main">{userEmail}</span>
                </div>

                {userPhone && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                      Phone Number
                    </span>
                    <span className="mt-2 block font-semibold text-text-main">{userPhone}</span>
                  </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                    Account Status
                  </span>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-semibold text-emerald-700">Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Family Members */}
            <div className="glass-panel rounded-4xl p-5 shadow-[0_25px_80px_rgba(43,140,238,0.12)] md:p-6">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                    Family
                  </p>
                  <h2 className="mt-2 font-serif text-2xl font-semibold text-text-main md:text-3xl">
                    Family Profiles
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddMemberForm(true)}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
                >
                  <Plus className="inline mr-2 h-4 w-4" />
                  Add Member
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {familyMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => onFamilySelect(member.id)}
                    className={`rounded-3xl border p-4 text-left transition ${
                      member.id === selectedFamily.id
                        ? "border-primary bg-primary text-white shadow-[0_18px_40px_rgba(43,140,238,0.18)]"
                        : "border-slate-200 bg-white hover:border-primary/25 hover:bg-slate-50"
                    }`}
                  >
                    <p
                      className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${
                        member.id === selectedFamily.id ? "text-white/75" : "text-text-secondary"
                      }`}
                    >
                      {member.relationship}
                    </p>
                    <p className={`mt-2 font-semibold text-lg leading-tight ${member.id === selectedFamily.id ? "text-white" : "text-text-main"}`}>
                      {member.fullName}
                    </p>

                    <div
                      className={`mt-4 grid gap-2 text-xs ${
                        member.id === selectedFamily.id ? "text-white/80" : "text-text-secondary"
                      }`}
                    >
                      <p>Age {member.age}</p>
                      <p>Blood group {member.bloodGroup}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Health Information */}
            <div className="glass-panel rounded-4xl p-5 shadow-[0_25px_80px_rgba(43,140,238,0.12)] md:p-6">
              <div className="mb-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  {selectedFamily.relationship} Profile
                </p>
                <h2 className="mt-2 font-serif text-2xl font-semibold text-text-main md:text-3xl">
                  Health Information
                </h2>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-text-secondary mb-2">
                    <Heart className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-[0.14em]">Blood Group</span>
                  </div>
                  <span className="block font-semibold text-text-main">{selectedFamily.bloodGroup}</span>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-text-secondary mb-2">
                    <AlertCircle className="h-4 w-4 text-warning" />
                    <span className="text-xs font-semibold uppercase tracking-[0.14em]">Allergies</span>
                  </div>
                  <span className="block font-semibold text-text-main">{selectedFamily.allergies}</span>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-text-secondary mb-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-[0.14em]">Emergency Contact</span>
                  </div>
                  <span className="block font-semibold text-text-main">{selectedFamily.emergencyContact}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Quick Actions */}
            <div className="glass-panel rounded-4xl p-5 shadow-[0_22px_70px_rgba(43,140,238,0.1)] md:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Settings
              </p>
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50"
                >
                  <Settings className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-text-main">Preferences</span>
                </button>

                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50"
                >
                  <AlertCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-text-main">Privacy & Security</span>
                </button>

                <button
                  type="button"
                  onClick={onLogOut}
                  className="flex w-full items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 transition hover:bg-rose-100"
                >
                  <LogOut className="h-4 w-4 text-rose-700" />
                  <span className="text-sm font-semibold text-rose-700">Sign Out</span>
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="glass-panel rounded-4xl p-5 shadow-[0_22px_70px_rgba(43,140,238,0.1)] md:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Support
              </p>
              <div className="mt-4 rounded-2xl bg-text-main p-4 text-white">
                <p className="font-semibold">Need Help?</p>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Contact our support team for account help, privacy questions, or technical issues.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
