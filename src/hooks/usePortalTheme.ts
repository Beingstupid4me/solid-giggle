"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePortalAuthStore } from "@/store/portalAuthStore";

export type PortalThemeMode = "light" | "dark";

const KEY_PREFIX = "portal-theme:";

export function usePortalTheme() {
  const userId = usePortalAuthStore((state) => state.session.userId);
  const storageKey = useMemo(() => `${KEY_PREFIX}${(userId || "guest").toLowerCase()}`, [userId]);
  const [mode, setMode] = useState<PortalThemeMode>("light");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved === "dark" || saved === "light") {
        setMode(saved);
      }
    } catch {
      // Ignore storage errors and keep light mode.
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;

    try {
      window.localStorage.setItem(storageKey, mode);
    } catch {
      // Ignore storage errors.
    }

    const root = document.documentElement;
    const body = document.body;
    const themeClass = mode === "dark" ? "portal-theme-dark" : "portal-theme-light";

    root.classList.remove("portal-theme-light", "portal-theme-dark");
    body.classList.remove("portal-theme-light", "portal-theme-dark");
    root.classList.add(themeClass);
    body.classList.add(themeClass);
    root.setAttribute("data-portal-theme", mode);
    body.setAttribute("data-portal-theme", mode);
  }, [hydrated, mode, storageKey]);

  const toggleTheme = useCallback(() => {
    setMode((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  return {
    mode,
    isDark: mode === "dark",
    toggleTheme,
  };
}
