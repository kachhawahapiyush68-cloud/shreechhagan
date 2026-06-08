import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  getOrderList,
  type GetOrderListParams,
  type OrderStatus,
} from "@/features/orders/api/orders.api";

export const orderQueryKeys = {
  list: (
    params: Omit<GetOrderListParams, "customerId"> & { customerId: number },
  ) => ["orders", "list", params] as const,
};

export function useOrderListQuery(params?: {
  status?: OrderStatus;
  fromDate?: string;
  toDate?: string;
}) {
  const userId = useAuthStore((s) => s.user?.id);
  const customerId = userId ? Number(userId) : 0;

  return useQuery({
    queryKey: orderQueryKeys.list({
      customerId,
      ...params,
    }),
    queryFn: () =>
      getOrderList({
        customerId,
        ...params,
      }),
    enabled: customerId > 0,
    staleTime: 1000 * 30,
  });
}
