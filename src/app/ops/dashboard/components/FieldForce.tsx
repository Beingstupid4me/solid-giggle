"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Phone,
  Stethoscope,
  Plus,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Loader2,
  X,
  Check,
} from "lucide-react";
import { supabase, Paramedic } from "@/lib/supabase";

interface FieldForceProps {
  paramedics: Paramedic[];
  onUpdate: () => void;
  isDark?: boolean;
}

const specialties = [
  "General Care",
  "Emergency Response",
  "IV Administration",
  "Wound Care",
  "Elder Care",
  "Pediatric Care",
  "Physiotherapy",
];

export function FieldForce({ paramedics, onUpdate, isDark = true }: FieldForceProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    specialty: "General Care",
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      specialty: "General Care",
      is_active: true,
    });
    setIsAddingNew(false);
    setEditingId(null);
  };

  const handleEdit = (paramedic: Paramedic) => {
    setEditingId(paramedic.id);
    setFormData({
      name: paramedic.name,
      phone: paramedic.phone,
      specialty: paramedic.specialty || "General Care",
      is_active: paramedic.is_active,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from("paramedics")
          .update({
            name: formData.name,
            phone: formData.phone,
            specialty: formData.specialty,
            is_active: formData.is_active,
          })
          .eq("id", editingId);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase.from("paramedics").insert({
          name: formData.name,
          phone: formData.phone,
          specialty: formData.specialty,
          is_active: formData.is_active,
        });

        if (error) throw error;
      }

      resetForm();
      onUpdate();
    } catch (err) {
      console.error("Error saving paramedic:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (paramedic: Paramedic) => {
    const { error } = await supabase
      .from("paramedics")
      .update({ is_active: !paramedic.is_active })
      .eq("id", paramedic.id);

    if (!error) {
      onUpdate();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("paramedics").delete().eq("id", id);

    if (!error) {
      setDeleteConfirmId(null);
      onUpdate();
    }
  };

  const activeCount = paramedics.filter((p) => p.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Field Force Management</h2>
          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            {activeCount} of {paramedics.length} paramedics on duty
          </p>
        </div>
        {!isAddingNew && !editingId && (
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Paramedic
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {(isAddingNew || editingId) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleSubmit}
              className={`${isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"} border rounded-xl p-6 space-y-4`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                  {editingId ? "Edit Paramedic" : "Add New Paramedic"}
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  className={`p-1 rounded ${isDark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"} mb-1.5`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className={`w-full px-4 py-2.5 ${isDark ? "bg-slate-900/50 border-slate-700 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"} border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary`}
                    placeholder="Enter paramedic's name"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"} mb-1.5`}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className={`w-full px-4 py-2.5 ${isDark ? "bg-slate-900/50 border-slate-700 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"} border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary`}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"} mb-1.5`}>
                    Specialty
                  </label>
                  <select
                    value={formData.specialty}
                    onChange={(e) =>
                      setFormData({ ...formData, specialty: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 ${isDark ? "bg-slate-900/50 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"} border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary`}
                  >
                    {specialties.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 mt-6">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({ ...formData, is_active: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 ${isDark ? "bg-slate-700" : "bg-slate-300"} peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary`}></div>
                    <span className={`ml-3 text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      On Duty
                    </span>
                  </label>
                </div>
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                <button
                  type="button"
                  onClick={resetForm}
                  className={`px-4 py-2 ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"} text-sm font-medium transition-colors`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {editingId ? "Update" : "Add"} Paramedic
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paramedics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paramedics.map((paramedic) => (
          <motion.div
            key={paramedic.id}
            layout
            className={`relative ${isDark ? "bg-slate-800/50" : "bg-white shadow-sm"} border rounded-xl p-5 ${
              paramedic.is_active
                ? "border-green-500/20"
                : `${isDark ? "border-slate-700" : "border-slate-200"} opacity-60`
            }`}
          >
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                  paramedic.is_active
                    ? "bg-green-500/10 text-green-400"
                    : "bg-slate-700/50 text-slate-500"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${
                    paramedic.is_active ? "bg-green-400" : "bg-slate-500"
                  }`}
                />
                {paramedic.is_active ? "On Duty" : "Off Duty"}
              </div>
            </div>

            {/* Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`size-12 rounded-full ${isDark ? "bg-slate-700" : "bg-slate-100"} flex items-center justify-center`}>
                  <User className={`w-6 h-6 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{paramedic.name}</h3>
                  <div className={`flex items-center gap-1.5 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    <Stethoscope className="w-3.5 h-3.5" />
                    {paramedic.specialty || "General Care"}
                  </div>
                </div>
              </div>

              <div className={`flex items-center gap-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                <Phone className="w-4 h-4" />
                <a
                  href={`tel:${paramedic.phone}`}
                  className="text-sm hover:text-primary transition-colors"
                >
                  {paramedic.phone}
                </a>
              </div>
            </div>

            {/* Actions */}
            <div className={`flex items-center gap-2 mt-4 pt-4 border-t ${isDark ? "border-slate-700" : "border-slate-200"}`}>
              <button
                onClick={() => handleToggleActive(paramedic)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  paramedic.is_active
                    ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                }`}
              >
                {paramedic.is_active ? (
                  <>
                    <PowerOff className="w-3.5 h-3.5" />
                    Set Off Duty
                  </>
                ) : (
                  <>
                    <Power className="w-3.5 h-3.5" />
                    Set On Duty
                  </>
                )}
              </button>

              <button
                onClick={() => handleEdit(paramedic)}
                className={`p-2 rounded-lg ${isDark ? "bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700" : "bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200"} transition-colors`}
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>

              {deleteConfirmId === paramedic.id ? (
                <div className="flex items-center gap-1 ml-auto">
                  <button
                    onClick={() => handleDelete(paramedic.id)}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                    title="Confirm Delete"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className={`p-2 rounded-lg ${isDark ? "bg-slate-700/50 text-slate-400 hover:bg-slate-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200"} transition-colors`}
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirmId(paramedic.id)}
                  className={`p-2 rounded-lg ${isDark ? "bg-slate-700/50 text-slate-400" : "bg-slate-100 text-slate-500"} hover:text-red-400 hover:bg-red-500/10 transition-colors ml-auto`}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        ))}

        {paramedics.length === 0 && (
          <div className={`col-span-full text-center py-12 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No paramedics added yet</p>
            <button
              onClick={() => setIsAddingNew(true)}
              className="text-primary hover:underline mt-2 text-sm"
            >
              Add your first paramedic
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
