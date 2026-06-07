// src/lib/http.ts
import { getAccessToken } from "@/lib/secure-storage";
import type { ApiEnvelope, MasterAction } from "@/types/api";
import { ENV } from "../../config/env";

type MasterRequest<
  TPayload extends Record<string, unknown> = Record<string, unknown>,
> = {
  Action: MasterAction;
  Payload: TPayload;
};

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status = 500, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function postToPath<
  TResponse,
  TPayload extends Record<string, unknown> = Record<string, unknown>,
>(
  path: string,
  body: MasterRequest<TPayload>,
  requireAuth = false,
): Promise<ApiEnvelope<TResponse>> {
  const token = requireAuth ? await getAccessToken() : null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ENV.REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${ENV.API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const json = (await response.json()) as ApiEnvelope<TResponse>;
    return json;
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new ApiError("Request timeout. Please try again.", 408);
    }
    if (error instanceof ApiError) throw error;
    throw new ApiError(error?.message || "Network request failed", 500);
  } finally {
    clearTimeout(timer);
  }
}

/** POST to /api/master — requires auth */
export async function postMaster<
  TResponse,
  TPayload extends Record<string, unknown> = Record<string, unknown>,
>(body: MasterRequest<TPayload>): Promise<TResponse> {
  const envelope = await postToPath<TResponse, TPayload>(
    ENV.MASTER_API_PATH,
    body,
    true,
  );

  if (envelope.Status !== 200) {
    throw new ApiError(
      envelope.Message || "API request failed",
      envelope.Status,
      envelope.Data,
    );
  }

  return envelope.Data;
}

/** POST to /api/customer — returns full envelope so caller can inspect Status */
export async function postCustomer<
  TResponse,
  TPayload extends Record<string, unknown> = Record<string, unknown>,
>(body: MasterRequest<TPayload>): Promise<ApiEnvelope<TResponse>> {
  return postToPath<TResponse, TPayload>(ENV.CUSTOMER_API_PATH, body, false);
}

/** POST to /api/auth — returns full envelope so caller can inspect Status */
export async function postAuth<
  TResponse,
  TPayload extends Record<string, unknown> = Record<string, unknown>,
>(body: MasterRequest<TPayload>): Promise<ApiEnvelope<TResponse>> {
  return postToPath<TResponse, TPayload>(ENV.AUTH_API_PATH, body, false);
}
