import { postApiPath } from "@/lib/http";
import type { AppContentDto, HelpContentDto } from "@/types/api";
import { ENV } from "../../../../config/env";

const CLIENT_CODE = ENV.CLIENT_CODE;

function extractContent<T extends AppContentDto>(res: {
  Status: number;
  Message?: string;
  Data: T[] | null;
}): T | null {
  if (res.Status !== 200 || !Array.isArray(res.Data) || !res.Data.length)
    return null;
  const item = res.Data[0];
  if (!item?.IsActive) return null;
  return item;
}

export async function getPrivacyContent(): Promise<AppContentDto | null> {
  const res = await postApiPath<AppContentDto[]>(
    "/api/customer/content/privacy",
    { Payload: { ClientCode: CLIENT_CODE } },
    { requireAuth: false },
  );
  return extractContent(res);
}

export async function getHelpContent(): Promise<HelpContentDto | null> {
  const res = await postApiPath<HelpContentDto[]>(
    "/api/customer/content/help",
    { Payload: { ClientCode: CLIENT_CODE } },
    { requireAuth: false },
  );
  return extractContent(res);
}

export async function getTermsContent(): Promise<AppContentDto | null> {
  const res = await postApiPath<AppContentDto[]>(
    "/api/customer/content/terms",
    { Payload: { ClientCode: CLIENT_CODE } },
    { requireAuth: false },
  );
  return extractContent(res);
}
