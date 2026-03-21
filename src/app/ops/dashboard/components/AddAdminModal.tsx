"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, UserPlus, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}

export function AddAdminModal({ isOpen, onClose, isDark = true }: AddAdminModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      // Get the current session's access token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        setResult({ success: false, message: "Not authenticated. Please sign in again." });
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/ops/create-admin", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: "Admin user created successfully!" });
        setEmail("");
        setPassword("");
      } else {
        setResult({ success: false, message: data.error || "Failed to create admin" });
      }
    } catch {
      setResult({ success: false, message: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setResult(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} border rounded-2xl shadow-2xl z-50 overflow-hidden`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Add Admin User</h2>
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Create a new ops admin account</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className={`p-2 rounded-lg ${isDark ? "hover:bg-slate-700 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-400 hover:text-slate-600"} transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Result Message */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex items-start gap-3 p-4 rounded-lg ${
                      result.success
                        ? "bg-green-500/10 border border-green-500/20"
                        : "bg-red-500/10 border border-red-500/20"
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                    )}
                    <p
                      className={`text-sm ${
                        result.success ? "text-green-300" : "text-red-300"
                      }`}
                    >
                      {result.message}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div>
                <label className={`block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"} mb-1.5`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`w-full pl-11 pr-4 py-2.5 ${isDark ? "bg-slate-900/50 border-slate-700 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"} border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary`}
                    placeholder="admin@sanocare.in"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className={`block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"} mb-1.5`}>
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className={`w-full pl-11 pr-4 py-2.5 ${isDark ? "bg-slate-900/50 border-slate-700 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"} border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary`}
                    placeholder="Minimum 8 characters"
                  />
                </div>
                <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"} mt-1`}>
                  Minimum 8 characters recommended
                </p>
              </div>

              {/* Warning */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <p className="text-sm text-amber-300">
                  <strong>Note:</strong> The new admin will have full access to the Operations
                  Center. Share credentials securely.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className={`px-4 py-2 ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"} text-sm font-medium transition-colors`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  Create Admin
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
