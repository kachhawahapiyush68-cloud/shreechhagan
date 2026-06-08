import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  addFavouriteProduct,
  removeFavouriteProduct,
  updateFavouriteProduct,
} from "@/features/favourites/api/favourites.api";
import { homeQueryKeys } from "@/features/home/hooks/use-home-data";

export function useAddFavouriteMutation() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const customerId = userId ? Number(userId) : 0;

  return useMutation({
    mutationFn: (productId: number) =>
      addFavouriteProduct(customerId, productId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: homeQueryKeys.products });
    },
  });
}

export function useUpdateFavouriteMutation() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const customerId = userId ? Number(userId) : 0;

  return useMutation({
    mutationFn: ({
      productId,
      isActive,
    }: {
      productId: number;
      isActive: boolean;
    }) => updateFavouriteProduct(customerId, productId, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: homeQueryKeys.products });
    },
  });
}

export function useRemoveFavouriteMutation() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const customerId = userId ? Number(userId) : 0;

  return useMutation({
    mutationFn: (productId: number) =>
      removeFavouriteProduct(customerId, productId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: homeQueryKeys.products });
    },
  });
}
