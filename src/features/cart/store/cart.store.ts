// src/features/cart/store/cart.store.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "@/lib/mmkv";

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  qty: number;
  imageUrl?: string | null;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (productId: number) => void;
  increaseQty: (productId: number) => void;
  decreaseQty: (productId: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (x) => x.productId === item.productId,
          );

          if (existing) {
            return {
              items: state.items.map((x) =>
                x.productId === item.productId ? { ...x, qty: x.qty + 1 } : x,
              ),
            };
          }

          return {
            items: [...state.items, { ...item, qty: 1 }],
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((x) => x.productId !== productId),
        })),

      increaseQty: (productId) =>
        set((state) => ({
          items: state.items.map((x) =>
            x.productId === productId ? { ...x, qty: x.qty + 1 } : x,
          ),
        })),

      decreaseQty: (productId) =>
        set((state) => ({
          items: state.items
            .map((x) =>
              x.productId === productId ? { ...x, qty: x.qty - 1 } : x,
            )
            .filter((x) => x.qty > 0),
        })),

      clearCart: () => set({ items: [] }),

      getTotalAmount: () =>
        get().items.reduce((sum, item) => sum + item.price * item.qty, 0),

      getTotalItems: () => get().items.reduce((sum, item) => sum + item.qty, 0),
    }),
    {
      name: "cart-store",
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
