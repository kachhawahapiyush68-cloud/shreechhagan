// src/features/auth/store/auth.store.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "@/lib/mmkv";

export type AuthUser = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
};

type AuthDataState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isOnboardingCompleted: boolean;
  hasHydrated: boolean;
};

type AuthActions = {
  completeOnboarding: () => void;
  fakeLoginWithPhone: (phone: string) => void;
  fakeRegister: (payload: {
    fullName: string;
    email: string;
    phone: string;
  }) => void;
  setHasHydrated: (value: boolean) => void;
  logout: () => void;
};

export type AuthState = AuthDataState & AuthActions;

const initialDataState: AuthDataState = {
  accessToken: null,
  refreshToken: null,
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

      fakeLoginWithPhone: (phone) =>
        set({
          accessToken: "dummy-token",
          refreshToken: "dummy-refresh",
          user: {
            id: "1",
            fullName: "Bakery User",
            phone,
          },
        }),

      fakeRegister: ({ fullName, email, phone }) =>
        set({
          accessToken: "dummy-token",
          refreshToken: "dummy-refresh",
          user: {
            id: "1",
            fullName,
            email,
            phone,
          },
        }),

      setHasHydrated: (value) =>
        set({
          hasHydrated: value,
        }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
        }),
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
