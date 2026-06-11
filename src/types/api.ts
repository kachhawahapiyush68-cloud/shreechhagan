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
  PhotoPath?: string | null;
  PhotoUrl?: string | null;
  PhotoName?: string | null;
  DisplayOrder?: number;
  IsActive?: boolean;
};

export type ProductImageDto = {
  ProductImageId: number;
  ImagePath: string;
  ImageUrl: string;
  ImageName?: string | null;
  DisplayOrder: number;
};

export type ProductPricingOptionDto = {
  ProductPriceId: number;
  UnitName: string;
  Price: number;
  IsActive: boolean;
  Remarks?: string | null;
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
  ImageName?: string | null;
  VegNonVeg?: boolean;
  productcode?: string;
  isfavorite?: boolean;
  IsSpecial?: boolean;
  stoporder?: boolean;
  unit?: string | null;
  hsncode?: string | null;
  Rating?: number | null;
  AvgRating?: number | null;
  ReviewCount?: number | null;
  TotalReviews?: number | null;
  PricingOptionsXml?: string | null;
  ImagesXml?: string | null;
  ProductImages?: ProductImageDto[];
  PricingOptions?: ProductPricingOptionDto[];
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
  customeremail?: string | null;
  CustomerEmail?: string | null;
  CustomerImageBase64?: string | null;
  CustomerPhotoPath?: string | null;
  CustomerPhotoUrl?: string | null;
  CustomerPhotoName?: string | null;
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
  customeremail?: string | null;
  CustomerEmail?: string | null;
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
  customeremail?: string | null;
  CustomerEmail?: string | null;
  CustomerImageBase64?: string | null;
  CustomerPhotoPath?: string | null;
  CustomerPhotoUrl?: string | null;
  CustomerPhotoName?: string | null;
  OtpVerified: boolean;
  IsActive: boolean;
  token?: string;
  Token?: string;
  ClientCode?: string;
};

export type UpdateCustomerProfileDto = {
  Success: number;
  Message: string;
  CustomerId: number;
  CustomerName: string;
  CustomerMobile: string;
  customeremail?: string | null;
  CustomerPhotoPath?: string | null;
  OtpVerified: boolean;
  IsActive: boolean;
  CustomerPhotoUrl?: string | null;
  CustomerPhotoName?: string | null;
};

export type AddressDto = {
  AddressId: number;
  CustomerId: number;
  AddressType: string;
  FullAddress: string;
  City: string;
  State?: string | null;
  PinCode?: string | null;
  Landmark?: string | null;
  Latitude?: number | null;
  Longitude?: number | null;
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

/* ----------------------------- Coupons ----------------------------- */

export type CouponValidationDto = {
  CouponId: number;
  CouponCode?: string;
  DiscountType: "P" | "F" | string;
  DiscountValue: number;
  DiscountAmount: number;
  IsValid?: boolean;
  Success?: number;
  Message?: string;
};

/* ------------------------------ Orders ----------------------------- */

export type OrderDto = Record<string, unknown>;

export type OrderListItemDto = {
  OrderId: number;
  OrderNo: string;
  OrderDate: string;
  OrderStatus: string;
  TotalAmount: number;
  TotalDiscount: number;
  PaymentStatus?: string | null;
  DeliveryManName?: string | null;
};

export type OrderDetailItemDto = {
  Id: number;
  ItemId: number;
  ProductName: string;
  Qty: number;
  Rate: number;
  Remark?: string | null;
};

export type OrderDetailDto = {
  Order: {
    OrderId: number;
    OrderNo: string;
    TotalAmount: number;
    OrderStatus: string;
    [key: string]: unknown;
  };
  Items: OrderDetailItemDto[];
};

export type PlaceOrderItem = {
  ItemId: number;
  Qty: number;
  Rate: number;
  Remark?: string;
};

export type PlaceOrderResultDto = {
  OrderId: number;
  OrderNo: string;
  TotalAmount: number;
  TotalDiscount: number;
  Success: number;
  Message?: string;
};

export type OrderActionResultDto = {
  Success: number;
  Message?: string;
};

/* --------------------------- Order history (bills) ----------------- */

export type OrderHistoryBillDto = {
  BillId: number;
  BillNumber: string;
  GrandTotal: number;
  BillDate: string;
};

/* ------------------------------- Auth ------------------------------ */

export type AuthSessionUser = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  clientCode?: string;
  photoUrl?: string;
  photoName?: string;
  photoLocalUri?: string;
};

export type AuthSession = {
  user: AuthSessionUser;
  accessToken: string;
};

/* ----------------------------- Helpers ----------------------------- */

type AnyCustomerDto =
  | CustomerLoginDto
  | OtpVerifyDto
  | RegisterCustomerDto
  | UpdateCustomerProfileDto;

export function getCustomerEmail(dto: Partial<AnyCustomerDto>): string {
  const record = dto as Record<string, unknown>;

  if (typeof record.CustomerEmail === "string") {
    return record.CustomerEmail;
  }

  if (typeof record.customeremail === "string") {
    return record.customeremail;
  }

  return "";
}

export function getCustomerToken(
  dto: Partial<CustomerLoginDto & OtpVerifyDto>,
): string {
  return dto.Token || dto.token || "";
}

/* --------------------------- Notifications ------------------------- */

export type NotificationDto = {
  NotificationId: number;
  CustomerId?: number | null;
  Title: string;
  Body: string;
  IsRead: boolean | number;
  SentAt: string;
};

export type NotificationReadResultDto = {
  Success: number;
  Message?: string;
};

/* ---------------------------- App Content -------------------------- */

export type ContentSlug = "privacy" | "help" | "terms";

export type AppContentDto = {
  Id: number;
  Title: string;
  HtmlContent: string;
  IsActive: boolean;
  UpdatedAt: string;
};

export type HelpContentDto = AppContentDto & {
  Phone: string | null;
  Email: string | null;
  WhatsAppNo: string | null;
};
