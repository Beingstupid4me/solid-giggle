"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Edit3, Plus, Heart, AlertCircle, Phone, Settings, LogOut, Shield, Users, X } from "lucide-react";
import { usePatientVaultStore } from "@/store/patientVaultStore";

const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

export default function ProfilePage() {
  const router = useRouter();
  const { isLoading, profile, familyMembers, selectedFamilyId, selectFamily, selectedFamily } = usePatientVaultStore();
  const family = selectedFamily();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRel, setNewMemberRel] = useState("Spouse");

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    // In a real app, this would call supabase to insert a family_member
    // For now we simulate it by adding to the store directly or just close
    alert(`Successfully added ${newMemberRel}: ${newMemberName}`);
    setIsAddModalOpen(false);
    setNewMemberName("");
  };

  const handleSignOut = () => {
    // Clear any local storage auth state if necessary
    router.push("/");
  };

  if (isLoading || !family || !profile) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary/25 border-t-primary" />
          <p className="text-text-secondary text-sm">Loading profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(43,140,238,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(224,242,254,0.95),transparent_26%),linear-gradient(180deg,#f8fbff_0%,#eef6ff_56%,#f8f9fa_100%)]">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 md:px-6 md:py-6">
        {/* Header */}
        <div className="glass-panel sticky top-3 z-20 mb-5 rounded-3xl px-4 py-3 shadow-[0_18px_50px_rgba(43,140,238,0.08)] md:px-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => router.push("/portal/patient")} className="rounded-full bg-white/50 p-2 text-primary transition hover:bg-white md:hidden">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Account</p>
                <h1 className="font-serif text-xl font-semibold tracking-tight text-text-main md:text-2xl">Profile &amp; Settings</h1>
              </div>
            </div>
            <button type="button" onClick={() => router.push("/portal/patient")} className="hidden rounded-full border border-primary/15 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5 md:inline-flex">
              Back to Home
            </button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.55fr_0.95fr]">
          {/* Main Content */}
          <section className="space-y-5">
            {/* Account Card */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="glass-panel rounded-[2rem] p-5 shadow-[0_25px_80px_rgba(43,140,238,0.12)] md:p-6">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Your Account</p>
                  <h2 className="mt-2 font-serif text-2xl font-semibold text-text-main md:text-3xl">Account Details</h2>
                </div>
                <button type="button" className="rounded-full bg-primary/10 p-3 text-primary transition hover:bg-primary/20">
                  <Edit3 className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">Full Name</span>
                  <span className="mt-2 block font-semibold text-text-main">{profile.full_name}</span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">Email Address</span>
                  <span className="mt-2 block font-semibold text-text-main">{profile.email}</span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">Phone Number</span>
                  <span className="mt-2 block font-semibold text-text-main">{profile.phone}</span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">Account Status</span>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-semibold text-emerald-700">Verified</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Family Members */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="glass-panel rounded-[2rem] p-5 shadow-[0_25px_80px_rgba(43,140,238,0.12)] md:p-6">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Family</p>
                  <h2 className="mt-2 font-serif text-2xl font-semibold text-text-main md:text-3xl">Family Profiles</h2>
                </div>
                <button type="button" onClick={() => setIsAddModalOpen(true)} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark">
                  <Plus className="mr-2 inline h-4 w-4" /> Add Member
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {familyMembers.map((fm) => {
                  const sel = fm.id === family.id;
                  return (
                    <motion.button key={fm.id} type="button" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      onClick={() => selectFamily(fm.id)}
                      className={`rounded-3xl border p-4 text-left transition ${sel ? "border-primary bg-primary text-white shadow-[0_18px_40px_rgba(43,140,238,0.18)]" : "border-slate-200 bg-white hover:border-primary/25 hover:bg-slate-50"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${sel ? "text-white/75" : "text-text-secondary"}`}>{fm.relationship}</p>
                          <p className={`mt-2 text-lg font-semibold leading-tight ${sel ? "text-white" : "text-text-main"}`}>{fm.full_name}</p>
                        </div>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${sel ? "bg-white/15" : "bg-primary/10"}`}>
                          <Users className={`h-4 w-4 ${sel ? "text-white" : "text-primary"}`} />
                        </div>
                      </div>
                      <div className={`mt-4 grid gap-2 text-xs ${sel ? "text-white/80" : "text-text-secondary"}`}>
                        <p>Age {fm.age ?? "—"}</p>
                        <p>Blood group {fm.blood_group ?? "—"}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Health Information */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="glass-panel rounded-[2rem] p-5 shadow-[0_25px_80px_rgba(43,140,238,0.12)] md:p-6">
              <div className="mb-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{family.relationship} Profile</p>
                <h2 className="mt-2 font-serif text-2xl font-semibold text-text-main md:text-3xl">Health Information</h2>
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-text-secondary">
                    <Heart className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-[0.14em]">Blood Group</span>
                  </div>
                  <span className="block font-semibold text-text-main">{family.blood_group ?? "—"}</span>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-text-secondary">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-semibold uppercase tracking-[0.14em]">Allergies</span>
                  </div>
                  <span className="block font-semibold text-text-main">{family.allergies ?? "None known"}</span>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-text-secondary">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-[0.14em]">Emergency Contact</span>
                  </div>
                  <span className="block font-semibold text-text-main">{profile.phone}</span>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="glass-panel rounded-[2rem] p-5 shadow-[0_22px_70px_rgba(43,140,238,0.1)] md:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Settings</p>
              <div className="mt-4 space-y-2">
                <button type="button" className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50">
                  <Settings className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-text-main">Preferences</span>
                </button>
                <button type="button" className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-text-main">Privacy &amp; Security</span>
                </button>
                <button type="button" onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 transition hover:bg-rose-100">
                  <LogOut className="h-4 w-4 text-rose-700" />
                  <span className="text-sm font-semibold text-rose-700">Sign Out</span>
                </button>
              </div>
            </div>
            <div className="glass-panel rounded-[2rem] p-5 shadow-[0_22px_70px_rgba(43,140,238,0.1)] md:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Support</p>
              <div className="mt-4 rounded-2xl bg-text-main p-4 text-white">
                <p className="font-semibold">Need Help?</p>
                <p className="mt-2 text-sm leading-6 text-white/75">Contact our support team for account help, privacy questions, or technical issues.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-xl font-semibold text-text-main">Add Family Member</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="rounded-full p-2 hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-text-secondary">Full Name</label>
                <input required type="text" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary" placeholder="Enter name" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-text-secondary">Relationship</label>
                <select value={newMemberRel} onChange={(e) => setNewMemberRel(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary bg-white">
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Parent">Parent</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <button type="submit" className="w-full rounded-2xl bg-primary py-3 font-semibold text-white transition hover:bg-primary-dark">Add Profile</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
