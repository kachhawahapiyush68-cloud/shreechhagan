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

export async function postMaster<
  TResponse,
  TPayload extends Record<string, unknown> = Record<string, unknown>,
>(body: MasterRequest<TPayload>): Promise<TResponse> {
  const token = await getAccessToken();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ENV.REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${ENV.API_BASE_URL}${ENV.MASTER_API_PATH}`, {
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

    if (!response.ok || json.Status !== 200) {
      throw new ApiError(
        json?.Message || "API request failed",
        json?.Status || response.status,
        json?.Data,
      );
    }

    return json.Data;
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new ApiError("Request timeout. Please try again.", 408);
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error?.message || "Network request failed", 500);
  } finally {
    clearTimeout(timer);
  }
}
