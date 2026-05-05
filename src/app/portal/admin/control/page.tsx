"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Activity,
  Bell,
  Moon,
  RefreshCw,
  Sun,
  UserPlus,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import { usePortalAuthStore } from "@/store/portalAuthStore";
import { usePortalTheme } from "@/hooks/usePortalTheme";
import { useAllCases } from "@/hooks/useSupabaseIntegration";

type ControlTab = "pulse" | "field";

interface ConsultationData {
  id: string;
  status: string;
  profiles?: { full_name: string };
  chief_complaint: string;
  created_at: string;
}

export default function AdminControlPage() {
  const session = usePortalAuthStore((state) => state.session);
  const { isDark, toggleTheme } = usePortalTheme();

  const [activeTab, setActiveTab] = useState<ControlTab>("pulse");
  const [consultations, setConsultations] = useState<ConsultationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newCount, setNewCount] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { getAllCases } = useAllCases();

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
    audioRef.current.volume = 0.5;
  }, []);

  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Autoplay may be blocked by browser policy
      });
    }
  }, [soundEnabled]);

  const fetchConsultations = useCallback(async () => {
    try {
      const result = await getAllCases({ limit: 50 });
      if (result && result.data) {
        setConsultations(result.data);
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to fetch consultations:", err);
      setLoading(false);
    }
  }, [getAllCases]);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabaseBrowser
      .channel("admin-control-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "consultations" },
        (payload) => {
          setConsultations((prev) => [payload.new as ConsultationData, ...prev]);
          setNewCount((prev) => prev + 1);
          playNotificationSound();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "consultations" },
        (payload) => {
          setConsultations((prev) =>
            prev.map((item) => (item.id === payload.new.id ? (payload.new as ConsultationData) : item))
          );
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, [playNotificationSound]);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchData]);

  const handleDispatch = (booking: BookingRow) => {
    setSelectedBooking(booking);
    setIsDispatchModalOpen(true);
  };

  const handleDispatchComplete = async (bookingId: string, paramedicId: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({
        status: "DISPATCHED",
        assigned_paramedic_id: paramedicId,
        dispatched_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (!error) {
      setIsDispatchModalOpen(false);
      setSelectedBooking(null);
    }

    return { success: !error, error: error?.message };
  };

  const handleEndVisitClick = (bookingId: string) => {
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking) {
      return;
    }

    setSelectedBooking(booking);
    setIsCompleteModalOpen(true);
  };

  const handleCompleteConfirm = async (bookingId: string) => {
    const { error } = await supabase.from("bookings").update({ status: "COMPLETED" }).eq("id", bookingId);

    if (!error) {
      fetchData();
    }

    return { success: !error, error: error?.message };
  };

  const pendingCount = bookings.filter((item) => item.status === "PENDING").length;
  const activeParamedics = paramedics.filter((item) => item.is_active).length;

  return (
    <section className={`${isDark ? "bg-slate-900" : "bg-white"}`}>
      <div className="flex items-center justify-end gap-1 px-4 py-3 md:gap-2 md:px-6 md:py-3">
        <div className="flex items-center gap-1 md:gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled((value) => !value)}
            className={`rounded-md p-1.5 md:p-2 text-sm transition ${isDark ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}
            aria-label={soundEnabled ? "Mute notifications" : "Enable notifications"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className={`rounded-md p-1.5 md:p-2 text-sm transition ${isDark ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={fetchData}
            className={`rounded-md p-1.5 md:p-2 text-sm transition ${isDark ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}
            aria-label="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {isMasterAdmin ? (
            <button
              type="button"
              onClick={() => setIsAddAdminModalOpen(true)}
              className={`rounded-md p-1.5 md:p-2 text-sm transition ${isDark ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}
              aria-label="Add admin"
            >
              <UserPlus className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 py-2 md:px-6 md:py-3 text-[12px]">
        <div className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 font-semibold ${isDark ? "bg-red-500/15 text-red-400" : "bg-red-100 text-red-700"}`}>
          <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${isDark ? "bg-red-400" : "bg-red-700"}`} />
          {pendingCount} Pending
        </div>
        <div className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 font-semibold ${isDark ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-100 text-emerald-700"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${isDark ? "bg-emerald-400" : "bg-emerald-700"}`} />
          {activeParamedics} On Duty
        </div>
        {newBookingCount > 0 ? (
          <div className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 font-semibold ${isDark ? "bg-primary/15 text-primary" : "bg-primary/10 text-primary"}`}>
            <Bell className="h-3 w-3" />
            {newBookingCount} Alerts
          </div>
        ) : null}
      </div>

      <nav className={`flex gap-1 px-4 py-2 md:px-6 md:py-3`}>
        <button
          type="button"
          onClick={() => setActiveTab("pulse")}
          className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.1em] transition ${
            activeTab === "pulse"
              ? isDark
                ? "bg-slate-800 text-white"
                : "bg-slate-100 text-primary"
              : isDark
                ? "text-slate-400 hover:text-slate-300"
                : "text-slate-600 hover:text-slate-700"
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          Live Pulse
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("field")}
          className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.1em] transition ${
            activeTab === "field"
              ? isDark
                ? "bg-slate-800 text-white"
                : "bg-slate-100 text-primary"
              : isDark
                ? "text-slate-400 hover:text-slate-300"
                : "text-slate-600 hover:text-slate-700"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          Field Force
        </button>
      </nav>

      <div className="px-4 py-3 md:px-6 md:py-4">
        {activeTab === "pulse" ? (
          <LivePulseMonitor
            bookings={bookings}
            paramedics={paramedics}
            onDispatch={handleDispatch}
            onComplete={handleEndVisitClick}
            isDark={isDark}
          />
        ) : (
          <FieldForce paramedics={paramedics} onUpdate={fetchData} isDark={isDark} />
        )}
      </div>

      <DispatchModal
        isOpen={isDispatchModalOpen}
        onClose={() => {
          setIsDispatchModalOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
        paramedics={paramedics.filter((item) => item.is_active)}
        onDispatch={handleDispatchComplete}
        isDark={isDark}
      />

      <CompleteVisitModal
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setIsCompleteModalOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
        onConfirm={handleCompleteConfirm}
        isDark={isDark}
      />

      {isMasterAdmin ? (
        <AddAdminModal isOpen={isAddAdminModalOpen} onClose={() => setIsAddAdminModalOpen(false)} isDark={isDark} />
      ) : null}
    </section>
  );
}
