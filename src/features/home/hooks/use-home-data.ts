import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import {
  getCategories,
  getNavBanners,
  getProducts,
  getSpecialProducts,
  getTrendingProducts,
} from "@/features/home/api/home.api";

export const homeQueryKeys = {
  categories: ["home", "categories"] as const,
  products: ["home", "products"] as const,
  navBanners: ["home", "navBanners"] as const,
  specialProducts: (limit: number) => ["home", "special", limit] as const,
  trendingProducts: (days: number, limit: number) =>
    ["home", "trending", days, limit] as const,
};

export function useCategoriesQuery() {
  return useQuery({
    queryKey: homeQueryKeys.categories,
    queryFn: getCategories,
    staleTime: 1000 * 60 * 10,
  });
}

export function useProductsQuery() {
  return useQuery({
    queryKey: homeQueryKeys.products,
    queryFn: getProducts,
    staleTime: 1000 * 60 * 5,
  });
}

export function useHomeData(selectedCategoryId?: number | null) {
  const [
    categoriesQuery,
    productsQuery,
    navBannersQuery,
    specialQuery,
    trendingQuery,
  ] = useQueries({
    queries: [
      {
        queryKey: homeQueryKeys.categories,
        queryFn: getCategories,
        staleTime: 1000 * 60 * 10,
      },
      {
        queryKey: homeQueryKeys.products,
        queryFn: getProducts,
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: homeQueryKeys.navBanners,
        queryFn: getNavBanners,
        staleTime: 1000 * 60 * 10,
      },
      {
        queryKey: homeQueryKeys.specialProducts(10),
        queryFn: () => getSpecialProducts(10),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: homeQueryKeys.trendingProducts(30, 10),
        queryFn: () => getTrendingProducts(30, 10),
        staleTime: 1000 * 60 * 5,
      },
    ],
  });

  const filteredProducts = useMemo(() => {
    const all = productsQuery.data ?? [];
    if (!selectedCategoryId) return all;
    return all.filter((product) => product.CategoryId === selectedCategoryId);
  }, [productsQuery.data, selectedCategoryId]);

  return {
    categories: categoriesQuery.data ?? [],
    products: productsQuery.data ?? [],
    featuredProducts: filteredProducts,
    navBanners: navBannersQuery.data ?? [],
    specialProducts: specialQuery.data ?? [],
    trendingProducts: trendingQuery.data ?? [],
    isLoading:
      categoriesQuery.isLoading ||
      productsQuery.isLoading ||
      navBannersQuery.isLoading,
    isRefreshing:
      categoriesQuery.isRefetching ||
      productsQuery.isRefetching ||
      navBannersQuery.isRefetching ||
      specialQuery.isRefetching ||
      trendingQuery.isRefetching,
    error:
      categoriesQuery.error ||
      productsQuery.error ||
      navBannersQuery.error ||
      specialQuery.error ||
      trendingQuery.error,
    refetch: async () => {
      await Promise.all([
        categoriesQuery.refetch(),
        productsQuery.refetch(),
        navBannersQuery.refetch(),
        specialQuery.refetch(),
        trendingQuery.refetch(),
      ]);
    },
  };
}
