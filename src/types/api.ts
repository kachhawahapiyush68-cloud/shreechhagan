// src/types/api.ts

export type ApiEnvelope<T> = {
  Status: number;
  Message: string;
  Data: T;
};

export type MasterAction =
  | "GET_PRODUCTS"
  | "GET_CATEGORIES"
  | "GET_SPLASH_SCREEN"
  | "CUSTOMER_LOGIN"
  | "REGISTER_CUSTOMER"
  | "SEND_OTP"
  | "OTP_VERIFY";

// ─── Existing DTOs ───────────────────────────────────────────────────────────

export type CategoryDto = {
  CategoryId: number;
  CategoryName: string;
  IsActive?: boolean;
  ImageUrl?: string | null;
};

export type ProductDto = {
  ProductId: number;
  CategoryId: number;
  CategoryName: string;
  ProductName: string;
  Price: number;
  TaxPercent: number;
  IsActive: boolean;
  Description?: string | null;
  ImageUrl?: string | null;
};

// ─── Auth DTOs ────────────────────────────────────────────────────────────────

export type SplashBannerDto = {
  BannerId: number;
  BannerImagePath: string;
  BannerImageUrl: string;
  ImageType: number;
  DisplayOrder: number;
  IsActive: boolean;
  CreatedAt: string;
};

export type CustomerLoginDto = {
  Success: number;
  Message: string;
  CustomerId: number;
  CustomerName: string;
  CustomerMobile: string;
  customeremail: string;
  CustomerImageBase64: string;
  FcmToken: string;
  OtpVerified: boolean;
  IsActive: boolean;
  token: string;
  Token: string;
  ClientCode: string;
  fcm_token: string;
};

export type RegisterCustomerDto = {
  Success: number;
  Message: string;
  CustomerId: number;
  CustomerName: string;
  CustomerMobile: string;
  customeremail: string;
  OtpVerified: boolean;
  IsActive: boolean;
};

export type SendOtpDto = {
  NotificationSent: boolean;
  NotificationStatus: string;
};

export type OtpVerifyDto = {
  Success: number;
  Message: string;
  CustomerId: number;
  CustomerName: string;
  CustomerMobile: string;
  customeremail: string;
  CustomerImageBase64?: string;
  OtpVerified: boolean;
  IsActive: boolean;
  token: string;
  Token: string;
  ClientCode: string;
};
