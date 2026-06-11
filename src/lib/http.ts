import { getAccessToken } from "@/lib/secure-storage";
import type { ApiEnvelope, ApiRequestAction } from "@/types/api";
import { ENV } from "../../config/env";

type ApiPayload = Record<string, unknown>;

export type ApiRequest<
  TPayload extends ApiPayload = ApiPayload,
  TAction extends ApiRequestAction = ApiRequestAction,
> = {
  Action: TAction;
  Payload: TPayload;
};

export class ApiError extends Error {
  status: number;
  data?: unknown;
  code?: string;

  constructor(message: string, status = 500, data?: unknown, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.code = code;
  }
}

function getDefaultErrorMessage(status: number) {
  if (status === 400) return "Invalid request. Please check your input.";
  if (status === 401) return "Session expired. Please log in again.";
  if (status === 403) return "You do not have access to this action.";
  if (status === 404) return "Requested resource was not found.";
  if (status === 408) return "Request timeout. Please try again.";
  if (status >= 500) return "Server error. Please try again later.";
  return "Something went wrong. Please try again.";
}

function tryParseJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

async function parseEnvelopeResponse<TResponse>(
  response: Response,
): Promise<ApiEnvelope<TResponse>> {
  const rawText = await response.text();
  const parsed = rawText ? tryParseJson<ApiEnvelope<TResponse>>(rawText) : null;

  if (parsed) {
    return parsed;
  }

  const contentType = response.headers.get("content-type") ?? "";

  throw new ApiError(
    contentType.toLowerCase().includes("text/html")
      ? "Server returned HTML instead of JSON. Please verify the API path."
      : "Unexpected server response format",
    response.status,
    {
      rawText,
      contentType,
      url: response.url,
    },
    "INVALID_RESPONSE_FORMAT",
  );
}

async function requestJson<TResponse>(
  url: string,
  body: unknown,
  options?: {
    requireAuth?: boolean;
    headers?: Record<string, string>;
  },
): Promise<ApiEnvelope<TResponse>> {
  const requireAuth = options?.requireAuth ?? false;
  const token = requireAuth ? await getAccessToken() : null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ENV.REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers ?? {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const envelope = await parseEnvelopeResponse<TResponse>(response);

    if (!response.ok) {
      throw new ApiError(
        envelope.Message || getDefaultErrorMessage(response.status),
        response.status,
        envelope.Data,
      );
    }

    return envelope;
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "AbortError"
    ) {
      throw new ApiError("Request timeout. Please try again.", 408);
    }

    if (error instanceof ApiError) {
      throw error;
    }

    const message =
      error instanceof Error ? error.message : "Network request failed";
    throw new ApiError(message, 500);
  } finally {
    clearTimeout(timer);
  }
}

async function requestGet<TResponse>(
  url: string,
  options?: {
    requireAuth?: boolean;
    headers?: Record<string, string>;
  },
): Promise<ApiEnvelope<TResponse>> {
  const requireAuth = options?.requireAuth ?? false;
  const token = requireAuth ? await getAccessToken() : null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ENV.REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers ?? {}),
      },
      signal: controller.signal,
    });

    const envelope = await parseEnvelopeResponse<TResponse>(response);

    if (!response.ok) {
      throw new ApiError(
        envelope.Message || getDefaultErrorMessage(response.status),
        response.status,
        envelope.Data,
      );
    }

    return envelope;
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "AbortError"
    ) {
      throw new ApiError("Request timeout. Please try again.", 408);
    }

    if (error instanceof ApiError) {
      throw error;
    }

    const message =
      error instanceof Error ? error.message : "Network request failed";
    throw new ApiError(message, 500);
  } finally {
    clearTimeout(timer);
  }
}

async function postToPath<
  TResponse,
  TPayload extends ApiPayload = ApiPayload,
  TAction extends ApiRequestAction = ApiRequestAction,
>(
  path: string,
  body: ApiRequest<TPayload, TAction>,
  options?: {
    requireAuth?: boolean;
  },
): Promise<ApiEnvelope<TResponse>> {
  return requestJson<TResponse>(`${ENV.API_BASE_URL}${path}`, body, options);
}

export async function postApiPath<TResponse, TBody = Record<string, unknown>>(
  path: string,
  body: TBody,
  options?: {
    requireAuth?: boolean;
    headers?: Record<string, string>;
  },
): Promise<ApiEnvelope<TResponse>> {
  return requestJson<TResponse>(`${ENV.API_BASE_URL}${path}`, body, options);
}

export async function getApiPath<TResponse>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  options?: {
    requireAuth?: boolean;
    headers?: Record<string, string>;
  },
): Promise<ApiEnvelope<TResponse>> {
  const search = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      search.append(key, String(value));
    }
  });

  const query = search.toString();
  const url = `${ENV.API_BASE_URL}${path}${query ? `?${query}` : ""}`;

  return requestGet<TResponse>(url, options);
}

export async function postMaster<
  TResponse,
  TPayload extends ApiPayload = ApiPayload,
  TAction extends ApiRequestAction = ApiRequestAction,
>(body: ApiRequest<TPayload, TAction>): Promise<TResponse> {
  const envelope = await postToPath<TResponse, TPayload, TAction>(
    ENV.MASTER_API_PATH,
    body,
    { requireAuth: true },
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

export async function postCustomer<
  TResponse,
  TPayload extends ApiPayload = ApiPayload,
  TAction extends ApiRequestAction = ApiRequestAction,
>(body: ApiRequest<TPayload, TAction>): Promise<ApiEnvelope<TResponse>> {
  return postToPath<TResponse, TPayload, TAction>(ENV.CUSTOMER_API_PATH, body, {
    requireAuth: false,
  });
}

export async function postAuth<
  TResponse,
  TPayload extends ApiPayload = ApiPayload,
  TAction extends ApiRequestAction = ApiRequestAction,
>(body: ApiRequest<TPayload, TAction>): Promise<ApiEnvelope<TResponse>> {
  return postToPath<TResponse, TPayload, TAction>(ENV.AUTH_API_PATH, body, {
    requireAuth: false,
  });
}
