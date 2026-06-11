import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  cancelOrder,
  getOrderDetail,
  getOrderList,
  placeOrder,
  type OrderStatus,
} from "@/features/orders/api/orders.api";
import type { PlaceOrderItem } from "@/types/api";

export const orderQueryKeys = {
  list: (customerId: number) => ["orders", "list", customerId] as const,
  detail: (orderId: number, customerId: number) =>
    ["orders", "detail", orderId, customerId] as const,
};

function matchesTab(orderStatus: string, tab?: OrderStatus) {
  if (!tab) return true;

  const s = (orderStatus ?? "").toLowerCase();

  if (tab === "Delivered") return s === "delivered";
  if (tab === "Cancelled") return s === "cancelled";

  return s !== "delivered" && s !== "cancelled";
}

export function useOrderListQuery(params?: { status?: OrderStatus }) {
  const userId = useAuthStore((s) => s.user?.id);
  const customerId = userId ? Number(userId) : 0;

  const query = useQuery({
    queryKey: orderQueryKeys.list(customerId),
    queryFn: () => getOrderList(customerId),
    enabled: customerId > 0,
    staleTime: 1000 * 30,
  });

  const data = (query.data ?? []).filter((o) =>
    matchesTab(o.OrderStatus, params?.status),
  );

  return { ...query, data };
}

export function useOrderDetailQuery(orderId: number) {
  const userId = useAuthStore((s) => s.user?.id);
  const customerId = userId ? Number(userId) : 0;

  if (__DEV__) {
    console.log("[order detail] orderId:", orderId, "customerId:", customerId);
  }

  return useQuery({
    queryKey: orderQueryKeys.detail(orderId, customerId),
    queryFn: () => getOrderDetail(orderId, customerId),
    enabled: orderId > 0 && customerId > 0,
  });
}

export function usePlaceOrderMutation() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const customerId = userId ? Number(userId) : 0;

  return useMutation({
    mutationFn: (params: {
      items: PlaceOrderItem[];
      addressId?: number;
      couponCode?: string;
      remarks?: string;
    }) => placeOrder({ customerId, ...params }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({
        queryKey: orderQueryKeys.list(customerId),
      });
    },
  });
}

export function useCancelOrderMutation() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const customerId = userId ? Number(userId) : 0;

  return useMutation({
    mutationFn: (params: { orderId: number; remark: string }) =>
      cancelOrder({
        orderId: params.orderId,
        customerId,
        remark: params.remark,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({
        queryKey: orderQueryKeys.list(customerId),
      });
    },
  });
}
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// import { useAuthStore } from "@/features/auth/store/auth.store";
// import {
//   cancelOrder,
//   getOrderDetail,
//   getOrderList,
//   placeOrder,
//   type OrderStatus,
// } from "@/features/orders/api/orders.api";
// import type { PlaceOrderItem } from "@/types/api";

// export const orderQueryKeys = {
//   list: (customerId: number) => ["orders", "list", customerId] as const,
//   detail: (orderId: number, customerId: number) =>
//     ["orders", "detail", orderId, customerId] as const,
// };

// function matchesTab(orderStatus: string, tab?: OrderStatus) {
//   if (!tab) return true;
//   const s = (orderStatus ?? "").toLowerCase();
//   if (tab === "Delivered") return s === "delivered";
//   if (tab === "Cancelled") return s === "cancelled";
//   return s !== "delivered" && s !== "cancelled";
// }

// export function useOrderListQuery(params?: { status?: OrderStatus }) {
//   const userId = useAuthStore((s) => s.user?.id);
//   const customerId = userId ? Number(userId) : 0;

//   const query = useQuery({
//     queryKey: orderQueryKeys.list(customerId),
//     queryFn: () => getOrderList(customerId),
//     enabled: customerId > 0,
//     staleTime: 1000 * 30,
//   });

//   const data = (query.data ?? []).filter((o) =>
//     matchesTab(o.OrderStatus, params?.status),
//   );

//   return { ...query, data };
// }

// export function useOrderDetailQuery(orderId: number) {
//   const userId = useAuthStore((s) => s.user?.id);
//   const customerId = userId ? Number(userId) : 0;

//   if (__DEV__) {
//     console.log("[order detail] orderId:", orderId, "customerId:", customerId);
//   }

//   return useQuery({
//     queryKey: orderQueryKeys.detail(orderId, customerId),
//     queryFn: () => getOrderDetail(orderId, customerId),
//     // run whenever we have an orderId, so a failure shows up instead of a
//     // silently-disabled query
//     enabled: orderId > 0,
//   });
// }

// export function usePlaceOrderMutation() {
//   const queryClient = useQueryClient();
//   const userId = useAuthStore((s) => s.user?.id);
//   const customerId = userId ? Number(userId) : 0;

//   return useMutation({
//     mutationFn: (params: {
//       items: PlaceOrderItem[];
//       couponCode?: string;
//       remarks?: string;
//     }) => placeOrder({ customerId, ...params }),
//     onSuccess: () => {
//       void queryClient.invalidateQueries({ queryKey: ["orders"] });
//     },
//   });
// }

// export function useCancelOrderMutation() {
//   const queryClient = useQueryClient();
//   const userId = useAuthStore((s) => s.user?.id);
//   const customerId = userId ? Number(userId) : 0;

//   return useMutation({
//     mutationFn: (params: { orderId: number; remark: string }) =>
//       cancelOrder({
//         orderId: params.orderId,
//         customerId,
//         remark: params.remark,
//       }),
//     onSuccess: () => {
//       void queryClient.invalidateQueries({ queryKey: ["orders"] });
//     },
//   });
// }
