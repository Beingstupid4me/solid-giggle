"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISS_KEY = "portal-install-dismissed";

function getDismissedFromStorage() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function setDismissedInStorage(value: "1" | null) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (value === null) {
      window.localStorage.removeItem(DISMISS_KEY);
      return;
    }
    window.localStorage.setItem(DISMISS_KEY, value);
  } catch {
    // Ignore storage failures and keep in-memory state.
  }
}

function getInstalledState() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const standaloneMedia = window.matchMedia?.("(display-mode: standalone)")?.matches ?? false;
    const navigatorStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
    return standaloneMedia || navigatorStandalone;
  } catch {
    return false;
  }
}

export function PortalInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => getDismissedFromStorage());
  const [installed, setInstalled] = useState(() => getInstalledState());
  const [showIosHint, setShowIosHint] = useState(false);
  const [isIos] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
      setShowIosHint(false);
      setDismissedInStorage(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const visible = useMemo(() => {
    if (installed || dismissed) {
      return false;
    }
    return Boolean(promptEvent) || isIos;
  }, [dismissed, installed, isIos, promptEvent]);

  if (!visible) {
    return null;
  }

  const handleDismiss = () => {
    setDismissedInStorage("1");
    setDismissed(true);
  };

  const handleInstall = async () => {
    try {
      if (promptEvent) {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;

        if (choice.outcome === "dismissed") {
          return;
        }

        setInstalled(true);
        setPromptEvent(null);
        return;
      }

      setShowIosHint(true);
    } catch {
      // Fallback hint for browsers where install prompt behavior is unavailable.
      setShowIosHint(isIos);
    }
  };

  return (
    <div className="fixed top-3 right-3 z-[70] max-w-72 rounded-lg border border-slate-200 bg-white/95 p-2.5 shadow-lg backdrop-blur-xl">
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={handleInstall}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:brightness-95"
        >
          <Download className="h-3.5 w-3.5" />
          Install app
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="ml-auto rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="mt-2 text-[10px] font-medium leading-snug text-slate-600">
        Quick launch and offline readiness for your portal workflow.
      </p>
      {showIosHint ? (
        <p className="mt-1.5 text-[10px] leading-snug text-slate-500">
          On iPhone/iPad, use Share then Add to Home Screen.
        </p>
      ) : null}
    </div>
  );
}