// src/features/home/hooks/use-home-data.ts
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { getCategories, getProducts } from "@/features/home/api/home.api";

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
}

export function useProductsQuery() {
  return useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });
}

export function useHomeData(selectedCategoryId?: number | null) {
  const categoriesQuery = useCategoriesQuery();
  const productsQuery = useProductsQuery();

  const filteredProducts = useMemo(() => {
    const products = (productsQuery.data ?? []).filter((item) => item.IsActive);

    if (!selectedCategoryId) return products;
    return products.filter((item) => item.CategoryId === selectedCategoryId);
  }, [productsQuery.data, selectedCategoryId]);

  return {
    categories: (categoriesQuery.data ?? []).filter(
      (x) => x.IsActive !== false,
    ),
    products: filteredProducts,
    isLoading: categoriesQuery.isLoading || productsQuery.isLoading,
    isRefreshing: categoriesQuery.isRefetching || productsQuery.isRefetching,
    error: categoriesQuery.error || productsQuery.error,
    refetch: async () => {
      await Promise.all([categoriesQuery.refetch(), productsQuery.refetch()]);
    },
  };
}
