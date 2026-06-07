// src/features/auth/store/auth.store.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "@/lib/mmkv";
import { setAccessToken, removeAccessToken, removeRefreshToken } from "@/lib/secure-storage";

export type AuthUser = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  clientCode?: string;
};

type AuthDataState = {
  accessToken: string | null;
  user: AuthUser | null;
  isOnboardingCompleted: boolean;
  hasHydrated: boolean;
};

type AuthActions = {
  completeOnboarding: () => void;
  loginWithToken: (user: AuthUser, token: string) => Promise<void>;
  setHasHydrated: (value: boolean) => void;
  logout: () => Promise<void>;
};

export type AuthState = AuthDataState & AuthActions;

const initialDataState: AuthDataState = {
  accessToken: null,
  user: null,
  isOnboardingCompleted: false,
  hasHydrated: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialDataState,

      completeOnboarding: () =>
        set({
          isOnboardingCompleted: true,
        }),

      loginWithToken: async (user, token) => {
        await setAccessToken(token);
        set({ accessToken: token, user });
      },

      setHasHydrated: (value) =>
        set({
          hasHydrated: value,
        }),

      logout: async () => {
        await removeAccessToken();
        await removeRefreshToken();
        set({
          accessToken: null,
          user: null,
        });
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => zustandStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
