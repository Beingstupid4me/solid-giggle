"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Users, 
  LogOut, 
  Bell, 
  RefreshCw,
  Volume2,
  VolumeX,
  UserPlus,
  Loader2,
  Sun,
  Moon
} from "lucide-react";
import Image from "next/image";
import { useOpsAuth } from "../OpsAuthProvider";
import { useOpsTheme } from "../ThemeProvider";
import { supabase, BookingRow, Paramedic } from "@/lib/supabase";
import { 
  LivePulseMonitor, 
  FieldForce, 
  DispatchModal, 
  AddAdminModal,
  CompleteVisitModal 
} from "./components";

type Tab = "pulse" | "field";

export default function OpsDashboard() {
  const { user, isLoading, isMasterAdmin, signOut } = useOpsAuth();
  const { theme, toggleTheme } = useOpsTheme();
  const [activeTab, setActiveTab] = useState<Tab>("pulse");
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [paramedics, setParamedics] = useState<Paramedic[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingRow | null>(null);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newBookingCount, setNewBookingCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
    audioRef.current.volume = 0.5;
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Autoplay might be blocked
      });
    }
  }, [soundEnabled]);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    // Fetch bookings
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (bookingsData) {
      setBookings(bookingsData);
    }

    // Fetch paramedics
    const { data: paramedicsData } = await supabase
      .from("paramedics")
      .select("*")
      .order("name");
    
    if (paramedicsData) {
      setParamedics(paramedicsData);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  // Set up Realtime subscription for bookings
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("bookings-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookings",
        },
        (payload) => {
          const newBooking = payload.new as BookingRow;
          setBookings((prev) => [newBooking, ...prev]);
          setNewBookingCount((prev) => prev + 1);
          playNotificationSound();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
        },
        (payload) => {
          const updatedBooking = payload.new as BookingRow;
          setBookings((prev) =>
            prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, playNotificationSound]);

  // Handle visibility change - refetch when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchData();
        setNewBookingCount(0);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchData]);

  // Handle dispatch click
  const handleDispatch = (booking: BookingRow) => {
    setSelectedBooking(booking);
    setIsDispatchModalOpen(true);
  };

  // Handle dispatch complete
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

  // Handle marking a booking as completed (End Visit) - opens confirmation modal
  const handleEndVisitClick = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      setIsCompleteModalOpen(true);
    }
  };

  // Handle confirmed complete from modal
  const handleCompleteConfirm = async (bookingId: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({
        status: "COMPLETED",
      })
      .eq("id", bookingId);

    if (!error) {
      // Refresh data to show updated status
      fetchData();
    }
    
    return { success: !error, error: error?.message };
  };

  const isDark = theme === "dark";

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-slate-900" : "bg-slate-100"}`}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via auth provider
  }

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const activeParamedics = paramedics.filter((p) => p.is_active).length;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-slate-900" : "bg-slate-100"}`}>
      {/* Header */}
      <header className={`backdrop-blur-xl border-b sticky top-0 z-40 transition-colors duration-300 ${isDark ? "bg-slate-800/50 border-slate-700" : "bg-white/80 border-slate-200"}`}>
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <Image
                src="/logo.svg"
                alt="Sanocare"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <div>
                <h1 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Operations Center</h1>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Command & Control</p>
              </div>
            </div>

            {/* Status Badges */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5">
                <span className="size-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm text-red-400">{pendingCount} Pending</span>
              </div>
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5">
                <span className="size-2 rounded-full bg-green-500" />
                <span className="text-sm text-green-400">{activeParamedics} On Duty</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Notification Badge */}
              {newBookingCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1 bg-primary/20 border border-primary/30 rounded-full px-3 py-1"
                >
                  <Bell className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">{newBookingCount}</span>
                </motion.div>
              )}

              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-200"}`}
                title={soundEnabled ? "Mute notifications" : "Enable notifications"}
              >
                {soundEnabled ? (
                  <Volume2 className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-slate-600"}`} />
                ) : (
                  <VolumeX className={`w-5 h-5 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                )}
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-200"}`}
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600" />
                )}
              </button>

              {/* Refresh */}
              <button
                onClick={fetchData}
                className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-200"}`}
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-slate-600"}`} />
              </button>

              {/* Add Admin (Master only) */}
              {isMasterAdmin && (
                <button
                  onClick={() => setIsAddAdminModalOpen(true)}
                  className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                  title="Add Admin User"
                >
                  <UserPlus className="w-5 h-5 text-slate-400" />
                </button>
              )}

              {/* User Menu */}
              <div className={`flex items-center gap-2 ml-2 pl-2 border-l ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                <span className={`text-sm hidden sm:block ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {user.email}
                </span>
                <button
                  onClick={signOut}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className={`border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}>
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
          <nav className="flex gap-1">
            <button
              onClick={() => setActiveTab("pulse")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "pulse"
                  ? "border-primary text-primary"
                  : `border-transparent ${isDark ? "text-slate-400 hover:text-slate-300" : "text-slate-500 hover:text-slate-700"}`
              }`}
            >
              <Activity className="w-4 h-4" />
              Live Pulse Monitor
              {pendingCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("field")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "field"
                  ? "border-primary text-primary"
                  : `border-transparent ${isDark ? "text-slate-400 hover:text-slate-300" : "text-slate-500 hover:text-slate-700"}`
              }`}
            >
              <Users className="w-4 h-4" />
              Field Force
              <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>({paramedics.length})</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {activeTab === "pulse" && (
            <motion.div
              key="pulse"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <LivePulseMonitor
                bookings={bookings}
                paramedics={paramedics}
                onDispatch={handleDispatch}
                onComplete={handleEndVisitClick}
                isDark={isDark}
              />
            </motion.div>
          )}
          {activeTab === "field" && (
            <motion.div
              key="field"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <FieldForce
                paramedics={paramedics}
                onUpdate={fetchData}
                isDark={isDark}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Dispatch Modal */}
      <DispatchModal
        isOpen={isDispatchModalOpen}
        onClose={() => {
          setIsDispatchModalOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
        paramedics={paramedics.filter((p) => p.is_active)}
        onDispatch={handleDispatchComplete}
        isDark={isDark}
      />

      {/* Complete Visit Modal */}
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

      {/* Add Admin Modal */}
      {isMasterAdmin && (
        <AddAdminModal
          isOpen={isAddAdminModalOpen}
          onClose={() => setIsAddAdminModalOpen(false)}
          isDark={isDark}
        />
      )}
    </div>
  );
}
