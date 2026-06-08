// // src/types/api.ts

// export type ApiEnvelope<T> = {
//   Status: number;
//   Message: string;
//   Data: T;
// };

// export type MasterAction =
//   | "GET_PRODUCTS"
//   | "GET_CATEGORIES"
//   | "GET_SPLASH_SCREEN"
//   | "CUSTOMER_LOGIN"
//   | "REGISTER_CUSTOMER"
//   | "SEND_OTP"
//   | "OTP_VERIFY";

// // ─── Existing DTOs ───────────────────────────────────────────────────────────

// export type CategoryDto = {
//   CategoryId: number;
//   CategoryName: string;
//   IsActive?: boolean;
//   ImageUrl?: string | null;
// };

// export type ProductDto = {
//   ProductId: number;
//   CategoryId: number;
//   CategoryName: string;
//   ProductName: string;
//   Price: number;
//   TaxPercent: number;
//   IsActive: boolean;
//   Description?: string | null;
//   ImageUrl?: string | null;
// };

// // ─── Auth DTOs ────────────────────────────────────────────────────────────────

// export type SplashBannerDto = {
//   BannerId: number;
//   BannerImagePath: string;
//   BannerImageUrl: string;
//   ImageType: number;
//   DisplayOrder: number;
//   IsActive: boolean;
//   CreatedAt: string;
// };

// export type CustomerLoginDto = {
//   Success: number;
//   Message: string;
//   CustomerId: number;
//   CustomerName: string;
//   CustomerMobile: string;
//   customeremail: string;
//   CustomerImageBase64: string;
//   FcmToken: string;
//   OtpVerified: boolean;
//   IsActive: boolean;
//   token: string;
//   Token: string;
//   ClientCode: string;
//   fcm_token: string;
// };

// export type RegisterCustomerDto = {
//   Success: number;
//   Message: string;
//   CustomerId: number;
//   CustomerName: string;
//   CustomerMobile: string;
//   customeremail: string;
//   OtpVerified: boolean;
//   IsActive: boolean;
// };

// export type SendOtpDto = {
//   NotificationSent: boolean;
//   NotificationStatus: string;
// };

// export type OtpVerifyDto = {
//   Success: number;
//   Message: string;
//   CustomerId: number;
//   CustomerName: string;
//   CustomerMobile: string;
//   customeremail: string;
//   CustomerImageBase64?: string;
//   OtpVerified: boolean;
//   IsActive: boolean;
//   token: string;
//   Token: string;
//   ClientCode: string;
// };
export type ApiEnvelope<T> = {
  Status: number;
  Message: string;
  Data: T;
};

export type ApiRequestAction =
  | "GET_PRODUCTS"
  | "GET_CATEGORIES"
  | "GET_SPLASH_SCREEN"
  | "CUSTOMER_LOGIN"
  | "REGISTER_CUSTOMER"
  | "SEND_OTP"
  | "OTP_VERIFY"
  | "ADD_CUSTOMER_ADDRESS"
  | "UPDATE_CUSTOMER_ADDRESS"
  | "DELETE_CUSTOMER_ADDRESS"
  | "GET_CUSTOMER_ADDRESSES"
  | "GET_NAV_SCREEN"
  | "ADD_FAV_PRODUCT"
  | "UPDATE_FAV_PRODUCT"
  | "REMOVE_FAV_PRODUCT"
  | "GET_SPECIAL_PRODUCTS"
  | "GET_HIGH_TREND_PRODUCTS"
  | "GET_ORDER_LIST";

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
  customeremail?: string;
  CustomerEmail?: string;
  CustomerImageBase64?: string;
  FcmToken?: string;
  OtpVerified: boolean;
  IsActive: boolean;
  token?: string;
  Token?: string;
  ClientCode?: string;
  fcm_token?: string;
};

export type RegisterCustomerDto = {
  Success: number;
  Message: string;
  CustomerId: number;
  CustomerName: string;
  CustomerMobile: string;
  customeremail?: string;
  CustomerEmail?: string;
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
  customeremail?: string;
  CustomerEmail?: string;
  CustomerImageBase64?: string;
  OtpVerified: boolean;
  IsActive: boolean;
  token?: string;
  Token?: string;
  ClientCode?: string;
};

export type AddressDto = {
  AddressId: number;
  CustomerId: number;
  AddressType: string;
  FullAddress: string;
  City: string;
  State?: string;
  PinCode?: string;
  Landmark?: string;
  Latitude?: number;
  Longitude?: number;
  IsDefault: boolean;
  IsActive: boolean;
};

export type AddressMutationResultDto = {
  AddressId: number;
  Message: string;
  Success: number;
};

export type NavBannerDto = {
  BannerId: number;
  BannerImagePath: string;
  ImageType: number;
  DisplayOrder: number;
  IsActive: boolean;
  CreatedAt: string;
  BannerImageUrl: string;
};

export type FavouriteMutationResultDto = {
  ProductId: number;
  Message: string;
  Success: number;
};

export type OrderDto = Record<string, unknown>;

export type AuthSessionUser = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  clientCode?: string;
};

export type AuthSession = {
  user: AuthSessionUser;
  accessToken: string;
};

export function getCustomerEmail(
  dto: Partial<CustomerLoginDto & OtpVerifyDto & RegisterCustomerDto>,
) {
  return dto.customeremail || dto.CustomerEmail || "";
}

export function getCustomerToken(
  dto: Partial<CustomerLoginDto & OtpVerifyDto>,
) {
  return dto.Token || dto.token || "";
}
