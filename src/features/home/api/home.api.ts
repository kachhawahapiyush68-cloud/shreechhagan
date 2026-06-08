// // src/features/home/api/home.api.ts
// import { postMaster } from "@/lib/http";
// import type { CategoryDto, ProductDto } from "@/types/api";

// export async function getCategories() {
//   return postMaster<CategoryDto[]>({
//     Action: "GET_CATEGORIES",
//     Payload: {},
//   });
// }

// export async function getProducts() {
//   return postMaster<ProductDto[]>({
//     Action: "GET_PRODUCTS",
//     Payload: {},
//   });
// }
import { postCustomer, postMaster } from "@/lib/http";
import type { CategoryDto, NavBannerDto, ProductDto } from "@/types/api";
import { ENV } from "../../../../config/env";

const CLIENT_CODE = ENV.CLIENT_CODE;

export async function getCategories(): Promise<CategoryDto[]> {
  return postMaster<CategoryDto[]>({
    Action: "GET_CATEGORIES",
    Payload: { ClientCode: CLIENT_CODE },
  });
}

export async function getProducts(): Promise<ProductDto[]> {
  return postMaster<ProductDto[]>({
    Action: "GET_PRODUCTS",
    Payload: { ClientCode: CLIENT_CODE },
  });
}

export async function getNavBanners(): Promise<NavBannerDto[]> {
  const res = await postCustomer<NavBannerDto[]>({
    Action: "GET_NAV_SCREEN",
    Payload: { ClientCode: CLIENT_CODE },
  });

  if (res.Status !== 200 || !Array.isArray(res.Data)) return [];

  return res.Data.filter((b) => b.IsActive !== false).sort(
    (a, b) => a.DisplayOrder - b.DisplayOrder,
  );
}

export async function getSpecialProducts(limit = 10): Promise<ProductDto[]> {
  const res = await postCustomer<ProductDto[]>({
    Action: "GET_SPECIAL_PRODUCTS",
    Payload: { ClientCode: CLIENT_CODE, Limit: limit },
  });

  if (res.Status !== 200 || !Array.isArray(res.Data)) return [];
  return res.Data;
}

export async function getTrendingProducts(
  days = 30,
  limit = 10,
): Promise<ProductDto[]> {
  const res = await postCustomer<ProductDto[]>({
    Action: "GET_HIGH_TREND_PRODUCTS",
    Payload: { ClientCode: CLIENT_CODE, Days: days, Limit: limit },
  });

  if (res.Status !== 200 || !Array.isArray(res.Data)) return [];
  return res.Data;
}
