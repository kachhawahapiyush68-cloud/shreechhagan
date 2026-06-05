// src/features/home/api/home.api.ts
import { postMaster } from "@/lib/http";
import type { CategoryDto, ProductDto } from "@/types/api";

export async function getCategories() {
  return postMaster<CategoryDto[]>({
    Action: "GET_CATEGORIES",
    Payload: {},
  });
}

export async function getProducts() {
  return postMaster<ProductDto[]>({
    Action: "GET_PRODUCTS",
    Payload: {},
  });
}
