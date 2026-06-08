// // src/features/auth/api/auth.api.ts
// import { postAuth, postCustomer } from "@/lib/http";
// import { getFcmToken } from "@/lib/push";
// import type {
//   ApiEnvelope,
//   CustomerLoginDto,
//   OtpVerifyDto,
//   RegisterCustomerDto,
//   SendOtpDto,
//   SplashBannerDto,
// } from "@/types/api";
// import { ENV } from "../../../../config/env";

// const CLIENT_CODE = ENV.CLIENT_CODE;

// async function resolveFcmToken(): Promise<string> {
//   const token = await getFcmToken();
//   return token && token.length > 0 ? token : "no-fcm-token";
// }

// export async function getSplashBanners(): Promise<SplashBannerDto[]> {
//   const res = await postCustomer<SplashBannerDto[]>({
//     Action: "GET_SPLASH_SCREEN",
//     Payload: { ClientCode: CLIENT_CODE },
//   });
//   if (res.Status !== 200) return [];
//   return res.Data;
// }

// export async function loginCustomer(
//   mobile: string,
// ): Promise<ApiEnvelope<CustomerLoginDto[]>> {
//   const fcm_token = await resolveFcmToken();
//   const payload = { ClientCode: CLIENT_CODE, Mobile: mobile, fcm_token };
//   if (__DEV__) console.log("LOGIN PAYLOAD →", JSON.stringify(payload));
//   return postAuth<CustomerLoginDto[]>({
//     Action: "CUSTOMER_LOGIN",
//     Payload: payload,
//   });
// }

// export async function registerCustomer(
//   name: string,
//   mobile: string,
//   email: string,
// ): Promise<ApiEnvelope<RegisterCustomerDto[]>> {
//   return postCustomer<RegisterCustomerDto[]>({
//     Action: "REGISTER_CUSTOMER",
//     Payload: {
//       ClientCode: CLIENT_CODE,
//       CustomerName: name,
//       CustomerMobile: mobile,
//       customeremail: email,
//     },
//   });
// }

// // ─── OTP Send — NOW includes fcm_token so the backend pushes the OTP ──────────
// export async function sendOtp(
//   mobile: string,
// ): Promise<ApiEnvelope<SendOtpDto[]>> {
//   const fcm_token = await resolveFcmToken();
//   const payload = { ClientCode: CLIENT_CODE, Mobile: mobile, fcm_token };
//   if (__DEV__) console.log("SEND_OTP PAYLOAD →", JSON.stringify(payload));
//   return postCustomer<SendOtpDto[]>({ Action: "SEND_OTP", Payload: payload });
// }

// export async function verifyOtp(
//   mobile: string,
//   otp: string,
// ): Promise<ApiEnvelope<OtpVerifyDto[]>> {
//   const fcm_token = await resolveFcmToken();
//   return postCustomer<OtpVerifyDto[]>({
//     Action: "OTP_VERIFY",
//     Payload: { ClientCode: CLIENT_CODE, Mobile: mobile, Otp: otp, fcm_token },
//   });
// }
import { postAuth, postCustomer } from "@/lib/http";
import { getFcmToken } from "@/lib/push";
import type {
  ApiEnvelope,
  AuthSession,
  CustomerLoginDto,
  OtpVerifyDto,
  RegisterCustomerDto,
  SendOtpDto,
  SplashBannerDto,
} from "@/types/api";
import { getCustomerEmail, getCustomerToken } from "@/types/api";
import { ENV } from "../../../../config/env";

const CLIENT_CODE = ENV.CLIENT_CODE;

async function resolveFcmToken(): Promise<string> {
  const token = await getFcmToken();
  return token && token.length > 0 ? token : "no-fcm-token";
}

export function mapAuthSession(
  dto: CustomerLoginDto | OtpVerifyDto,
): AuthSession | null {
  const token = getCustomerToken(dto);

  if (!token || !dto.CustomerId) {
    return null;
  }

  return {
    accessToken: token,
    user: {
      id: String(dto.CustomerId),
      fullName: dto.CustomerName,
      phone: dto.CustomerMobile,
      email: getCustomerEmail(dto) || undefined,
      clientCode: dto.ClientCode || CLIENT_CODE,
    },
  };
}

export async function getSplashBanners(): Promise<SplashBannerDto[]> {
  const res = await postCustomer<SplashBannerDto[]>({
    Action: "GET_SPLASH_SCREEN",
    Payload: { ClientCode: CLIENT_CODE },
  });

  if (res.Status !== 200 || !Array.isArray(res.Data)) {
    return [];
  }

  return res.Data.filter((item) => item?.IsActive !== false).sort(
    (a, b) => a.DisplayOrder - b.DisplayOrder,
  );
}

export async function loginCustomer(
  mobile: string,
): Promise<ApiEnvelope<CustomerLoginDto[]>> {
  const fcm_token = await resolveFcmToken();

  return postAuth<CustomerLoginDto[]>({
    Action: "CUSTOMER_LOGIN",
    Payload: {
      ClientCode: CLIENT_CODE,
      Mobile: mobile,
      fcm_token,
    },
  });
}

export async function registerCustomer(
  name: string,
  mobile: string,
  email: string,
): Promise<ApiEnvelope<RegisterCustomerDto[]>> {
  return postCustomer<RegisterCustomerDto[]>({
    Action: "REGISTER_CUSTOMER",
    Payload: {
      ClientCode: CLIENT_CODE,
      CustomerName: name,
      CustomerMobile: mobile,
      customeremail: email,
    },
  });
}

export async function sendOtp(
  mobile: string,
): Promise<ApiEnvelope<SendOtpDto[]>> {
  const fcm_token = await resolveFcmToken();

  return postCustomer<SendOtpDto[]>({
    Action: "SEND_OTP",
    Payload: {
      ClientCode: CLIENT_CODE,
      Mobile: mobile,
      fcm_token,
    },
  });
}

export async function verifyOtp(
  mobile: string,
  otp: string,
): Promise<ApiEnvelope<OtpVerifyDto[]>> {
  const fcm_token = await resolveFcmToken();

  return postCustomer<OtpVerifyDto[]>({
    Action: "OTP_VERIFY",
    Payload: {
      ClientCode: CLIENT_CODE,
      Mobile: mobile,
      Otp: otp,
      fcm_token,
    },
  });
}
