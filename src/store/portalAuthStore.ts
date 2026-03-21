import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PortalRole = "patient" | "medic" | "doctor" | "admin";

interface PortalSession {
  authenticated: boolean;
  role: PortalRole | null;
  userId: string;
}

interface PortalAuthState {
  session: PortalSession;
  login: (payload: { role: PortalRole; userId: string; password: string }) => { ok: boolean; message?: string };
  logout: () => void;
}

const rolePasswordMap: Record<PortalRole, string> = {
  patient: "patient123",
  medic: "medic123",
  doctor: "doctor123",
  admin: "admin123",
};

export const usePortalAuthStore = create<PortalAuthState>()(
  persist(
    (set) => ({
      session: {
        authenticated: false,
        role: null,
        userId: "",
      },

      login: ({ role, userId, password }) => {
        if (!userId.trim()) {
          return { ok: false, message: "Enter your user ID or phone." };
        }

        if (password !== rolePasswordMap[role]) {
          return { ok: false, message: `Invalid credentials. Use ${rolePasswordMap[role]} for MVP.` };
        }

        set({
          session: {
            authenticated: true,
            role,
            userId: userId.trim(),
          },
        });

        return { ok: true };
      },

      logout: () =>
        set({
          session: {
            authenticated: false,
            role: null,
            userId: "",
          },
        }),
    }),
    {
      name: "portal-auth-store",
      partialize: (state) => ({
        session: state.session,
      }),
    },
  ),
);
