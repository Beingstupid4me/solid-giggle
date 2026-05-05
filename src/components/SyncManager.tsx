"use client";

import { useCallback, useEffect } from "react";
import backendAPI from "@/lib/backendApi";
import { deleteOfflineVital, listOfflineVitals } from "@/lib/offlineVitalsDb";

export function SyncManager() {
  const flushOfflineVitals = useCallback(async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return;
    }

    const records = await listOfflineVitals();
    for (const record of records) {
      try {
        const response = await backendAPI.submitVitals(record.consultationId, {
          sbp: record.sbp,
          dbp: record.dbp,
          hr: record.hr,
          temp: record.temp,
          spo2: record.spo2,
          bloodSugar: record.bloodSugar,
          syncKey: record.syncKey,
          capturedAt: record.capturedAt,
        });

        if (response.success && typeof record.id === "number") {
          await deleteOfflineVital(record.id);
        }
      } catch {
        // Keep record for next retry.
      }
    }
  }, []);

  useEffect(() => {
    const onOnline = () => {
      void flushOfflineVitals();
    };

    window.addEventListener("online", onOnline);
    void flushOfflineVitals();

    return () => {
      window.removeEventListener("online", onOnline);
    };
  }, [flushOfflineVitals]);

  return null;
}
