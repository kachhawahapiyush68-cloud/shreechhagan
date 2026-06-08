import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addCustomerAddress,
  deleteCustomerAddress,
  getCustomerAddresses,
  updateCustomerAddress,
} from "@/features/address/api/address.api";
import { useAuthStore } from "@/features/auth/store/auth.store";

export const addressQueryKeys = {
  list: (customerId: number) => ["addresses", customerId] as const,
};

export function useAddressesQuery() {
  const userId = useAuthStore((s) => s.user?.id);
  const customerId = userId ? Number(userId) : 0;

  return useQuery({
    queryKey: addressQueryKeys.list(customerId),
    queryFn: () => getCustomerAddresses(customerId),
    enabled: customerId > 0,
  });
}

export function useAddAddressMutation() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const customerId = userId ? Number(userId) : 0;

  return useMutation({
    mutationFn: (params: Parameters<typeof addCustomerAddress>[0]) =>
      addCustomerAddress(params),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: addressQueryKeys.list(customerId),
      });
    },
  });
}

export function useUpdateAddressMutation() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const customerId = userId ? Number(userId) : 0;

  return useMutation({
    mutationFn: (params: Parameters<typeof updateCustomerAddress>[0]) =>
      updateCustomerAddress(params),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: addressQueryKeys.list(customerId),
      });
    },
  });
}

export function useDeleteAddressMutation() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const customerId = userId ? Number(userId) : 0;

  return useMutation({
    mutationFn: (addressId: number) =>
      deleteCustomerAddress({ customerId, addressId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: addressQueryKeys.list(customerId),
      });
    },
  });
}
