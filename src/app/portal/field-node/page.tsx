"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock3, MapPin, MoveRight, PhoneCall, Timer } from "lucide-react";
import { FieldBottomNav, FieldTopBar } from "@/components/field-node/FieldNodeScaffold";
import { useFieldNodePortalStore } from "@/store/fieldNodePortalStore";
import { useDispatchQueue, useAcceptCase } from "@/hooks/useSupabaseIntegration";
import { supabase } from "@/lib/supabase";

const toneClasses = {
  critical: "border-red-600/90 bg-red-50 text-red-700",
  urgent: "border-amber-700/70 bg-amber-50 text-amber-800",
  routine: "border-teal-700/60 bg-teal-50 text-teal-800",
} as const;

const badgeClasses = {
  critical: "bg-red-700 text-white",
  urgent: "bg-amber-700 text-white",
  routine: "bg-teal-200 text-teal-900",
} as const;

// Helper: Calculate distance for display
function formatDistance(geom: any): number {
  // If geometry object already has distance, use it; otherwise return placeholder
  return geom?.distance_km || 0;
}

// Helper: Calculate receiving time ago
function calculateReceivedLabel(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return "1d+ ago";
}

// Helper: Get severity from status
function getSeverityFromStatus(status: string): "critical" | "urgent" | "routine" {
  if (status === "critical" || status === "escalate") return "critical";
  if (status === "monitor" || status === "in_transit") return "urgent";
  return "routine";
}

export default function FieldDutyDashboardPage() {
  const { dutyOn, toggleDuty, profile, activeCaseId } = useFieldNodePortalStore();
  const [queue, setLocalQueue] = useState<any[]>([]);
  const [incomingCaseId, setIncomingCaseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState<string | null>(null);
  const { fetchQueue } = useDispatchQueue();
  const { acceptCase: acceptCaseService } = useAcceptCase();

  // Load dispatch queue on mount
  useEffect(() => {
    if (!dutyOn) return;

    const loadQueue = async () => {
      setLoading(true);
      try {
        const result = await fetchQueue();
        if (result && Array.isArray(result)) {
          const transformed = result.map((dbCase: any) => ({
            id: dbCase.id,
            patientName: dbCase.profiles?.full_name || "Unknown",
            severity: getSeverityFromStatus(dbCase.status),
            complaint: dbCase.chief_complaint || "General consultation",
            distanceKm: formatDistance(dbCase.location),
            receivedLabel: calculateReceivedLabel(dbCase.created_at),
            location: dbCase.location,
          }));
          setLocalQueue(transformed);
          setError(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load queue");
      } finally {
        setLoading(false);
      }
    };

    loadQueue();
  }, [dutyOn, fetchQueue]);

  useEffect(() => {
    let channelCleanup: (() => void) | null = null;

    const subscribe = async () => {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id;
      if (!userId) {
        return;
      }

      const channel = supabase
        .channel("medic-consultation-ear")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "consultations",
            filter: `medic_id=eq.${userId}`,
          },
          (payload) => {
            setIncomingCaseId(payload.new?.id || null);
          }
        )
        .subscribe();

      channelCleanup = () => {
        supabase.removeChannel(channel);
      };
    };

    subscribe();

    return () => {
      channelCleanup?.();
    };
  }, []);

  useEffect(() => {
    if (!dutyOn || !activeCaseId) {
      return;
    }

    let ws: WebSocket | null = null;
    let watchId: number | null = null;

    const startSocket = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        return;
      }

      const wsBase = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/v1/ws";
      const wsUrl = `${wsBase}/location?token=${encodeURIComponent(token)}`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            ws?.send(
              JSON.stringify({
                type: "GPS_UPDATE",
                consultationId: activeCaseId,
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: new Date().toISOString(),
              })
            );
          },
          () => {
            // Ignore intermittent geolocation errors.
          },
          { enableHighAccuracy: true, maximumAge: 10000 }
        );
      };
    };

    startSocket();

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      ws?.close();
    };
  }, [activeCaseId, dutyOn]);

  const handleAcceptCase = async (caseId: string) => {
    setAccepting(caseId);
    try {
      const result = await acceptCaseService(caseId);
      if (result.success) {
        // Remove from local queue
        setLocalQueue(queue.filter((item: any) => item.id !== caseId));
        setError(null);
      } else {
        setError(result.error || "Failed to accept case");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept case");
    } finally {
      setAccepting(null);
    }
  };

  return (
    <div className="min-h-screen pb-28 md:pb-0">
      <FieldTopBar />

      <main className="mx-auto w-full max-w-6xl px-4 py-4 md:px-6">
        <div className="mb-4 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-slate-900 md:text-3xl">Duty Status</h1>
            <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              {profile.unitCode} • Shift: {profile.shiftLabel}
            </p>
          </div>

          <button
            onClick={toggleDuty}
            className={`h-12 min-w-48 overflow-hidden rounded-lg border p-1 font-semibold uppercase tracking-[0.12em] text-sm transition ${
              dutyOn
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-slate-300 bg-slate-100 text-slate-700"
            }`}
          >
            <div
              className={`flex h-full items-center justify-center transition-all ${
                dutyOn ? "bg-emerald-500 text-white" : ""
              }`}
            >
              {dutyOn ? "✓ On Duty" : "Off Duty"}
            </div>
          </button>
        </div>

        <section className="mb-4 grid gap-3 grid-cols-3 md:grid-cols-3">
          <article className="rounded-lg border border-slate-200/60 bg-slate-50 p-3">
            <Timer className="h-4 w-4 text-primary" />
            <p className="mt-2 font-serif text-xl font-semibold md:text-2xl text-slate-900">06:42:15</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Duty Time</p>
          </article>
          <article className="rounded-lg border border-slate-200/60 bg-slate-50 p-3">
            <PhoneCall className="h-4 w-4 text-primary" />
            <p className="mt-2 font-serif text-xl font-semibold md:text-2xl text-slate-900">12</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Completed</p>
          </article>
          <article className="rounded-lg border border-slate-200/60 bg-slate-50 p-3">
            <Clock3 className="h-4 w-4 text-primary" />
            <p className="mt-2 font-serif text-xl font-semibold md:text-2xl text-slate-900">8.4m</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Avg Response</p>
          </article>
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-serif text-lg font-semibold text-slate-900">Current Queue</h2>
            <span className="rounded bg-sky-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
              {queue.length} Active
            </span>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-red-700 border border-red-200">
              <p className="text-sm font-semibold">Error:</p>
              <p className="text-xs">{error}</p>
            </div>
          )}

          {incomingCaseId ? (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900">
              <p className="text-sm font-semibold">New case assigned</p>
              <p className="text-xs">Consultation {incomingCaseId} is now in your queue.</p>
            </div>
          ) : null}

          {loading ? (
            <div className="rounded-lg bg-white p-6 text-center shadow-sm border border-slate-200/50">
              <p className="text-slate-600">Loading dispatch queue...</p>
            </div>
          ) : queue.length === 0 ? (
            <div className="rounded-lg bg-slate-50 p-6 text-center border border-slate-200/50">
              <p className="text-slate-600">No active cases in queue</p>
            </div>
          ) : (
            <div className="space-y-2">
              {queue.map((job: any) => (
                <article
                  key={job.id}
                  className={`rounded-lg border-l-4 bg-white p-3 shadow-sm transition hover:shadow-md ${toneClasses[job.severity as keyof typeof toneClasses]}`}
                >
                  <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-serif text-sm font-semibold text-slate-900 md:text-base">{job.patientName}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{job.complaint}</p>
                    </div>
                    <span className={`whitespace-nowrap rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-widest ${badgeClasses[job.severity as keyof typeof badgeClasses]}`}>
                      {job.severity}
                    </span>
                  </div>
                  <div className="mb-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.distanceKm.toFixed(1)} km
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" />
                      {job.receivedLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAcceptCase(job.id)}
                      disabled={accepting === job.id}
                      className="inline-flex h-9 items-center justify-center gap-1 rounded-md bg-primary px-3 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-primary/90 disabled:opacity-50"
                    >
                      <MoveRight className="h-3 w-3" />
                      {accepting === job.id ? "Accepting..." : "Accept"}
                    </button>
                    <Link
                      href="/portal/field-node/vitals"
                      className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-widest text-slate-700 transition hover:bg-slate-100"
                    >
                      Details
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <FieldBottomNav />
    </div>
  );
}
