// src/lib/mmkv.ts
import { createMMKV } from "react-native-mmkv";
import type { StateStorage } from "zustand/middleware";

export const mmkv = createMMKV({
  id: "bakery-storage",
});

export const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    mmkv.set(name, value);
  },
  getItem: (name) => {
    const value = mmkv.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    mmkv.remove(name);
  },
};
