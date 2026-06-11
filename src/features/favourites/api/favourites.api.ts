import { postApiPath } from "@/lib/http";
import type { FavouriteMutationResultDto, ProductDto } from "@/types/api";
import { ENV } from "../../../../config/env";

const CLIENT_CODE = ENV.CLIENT_CODE;

export async function getFavouriteProducts(
  customerId: number,
): Promise<ProductDto[]> {
  const res = await postApiPath<ProductDto[]>(
    "/api/customer/favorites",
    {
      Payload: {
        ClientCode: CLIENT_CODE,
        CustomerId: customerId,
      },
    },
    { requireAuth: false },
  );

  if (res.Status !== 200 || !Array.isArray(res.Data)) {
    return [];
  }

  return res.Data;
}

export async function addFavouriteProduct(
  customerId: number,
  productId: number,
): Promise<FavouriteMutationResultDto | null> {
  const res = await postApiPath<FavouriteMutationResultDto[]>(
    "/api/customer/favorites/add",
    {
      Payload: {
        ClientCode: CLIENT_CODE,
        CustomerId: customerId,
        ProductId: productId,
      },
    },
    { requireAuth: false },
  );

  if (res.Status !== 200 || !Array.isArray(res.Data) || !res.Data[0]) {
    return null;
  }

  return res.Data[0];
}

export async function removeFavouriteProduct(
  customerId: number,
  productId: number,
): Promise<FavouriteMutationResultDto | null> {
  const res = await postApiPath<FavouriteMutationResultDto[]>(
    "/api/customer/favorites/remove",
    {
      Payload: {
        ClientCode: CLIENT_CODE,
        CustomerId: customerId,
        ProductId: productId,
      },
    },
    { requireAuth: false },
  );

  if (res.Status !== 200 || !Array.isArray(res.Data) || !res.Data[0]) {
    return null;
  }

  return res.Data[0];
}
