import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "@/lib/mmkv";
import { clearAuthTokens, setAccessToken } from "@/lib/secure-storage";
import type { AuthSessionUser } from "@/types/api";

export type AuthUser = AuthSessionUser;

type AuthDataState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isOnboardingCompleted: boolean;
  hasHydrated: boolean;
};

type AuthActions = {
  completeOnboarding: () => void;
  loginWithToken: (user: AuthUser, token: string) => Promise<void>;
  restoreSession: (user: AuthUser | null) => void;
  setHasHydrated: (value: boolean) => void;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<AuthUser>) => void;
};

export type AuthState = AuthDataState & AuthActions;

const initialDataState: AuthDataState = {
  user: null,
  isAuthenticated: false,
  isOnboardingCompleted: false,
  hasHydrated: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialDataState,

      completeOnboarding: () => {
        set({ isOnboardingCompleted: true });
      },

      loginWithToken: async (user, token) => {
        await setAccessToken(token);
        set({
          user,
          isAuthenticated: true,
        });
      },

      restoreSession: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      setHasHydrated: (value) => {
        set({ hasHydrated: value });
      },

      updateUser: (patch) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...patch } : state.user,
        }));
      },

      logout: async () => {
        await clearAuthTokens();
        set({
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isOnboardingCompleted: state.isOnboardingCompleted,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
