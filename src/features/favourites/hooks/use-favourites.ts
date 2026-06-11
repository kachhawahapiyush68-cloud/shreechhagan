import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  addFavouriteProduct,
  getFavouriteProducts,
  removeFavouriteProduct,
} from "@/features/favourites/api/favourites.api";
import { homeQueryKeys } from "@/features/home/hooks/use-home-data";
import type { ProductDto } from "@/types/api";

export const favouriteQueryKeys = {
  all: ["favourites"] as const,
  list: (customerId: number) => ["favourites", "list", customerId] as const,
};

function patchProducts(
  items: ProductDto[] | undefined,
  productId: number,
  isfavorite: boolean,
) {
  if (!Array.isArray(items)) {
    return items;
  }

  return items.map((item) =>
    item.ProductId === productId ? { ...item, isfavorite } : item,
  );
}

export function useFavouriteProductsQuery() {
  const userId = useAuthStore((s) => s.user?.id);
  const customerId = userId ? Number(userId) : 0;

  return useQuery({
    queryKey: favouriteQueryKeys.list(customerId),
    queryFn: () => getFavouriteProducts(customerId),
    enabled: customerId > 0,
    staleTime: 1000 * 60 * 5,
  });
}

export function useToggleFavouriteMutation() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const customerId = userId ? Number(userId) : 0;

  return useMutation({
    mutationFn: async (product: ProductDto) => {
      if (!customerId) {
        throw new Error("Customer not found");
      }

      if (product.isfavorite) {
        await removeFavouriteProduct(customerId, product.ProductId);
        return { productId: product.ProductId, isfavorite: false, product };
      }

      await addFavouriteProduct(customerId, product.ProductId);
      return { productId: product.ProductId, isfavorite: true, product };
    },
    onMutate: async (product) => {
      if (!customerId) return;

      await queryClient.cancelQueries({
        queryKey: homeQueryKeys.products,
      });
      await queryClient.cancelQueries({
        queryKey: favouriteQueryKeys.list(customerId),
      });

      const previousProducts = queryClient.getQueryData<ProductDto[]>(
        homeQueryKeys.products,
      );
      const previousFavourites = queryClient.getQueryData<ProductDto[]>(
        favouriteQueryKeys.list(customerId),
      );

      const nextFavState = !product.isfavorite;

      queryClient.setQueryData<ProductDto[]>(
        homeQueryKeys.products,
        (current) => patchProducts(current, product.ProductId, nextFavState),
      );

      queryClient.setQueryData<ProductDto[]>(
        favouriteQueryKeys.list(customerId),
        (current = []) => {
          if (nextFavState) {
            const exists = current.some(
              (item) => item.ProductId === product.ProductId,
            );
            if (exists) {
              return current;
            }
            return [{ ...product, isfavorite: true }, ...current];
          }

          return current.filter((item) => item.ProductId !== product.ProductId);
        },
      );

      return {
        previousProducts,
        previousFavourites,
      };
    },
    onError: (_error, _variables, context) => {
      if (!customerId || !context) return;

      queryClient.setQueryData(
        homeQueryKeys.products,
        context.previousProducts,
      );
      queryClient.setQueryData(
        favouriteQueryKeys.list(customerId),
        context.previousFavourites,
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: homeQueryKeys.products,
      });

      if (customerId) {
        void queryClient.invalidateQueries({
          queryKey: favouriteQueryKeys.list(customerId),
        });
      }
    },
  });
}
