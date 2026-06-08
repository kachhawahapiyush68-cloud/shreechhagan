import { postCustomer } from "@/lib/http";
import type {
  AddressDto,
  AddressMutationResultDto,
  ApiEnvelope,
} from "@/types/api";
import { ENV } from "../../../../config/env";

const CLIENT_CODE = ENV.CLIENT_CODE;

export async function getCustomerAddresses(
  customerId: number,
): Promise<AddressDto[]> {
  const res = await postCustomer<AddressDto[]>({
    Action: "GET_CUSTOMER_ADDRESSES",
    Payload: {
      ClientCode: CLIENT_CODE,
      CustomerId: customerId,
    },
  });

  if (res.Status !== 200 || !Array.isArray(res.Data)) {
    return [];
  }

  return res.Data.filter((a) => a.IsActive !== false);
}

export async function addCustomerAddress(params: {
  customerId: number;
  addressType: string;
  fullAddress: string;
  city: string;
  state?: string;
  pinCode?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}): Promise<ApiEnvelope<AddressMutationResultDto[]>> {
  return postCustomer<AddressMutationResultDto[]>({
    Action: "ADD_CUSTOMER_ADDRESS",
    Payload: {
      ClientCode: CLIENT_CODE,
      CustomerId: params.customerId,
      AddressType: params.addressType,
      FullAddress: params.fullAddress,
      City: params.city,
      State: params.state ?? "",
      PinCode: params.pinCode ?? "",
      Landmark: params.landmark ?? "",
      Latitude: params.latitude ?? 0,
      Longitude: params.longitude ?? 0,
      IsDefault: params.isDefault,
    },
  });
}

export async function updateCustomerAddress(params: {
  customerId: number;
  addressId: number;
  addressType?: string;
  fullAddress?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  landmark?: string;
  isDefault?: boolean;
}): Promise<ApiEnvelope<AddressMutationResultDto[]>> {
  return postCustomer<AddressMutationResultDto[]>({
    Action: "UPDATE_CUSTOMER_ADDRESS",
    Payload: {
      ClientCode: CLIENT_CODE,
      CustomerId: params.customerId,
      AddressId: params.addressId,
      ...(params.addressType !== undefined && {
        AddressType: params.addressType,
      }),
      ...(params.fullAddress !== undefined && {
        FullAddress: params.fullAddress,
      }),
      ...(params.city !== undefined && { City: params.city }),
      ...(params.state !== undefined && { State: params.state }),
      ...(params.pinCode !== undefined && { PinCode: params.pinCode }),
      ...(params.landmark !== undefined && { Landmark: params.landmark }),
      ...(params.isDefault !== undefined && { IsDefault: params.isDefault }),
    },
  });
}

export async function deleteCustomerAddress(params: {
  customerId: number;
  addressId: number;
}): Promise<ApiEnvelope<AddressMutationResultDto[]>> {
  return postCustomer<AddressMutationResultDto[]>({
    Action: "DELETE_CUSTOMER_ADDRESS",
    Payload: {
      ClientCode: CLIENT_CODE,
      CustomerId: params.customerId,
      AddressId: params.addressId,
    },
  });
}
