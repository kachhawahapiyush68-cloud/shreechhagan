import { postCustomer } from "@/lib/http";
import type { ApiEnvelope, FavouriteMutationResultDto } from "@/types/api";
import { ENV } from "../../../../config/env";

const CLIENT_CODE = ENV.CLIENT_CODE;

export async function addFavouriteProduct(
  customerId: number,
  productId: number,
): Promise<ApiEnvelope<FavouriteMutationResultDto[]>> {
  return postCustomer<FavouriteMutationResultDto[]>({
    Action: "ADD_FAV_PRODUCT",
    Payload: {
      ClientCode: CLIENT_CODE,
      CustomerId: customerId,
      ProductId: productId,
    },
  });
}

export async function updateFavouriteProduct(
  customerId: number,
  productId: number,
  isActive: boolean,
): Promise<ApiEnvelope<FavouriteMutationResultDto[]>> {
  return postCustomer<FavouriteMutationResultDto[]>({
    Action: "UPDATE_FAV_PRODUCT",
    Payload: {
      ClientCode: CLIENT_CODE,
      CustomerId: customerId,
      ProductId: productId,
      IsActive: isActive,
    },
  });
}

export async function removeFavouriteProduct(
  customerId: number,
  productId: number,
): Promise<ApiEnvelope<FavouriteMutationResultDto[]>> {
  return postCustomer<FavouriteMutationResultDto[]>({
    Action: "REMOVE_FAV_PRODUCT",
    Payload: {
      ClientCode: CLIENT_CODE,
      CustomerId: customerId,
      ProductId: productId,
    },
  });
}
