// // src/features/auth/store/auth.store.ts
// import { create } from "zustand";
// import { createJSONStorage, persist } from "zustand/middleware";

// import { zustandStorage } from "@/lib/mmkv";
// import { setAccessToken, removeAccessToken, removeRefreshToken } from "@/lib/secure-storage";

// export type AuthUser = {
//   id: string;
//   fullName: string;
//   phone: string;
//   email?: string;
//   clientCode?: string;
// };

// type AuthDataState = {
//   accessToken: string | null;
//   user: AuthUser | null;
//   isOnboardingCompleted: boolean;
//   hasHydrated: boolean;
// };

// type AuthActions = {
//   completeOnboarding: () => void;
//   loginWithToken: (user: AuthUser, token: string) => Promise<void>;
//   setHasHydrated: (value: boolean) => void;
//   logout: () => Promise<void>;
// };

// export type AuthState = AuthDataState & AuthActions;

// const initialDataState: AuthDataState = {
//   accessToken: null,
//   user: null,
//   isOnboardingCompleted: false,
//   hasHydrated: false,
// };

// export const useAuthStore = create<AuthState>()(
//   persist(
//     (set) => ({
//       ...initialDataState,

//       completeOnboarding: () =>
//         set({
//           isOnboardingCompleted: true,
//         }),

//       loginWithToken: async (user, token) => {
//         await setAccessToken(token);
//         set({ accessToken: token, user });
//       },

//       setHasHydrated: (value) =>
//         set({
//           hasHydrated: value,
//         }),

//       logout: async () => {
//         await removeAccessToken();
//         await removeRefreshToken();
//         set({
//           accessToken: null,
//           user: null,
//         });
//       },
//     }),
//     {
//       name: "auth-store",
//       storage: createJSONStorage(() => zustandStorage),
//       onRehydrateStorage: () => (state) => {
//         state?.setHasHydrated(true);
//       },
//     },
//   ),
// );
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
