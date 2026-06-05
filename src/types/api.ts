// src/types/api.ts
export type ApiEnvelope<T> = {
  Status: number;
  Message: string;
  Data: T;
};

export type MasterAction = "GET_PRODUCTS" | "GET_CATEGORIES";

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
