import { create } from "zustand";
import { persist } from "zustand/middleware";
import backendAPI, { backendAuthStorage } from "@/lib/backendApi";

export type PortalRole = "patient" | "medic" | "doctor" | "admin";

interface PortalSession {
  authenticated: boolean;
  role: PortalRole | null;
  userId: string;
  email?: string;
  token?: string; // JWT from Supabase
}

interface PortalAuthState {
  session: PortalSession;
  isLoading: boolean;
  error: string | null;
  
  // Backend auth proxy
  login: (payload: {
    identifier: string;
    password: string;
    role: PortalRole;
  }) => Promise<{ ok: boolean; message?: string }>;
  
  signup: (payload: {
    phone: string;
    email: string;
    password: string;
    fullName: string;
    role: PortalRole;
  }) => Promise<{ ok: boolean; message?: string }>;
  
  logout: () => void;
  setError: (message: string | null) => void;
}

/**
 * Production Auth Store - Uses backend auth proxy.
 */
export const usePortalAuthStore = create<PortalAuthState>()(
  persist(
    (set) => ({
      session: {
        authenticated: false,
        role: null,
        userId: "",
        email: undefined,
        token: undefined,
      },
      isLoading: false,
      error: null,

      // Production signup - creates Auth user + profile via backend proxy
      signup: async ({ phone, email, password, fullName, role }) => {
        try {
          set({ isLoading: true, error: null });

          // Validate inputs
          if (!phone || !email || !password || !fullName) {
            throw new Error("All fields are required");
          }
          if (password.length < 8) {
            throw new Error("Password must be at least 8 characters");
          }

          const result = await backendAPI.signup(phone, password, fullName, role, email);
          if (!result.success || !result.data) {
            throw new Error(result.error || "Signup failed");
          }

          const me = await backendAPI.getMe();
          const profile = (me as any)?.data?.profile || {};
          const resolvedRole = ((me as any)?.data?.role || role) as PortalRole;

          set({
            session: {
              authenticated: true,
              role: resolvedRole,
              userId: (me as any)?.data?.userId || profile.id || "",
              email: undefined,
              token: (result as any).data?.token,
            },
            isLoading: false,
          });

          return { ok: true };
        } catch (err) {
          const message = err instanceof Error ? err.message : "Signup failed";
          set({ error: message, isLoading: false });
          return { ok: false, message };
        }
      },

      // Production login - verifies through backend auth proxy
      login: async ({ identifier, password, role }) => {
        try {
          set({ isLoading: true, error: null });

          if (!identifier || !password) {
            throw new Error("Email or phone and password are required");
          }

          const result = await backendAPI.login(identifier, password, role);
          if (!result.success || !result.data) {
            throw new Error(result.error || "Invalid email/phone or password");
          }

          const me = await backendAPI.getMe();
          const userRole = ((me as any)?.data?.role || role) as PortalRole;
          const userId = (me as any)?.data?.userId || "";
          const userEmail = undefined;

          // Store session
          set({
            session: {
              authenticated: true,
              role: userRole as PortalRole,
              userId,
              email: userEmail,
              token: (result as any).data?.token,
            },
            isLoading: false,
          });

          return { ok: true };
        } catch (err) {
          const message = err instanceof Error ? err.message : "Login failed";
          set({ error: message, isLoading: false });
          return { ok: false, message };
        }
      },

      // Logout - clears session and backend tokens
      logout: async () => {
        try {
          await backendAPI.logout();
        } catch (err) {
          console.error("Logout error:", err);
        }

        backendAuthStorage.clear();

        set({
          session: {
            authenticated: false,
            role: null,
            userId: "",
            email: undefined,
            token: undefined,
          },
          error: null,
        });
      },

      setError: (message) => set({ error: message }),
    }),
    {
      name: "portal-auth-store",
      partialize: (state) => ({
        session: state.session,
      }),
    }
  )
);
