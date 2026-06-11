import { postApiPath } from "@/lib/http";
import type {
  OrderActionResultDto,
  OrderDetailDto,
  OrderListItemDto,
  PlaceOrderItem,
  PlaceOrderResultDto,
} from "@/types/api";
import { ENV } from "../../../../config/env";

const CLIENT_CODE = ENV.CLIENT_CODE;

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Preparing"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

export async function getOrderList(
  customerId: number,
): Promise<OrderListItemDto[]> {
  const res = await postApiPath<OrderListItemDto[]>(
    "/api/customer/orders/list",
    { Payload: { ClientCode: CLIENT_CODE, CustomerId: customerId } },
    { requireAuth: false },
  );

  if (res.Status !== 200 || !Array.isArray(res.Data)) return [];
  return res.Data;
}

export async function getOrderDetail(
  orderId: number,
  customerId: number,
): Promise<OrderDetailDto | null> {
  try {
    const res = await postApiPath<unknown>(
      "/api/customer/orders/detail",
      {
        Payload: {
          ClientCode: CLIENT_CODE,
          OrderId: orderId,
          CustomerId: customerId,
        },
      },
      { requireAuth: false },
    );

    if (res.Status !== 200 || !res.Data) {
      if (__DEV__) console.log("[orders/detail] bad envelope:", res.Status);
      return null;
    }

    const node = (Array.isArray(res.Data) ? res.Data[0] : res.Data) as
      | Record<string, unknown>
      | undefined;

    if (!node) return null;

    const order = (node.Order ?? node) as Record<string, unknown>;
    const items = (node.Items ?? order.Items ?? []) as unknown;

    if (order.OrderId == null && order.OrderNo == null) {
      if (__DEV__) {
        console.log(
          "[orders/detail] no order in:",
          JSON.stringify(res.Data).slice(0, 300),
        );
      }
      return null;
    }

    return {
      Order: order as OrderDetailDto["Order"],
      Items: Array.isArray(items) ? items : [],
    };
  } catch (err) {
    if (__DEV__) console.log("[orders/detail] request failed:", err);
    throw err;
  }
}

export async function placeOrder(params: {
  customerId: number;
  addressId?: number;
  items: PlaceOrderItem[];
  couponCode?: string;
  remarks?: string;
}): Promise<PlaceOrderResultDto | null> {
  const res = await postApiPath<PlaceOrderResultDto[]>(
    "/api/customer/orders/place",
    {
      Payload: {
        ClientCode: CLIENT_CODE,
        CustomerId: params.customerId,
        ...(params.addressId ? { AddressId: params.addressId } : {}),
        Items: params.items,
        ...(params.couponCode ? { CouponCode: params.couponCode } : {}),
        ...(params.remarks ? { Remarks: params.remarks } : {}),
      },
    },
    { requireAuth: false },
  );

  if (res.Status !== 200 || !Array.isArray(res.Data) || !res.Data[0]) {
    return null;
  }

  return res.Data[0];
}

export async function cancelOrder(params: {
  orderId: number;
  customerId: number;
  remark: string;
}): Promise<boolean> {
  const res = await postApiPath<OrderActionResultDto[]>(
    "/api/customer/orders/cancel",
    {
      Payload: {
        ClientCode: CLIENT_CODE,
        OrderId: params.orderId,
        CustomerId: params.customerId,
        CancellationRemark: params.remark,
      },
    },
    { requireAuth: false },
  );

  return (
    res.Status === 200 && Array.isArray(res.Data) && res.Data[0]?.Success === 1
  );
}
// import { postApiPath } from "@/lib/http";
// import type {
//   OrderActionResultDto,
//   OrderDetailDto,
//   OrderListItemDto,
//   PlaceOrderItem,
//   PlaceOrderResultDto,
// } from "@/types/api";
// import { ENV } from "../../../../config/env";

// const CLIENT_CODE = ENV.CLIENT_CODE;

// export type OrderStatus =
//   | "Pending"
//   | "Confirmed"
//   | "Preparing"
//   | "Out for Delivery"
//   | "Delivered"
//   | "Cancelled";

// export async function getOrderList(
//   customerId: number,
// ): Promise<OrderListItemDto[]> {
//   const res = await postApiPath<OrderListItemDto[]>(
//     "/api/customer/orders/list",
//     { Payload: { ClientCode: CLIENT_CODE, CustomerId: customerId } },
//     { requireAuth: false },
//   );
//   if (res.Status !== 200 || !Array.isArray(res.Data)) return [];
//   return res.Data;
// }

// export async function getOrderDetail(
//   orderId: number,
//   customerId: number,
// ): Promise<OrderDetailDto | null> {
//   try {
//     const res = await postApiPath<unknown>(
//       "/api/customer/orders/detail",
//       {
//         Payload: {
//           ClientCode: CLIENT_CODE,
//           OrderId: orderId,
//           CustomerId: customerId,
//         },
//       },
//       { requireAuth: false },
//     );

//     if (res.Status !== 200 || !res.Data) {
//       if (__DEV__) console.log("[orders/detail] bad envelope:", res.Status);
//       return null;
//     }

//     // Real shape: Data is an ARRAY holding ONE flat order object that also
//     // carries an `Items` array. (Not the documented { Order, Items } wrapper.)
//     const node = (Array.isArray(res.Data) ? res.Data[0] : res.Data) as
//       | Record<string, any>
//       | undefined;

//     if (!node) return null;

//     // Support both the flat shape and a { Order, Items } wrapper, just in case.
//     const order = (node.Order ?? node) as Record<string, any>;
//     const items = node.Items ?? order.Items ?? [];

//     if (order.OrderId == null && order.OrderNo == null) {
//       if (__DEV__) {
//         console.log(
//           "[orders/detail] no order in:",
//           JSON.stringify(res.Data).slice(0, 300),
//         );
//       }
//       return null;
//     }

//     return {
//       Order: order as OrderDetailDto["Order"],
//       Items: Array.isArray(items) ? items : [],
//     };
//   } catch (err) {
//     if (__DEV__) console.log("[orders/detail] request failed:", err);
//     throw err;
//   }
// }

// export async function placeOrder(params: {
//   customerId: number;
//   items: PlaceOrderItem[];
//   couponCode?: string;
//   remarks?: string;
// }): Promise<PlaceOrderResultDto | null> {
//   const res = await postApiPath<PlaceOrderResultDto[]>(
//     "/api/customer/orders/place",
//     {
//       Payload: {
//         ClientCode: CLIENT_CODE,
//         CustomerId: params.customerId,
//         Items: params.items,
//         ...(params.couponCode ? { CouponCode: params.couponCode } : {}),
//         ...(params.remarks ? { Remarks: params.remarks } : {}),
//       },
//     },
//     { requireAuth: false },
//   );
//   if (res.Status !== 200 || !Array.isArray(res.Data) || !res.Data[0]) {
//     return null;
//   }
//   return res.Data[0];
// }

// export async function cancelOrder(params: {
//   orderId: number;
//   customerId: number;
//   remark: string;
// }): Promise<boolean> {
//   const res = await postApiPath<OrderActionResultDto[]>(
//     "/api/customer/orders/cancel",
//     {
//       Payload: {
//         ClientCode: CLIENT_CODE,
//         OrderId: params.orderId,
//         CustomerId: params.customerId,
//         CancellationRemark: params.remark,
//       },
//     },
//     { requireAuth: false },
//   );
//   return (
//     res.Status === 200 && Array.isArray(res.Data) && res.Data[0]?.Success === 1
//   );
// }
