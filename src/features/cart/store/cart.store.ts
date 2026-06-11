import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "@/lib/mmkv";

export type CartItem = {
  productId: number;
  productPriceId: number;
  productName: string;
  unitName: string;
  price: number;
  qty: number;
  imageUrl?: string | null;
  taxPercent?: number;
};

type AddCartItemInput = Omit<CartItem, "qty">;

type CartState = {
  items: CartItem[];
  addItem: (item: AddCartItemInput) => void;
  removeItem: (productId: number, productPriceId: number) => void;
  increaseQty: (productId: number, productPriceId: number) => void;
  decreaseQty: (productId: number, productPriceId: number) => void;
  clearCart: () => void;
  getItemQty: (productId: number, productPriceId: number) => number;
  getTotalAmount: () => number;
  getTotalItems: () => number;
};

function isSameCartLine(
  item: Pick<CartItem, "productId" | "productPriceId">,
  productId: number,
  productPriceId: number,
) {
  return item.productId === productId && item.productPriceId === productPriceId;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((x) =>
            isSameCartLine(x, item.productId, item.productPriceId),
          );

          if (existing) {
            return {
              items: state.items.map((x) =>
                isSameCartLine(x, item.productId, item.productPriceId)
                  ? { ...x, qty: x.qty + 1 }
                  : x,
              ),
            };
          }

          return {
            items: [...state.items, { ...item, qty: 1 }],
          };
        }),

      removeItem: (productId, productPriceId) =>
        set((state) => ({
          items: state.items.filter(
            (x) => !isSameCartLine(x, productId, productPriceId),
          ),
        })),

      increaseQty: (productId, productPriceId) =>
        set((state) => ({
          items: state.items.map((x) =>
            isSameCartLine(x, productId, productPriceId)
              ? { ...x, qty: x.qty + 1 }
              : x,
          ),
        })),

      decreaseQty: (productId, productPriceId) =>
        set((state) => ({
          items: state.items
            .map((x) =>
              isSameCartLine(x, productId, productPriceId)
                ? { ...x, qty: x.qty - 1 }
                : x,
            )
            .filter((x) => x.qty > 0),
        })),

      clearCart: () => set({ items: [] }),

      getItemQty: (productId, productPriceId) =>
        get().items.find((x) => isSameCartLine(x, productId, productPriceId))
          ?.qty ?? 0,

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
