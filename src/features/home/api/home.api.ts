import { getApiPath, postApiPath, postCustomer } from "@/lib/http";
import type { CategoryDto, NavBannerDto, ProductDto } from "@/types/api";
import { ENV } from "../../../../config/env";

const CLIENT_CODE = ENV.CLIENT_CODE;

function normalizeCategories(items: CategoryDto[]) {
  return [...items]
    .filter((item) => item?.IsActive !== false)
    .sort((a, b) => (a.DisplayOrder ?? 9999) - (b.DisplayOrder ?? 9999));
}

function normalizeProducts(items: ProductDto[]) {
  return items
    .filter((item) => item?.IsActive !== false)
    .map((item) => ({
      ...item,
      ProductImages: Array.isArray(item.ProductImages)
        ? [...item.ProductImages].sort(
            (a, b) => a.DisplayOrder - b.DisplayOrder,
          )
        : [],
      PricingOptions: Array.isArray(item.PricingOptions)
        ? item.PricingOptions.filter((option) => option?.IsActive !== false)
        : [],
    }));
}

export async function getCategories(): Promise<CategoryDto[]> {
  const res = await postApiPath<CategoryDto[]>(
    "/api/customer/catalogue/categories",
    {
      Payload: { ClientCode: CLIENT_CODE },
    },
    { requireAuth: false },
  );

  if (res.Status !== 200 || !Array.isArray(res.Data)) {
    return [];
  }

  return normalizeCategories(res.Data);
}

export async function getProducts(): Promise<ProductDto[]> {
  const res = await postApiPath<ProductDto[]>(
    "/api/customer/catalogue/products",
    {
      Payload: { ClientCode: CLIENT_CODE },
    },
    { requireAuth: false },
  );

  if (res.Status !== 200 || !Array.isArray(res.Data)) {
    return [];
  }

  return normalizeProducts(res.Data);
}

export async function getProductsFallback(): Promise<ProductDto[]> {
  const res = await getApiPath<ProductDto[]>(
    "/api/customer/products",
    { ClientCode: CLIENT_CODE },
    { requireAuth: false },
  );

  if (res.Status !== 200 || !Array.isArray(res.Data)) {
    return [];
  }

  return normalizeProducts(res.Data);
}

export async function getNavBanners(): Promise<NavBannerDto[]> {
  const res = await postCustomer<NavBannerDto[]>({
    Action: "GET_NAV_SCREEN",
    Payload: { ClientCode: CLIENT_CODE },
  });

  if (res.Status !== 200 || !Array.isArray(res.Data)) {
    return [];
  }

  return res.Data.filter((b) => b.IsActive !== false).sort(
    (a, b) => a.DisplayOrder - b.DisplayOrder,
  );
}

export async function getSpecialProducts(limit = 10): Promise<ProductDto[]> {
  const res = await postApiPath<ProductDto[]>(
    "/api/customer/catalogue/products/special",
    {
      Payload: { ClientCode: CLIENT_CODE, Limit: limit },
    },
    { requireAuth: false },
  );

  if (res.Status !== 200 || !Array.isArray(res.Data)) {
    return [];
  }

  return normalizeProducts(res.Data);
}

export async function getTrendingProducts(
  days = 30,
  limit = 10,
): Promise<ProductDto[]> {
  const res = await postApiPath<ProductDto[]>(
    "/api/customer/catalogue/products/trending",
    {
      Payload: { ClientCode: CLIENT_CODE, Days: days, Limit: limit },
    },
    { requireAuth: false },
  );

  if (res.Status !== 200 || !Array.isArray(res.Data)) {
    return [];
  }

  return normalizeProducts(res.Data);
}

export function getPrimaryProductImage(product: ProductDto) {
  return product.ProductImages?.[0]?.ImageUrl || product.ImageUrl || null;
}

export function getDefaultPricingOption(product: ProductDto) {
  if (product.PricingOptions && product.PricingOptions.length > 0) {
    return product.PricingOptions[0];
  }

  return {
    ProductPriceId: product.ProductId,
    UnitName: product.unit || "Unit",
    Price: product.Price,
    IsActive: true,
    Remarks: product.ProductName,
  };
}

export function getDisplayPrice(product: ProductDto) {
  return getDefaultPricingOption(product).Price ?? product.Price;
}
