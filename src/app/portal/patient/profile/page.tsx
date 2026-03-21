"use client";

import { FormEvent, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PatientBottomNav, PatientTopBar } from "@/components/patient/PatientScaffold";
import { Relationship, usePatientPortalStore } from "@/store/patientPortalStore";

const relationshipOptions: Array<{ label: string; value: Exclude<Relationship, "self"> }> = [
  { label: "Spouse", value: "spouse" },
  { label: "Child", value: "child" },
  { label: "Parent", value: "parent" },
];

export default function PatientProfileManagementPage() {
  const { profiles, selectedProfileId, setSelectedProfile, updateProfile, addFamilyMember } = usePatientPortalStore();

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedProfileId) ?? profiles[0],
    [profiles, selectedProfileId],
  );

  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberAge, setNewMemberAge] = useState("");
  const [newMemberRelation, setNewMemberRelation] = useState<Exclude<Relationship, "self">>("parent");

  const onAddMember = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newMemberName.trim() || !newMemberAge.trim()) return;

    addFamilyMember({
      fullName: newMemberName,
      age: Number(newMemberAge),
      bloodGroup: "Unknown",
      allergies: "None",
      relationship: newMemberRelation,
    });

    setNewMemberName("");
    setNewMemberAge("");
  };

  return (
    <div className="pb-28 md:pb-8">
      <PatientTopBar title="Profile & Family" subtitle="Workflow 1.1" />

      <main className="mx-auto w-full max-w-6xl px-4 pb-6 pt-6 md:px-6">
        <div className="space-y-5 md:grid md:grid-cols-[0.95fr_1.55fr] md:gap-5 md:space-y-0">
          <aside className="rounded-2xl bg-white p-5 shadow-(--ds-shadow-sm)">
            <h1 className="font-serif text-xl font-semibold md:text-2xl">Family Profiles</h1>
            <p className="mt-1 text-sm text-slate-500">Switch context for consultations, records, and booking.</p>

            <div className="mt-4 space-y-2">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => setSelectedProfile(profile.id)}
                  className={`w-full rounded-xl px-3 py-3 text-left text-sm ${
                    selectedProfileId === profile.id
                      ? "border border-primary bg-primary/10 text-primary"
                      : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <p className="font-semibold">{profile.fullName}</p>
                  <p className="text-xs uppercase tracking-[0.12em] opacity-80">{profile.relationship}</p>
                </button>
              ))}
            </div>
          </aside>

          <section className="space-y-5">
            <article className="rounded-2xl bg-white p-5 shadow-(--ds-shadow-sm)">
              <h2 className="font-serif text-lg font-semibold md:text-xl">My Profile</h2>
              <p className="mt-1 text-sm text-slate-500">View and edit patient details for care personalization.</p>

              <div className="mt-4 grid gap-3">
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Full Name
                  <input
                    value={selectedProfile?.fullName ?? ""}
                    onChange={(e) => selectedProfile && updateProfile(selectedProfile.id, { fullName: e.target.value })}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Age
                    <input
                      type="number"
                      value={selectedProfile?.age ?? ""}
                      onChange={(e) => selectedProfile && updateProfile(selectedProfile.id, { age: Number(e.target.value) })}
                      className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary"
                    />
                  </label>
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Blood Group
                    <input
                      value={selectedProfile?.bloodGroup ?? ""}
                      onChange={(e) => selectedProfile && updateProfile(selectedProfile.id, { bloodGroup: e.target.value })}
                      className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary"
                    />
                  </label>
                </div>

                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Allergies
                  <input
                    value={selectedProfile?.allergies ?? ""}
                    onChange={(e) => selectedProfile && updateProfile(selectedProfile.id, { allergies: e.target.value })}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary"
                  />
                </label>
              </div>
            </article>

            <article className="rounded-2xl bg-white p-5 shadow-(--ds-shadow-sm)">
              <h2 className="font-serif text-lg font-semibold md:text-xl">Add Family Member</h2>
              <p className="mt-1 text-sm text-slate-500">Spouse, child, or parent can be linked for shared booking.</p>

              <form onSubmit={onAddMember} className="mt-4 grid gap-3">
                <input
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Full name"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={newMemberAge}
                    onChange={(e) => setNewMemberAge(e.target.value)}
                    placeholder="Age"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary"
                  />
                  <select
                    value={newMemberRelation}
                    onChange={(e) => setNewMemberRelation(e.target.value as Exclude<Relationship, "self">)}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary"
                  >
                    {relationshipOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add Family Member
                </button>
              </form>
            </article>
          </section>
        </div>
      </main>
      <PatientBottomNav basePath="/portal/patient" />
    </div>
  );
}
