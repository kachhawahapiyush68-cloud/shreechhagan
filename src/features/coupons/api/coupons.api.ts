import { ApiError, postApiPath } from "@/lib/http";
import type { CouponValidationDto } from "@/types/api";
import { ENV } from "../../../../config/env";

const CLIENT_CODE = ENV.CLIENT_CODE;

export type CouponResult =
  | { ok: true; coupon: CouponValidationDto }
  | { ok: false; message: string };

export async function validateCoupon(params: {
  couponCode: string;
  orderAmount: number;
  customerId: number;
}): Promise<CouponResult> {
  const normalizedCode = params.couponCode.trim().toUpperCase();

  const payload = {
    ClientCode: CLIENT_CODE,
    CouponCode: normalizedCode,
    OrderAmount: params.orderAmount,
    CustomerId: params.customerId,
  };

  try {
    const res = await postApiPath<CouponValidationDto[]>(
      "/api/customer/coupons/validate",
      { Payload: payload },
      { requireAuth: false },
    );

    if (__DEV__) {
      console.log(
        "[coupon]",
        payload.CouponCode,
        "→",
        res.Status,
        res.Message,
        JSON.stringify(res.Data),
      );
    }

    const node = Array.isArray(res.Data) ? res.Data[0] : undefined;

    const valid =
      res.Status === 200 &&
      !!node &&
      (node.Success === 1 || node.IsValid === true);

    if (valid) {
      return {
        ok: true,
        coupon: {
          ...node,
          CouponCode: node.CouponCode ?? normalizedCode,
        },
      };
    }

    return {
      ok: false,
      message: node?.Message || res.Message || "Invalid or inactive coupon.",
    };
  } catch (error) {
    if (error instanceof ApiError) {
      if (__DEV__) {
        console.log("[coupon] rejected →", error.status, error.message);
      }

      return {
        ok: false,
        message: error.message || "Invalid or inactive coupon.",
      };
    }

    throw error;
  }
}
