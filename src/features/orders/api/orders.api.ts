import { postCustomer } from "@/lib/http";
import type { OrderDto } from "@/types/api";
import { ENV } from "../../../../config/env";

const CLIENT_CODE = ENV.CLIENT_CODE;

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Preparing"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

export type GetOrderListParams = {
  customerId: number;
  status?: OrderStatus;
  fromDate?: string;
  toDate?: string;
};

export async function getOrderList(
  params: GetOrderListParams,
): Promise<OrderDto[]> {
  const res = await postCustomer<OrderDto[]>({
    Action: "GET_ORDER_LIST",
    Payload: {
      ClientCode: CLIENT_CODE,
      CustomerId: params.customerId,
      ...(params.status ? { Status: params.status } : {}),
      ...(params.fromDate ? { FromDate: params.fromDate } : {}),
      ...(params.toDate ? { ToDate: params.toDate } : {}),
    },
  });

  if (res.Status !== 200 || !Array.isArray(res.Data)) return [];
  return res.Data;
}
