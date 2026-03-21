"use client";

import { useSyncExternalStore } from "react";
import { usePortalAuthStore } from "@/store/portalAuthStore";

const DUMMY_HYDRATED = false;

function getPersistApi() {
  return usePortalAuthStore.persist;
}

function subscribe(onStoreChange: () => void) {
  const persist = getPersistApi();
  if (!persist || typeof persist.onFinishHydration !== "function") {
    return () => {};
  }

  const unsubscribe = persist.onFinishHydration(() => {
    onStoreChange();
  });

  return typeof unsubscribe === "function" ? unsubscribe : () => {};
}

function getSnapshot() {
  try {
    const persist = getPersistApi();
    if (!persist || typeof persist.hasHydrated !== "function") {
      return DUMMY_HYDRATED;
    }

    return persist.hasHydrated();
  } catch {
    return DUMMY_HYDRATED;
  }
}

export function usePortalHydrated() {
  return useSyncExternalStore(subscribe, getSnapshot, () => DUMMY_HYDRATED);
}