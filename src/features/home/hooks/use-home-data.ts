// // src/features/home/hooks/use-home-data.ts
// import { useQuery } from "@tanstack/react-query";
// import { useMemo } from "react";

// import { getCategories, getProducts } from "@/features/home/api/home.api";

// export function useCategoriesQuery() {
//   return useQuery({
//     queryKey: ["categories"],
//     queryFn: getCategories,
//   });
// }

// export function useProductsQuery() {
//   return useQuery({
//     queryKey: ["products"],
//     queryFn: getProducts,
//   });
// }

// export function useHomeData(selectedCategoryId?: number | null) {
//   const categoriesQuery = useCategoriesQuery();
//   const productsQuery = useProductsQuery();

//   const filteredProducts = useMemo(() => {
//     const products = (productsQuery.data ?? []).filter((item) => item.IsActive);

//     if (!selectedCategoryId) return products;
//     return products.filter((item) => item.CategoryId === selectedCategoryId);
//   }, [productsQuery.data, selectedCategoryId]);

//   return {
//     categories: (categoriesQuery.data ?? []).filter(
//       (x) => x.IsActive !== false,
//     ),
//     products: filteredProducts,
//     isLoading: categoriesQuery.isLoading || productsQuery.isLoading,
//     isRefreshing: categoriesQuery.isRefetching || productsQuery.isRefetching,
//     error: categoriesQuery.error || productsQuery.error,
//     refetch: async () => {
//       await Promise.all([categoriesQuery.refetch(), productsQuery.refetch()]);
//     },
//   };
// }
import { useQuery } from "@tanstack/react-query";
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
    staleTime: 1000 * 60 * 5,
  });
}

export function useProductsQuery() {
  return useQuery({
    queryKey: homeQueryKeys.products,
    queryFn: getProducts,
    staleTime: 1000 * 60 * 2,
  });
}

export function useNavBannersQuery() {
  return useQuery({
    queryKey: homeQueryKeys.navBanners,
    queryFn: getNavBanners,
    staleTime: 1000 * 60 * 10,
  });
}

export function useSpecialProductsQuery(limit = 10) {
  return useQuery({
    queryKey: homeQueryKeys.specialProducts(limit),
    queryFn: () => getSpecialProducts(limit),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTrendingProductsQuery(days = 30, limit = 10) {
  return useQuery({
    queryKey: homeQueryKeys.trendingProducts(days, limit),
    queryFn: () => getTrendingProducts(days, limit),
    staleTime: 1000 * 60 * 5,
  });
}

export function useHomeData(selectedCategoryId?: number | null) {
  const categoriesQuery = useCategoriesQuery();
  const productsQuery = useProductsQuery();
  const navBannersQuery = useNavBannersQuery();
  const specialQuery = useSpecialProductsQuery(10);
  const trendingQuery = useTrendingProductsQuery(30, 10);

  const featuredProducts = useMemo(() => {
    const all = (productsQuery.data ?? []).filter((p) => p.IsActive);
    if (!selectedCategoryId) return all;
    return all.filter((p) => p.CategoryId === selectedCategoryId);
  }, [productsQuery.data, selectedCategoryId]);

  return {
    categories: (categoriesQuery.data ?? []).filter(
      (c) => c.IsActive !== false,
    ),
    featuredProducts,
    products: featuredProducts,
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
      navBannersQuery.isRefetching,
    error:
      categoriesQuery.error || productsQuery.error || navBannersQuery.error,
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
