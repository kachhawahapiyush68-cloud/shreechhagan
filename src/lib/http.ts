// // src/lib/http.ts
// import { getAccessToken } from "@/lib/secure-storage";
// import type { ApiEnvelope, MasterAction } from "@/types/api";
// import { ENV } from "../../config/env";

// type MasterRequest<
//   TPayload extends Record<string, unknown> = Record<string, unknown>,
// > = {
//   Action: MasterAction;
//   Payload: TPayload;
// };

// export class ApiError extends Error {
//   status: number;
//   data?: unknown;

//   constructor(message: string, status = 500, data?: unknown) {
//     super(message);
//     this.status = status;
//     this.data = data;
//   }
// }

// async function postToPath<
//   TResponse,
//   TPayload extends Record<string, unknown> = Record<string, unknown>,
// >(
//   path: string,
//   body: MasterRequest<TPayload>,
//   requireAuth = false,
// ): Promise<ApiEnvelope<TResponse>> {
//   const token = requireAuth ? await getAccessToken() : null;

//   const controller = new AbortController();
//   const timer = setTimeout(() => controller.abort(), ENV.REQUEST_TIMEOUT_MS);

//   try {
//     const response = await fetch(`${ENV.API_BASE_URL}${path}`, {
//       method: "POST",
//       headers: {
//         Accept: "application/json",
//         "Content-Type": "application/json",
//         ...(token ? { Authorization: `Bearer ${token}` } : {}),
//       },
//       body: JSON.stringify(body),
//       signal: controller.signal,
//     });

//     const json = (await response.json()) as ApiEnvelope<TResponse>;
//     return json;
//   } catch (error: any) {
//     if (error?.name === "AbortError") {
//       throw new ApiError("Request timeout. Please try again.", 408);
//     }
//     if (error instanceof ApiError) throw error;
//     throw new ApiError(error?.message || "Network request failed", 500);
//   } finally {
//     clearTimeout(timer);
//   }
// }

// /** POST to /api/master — requires auth */
// export async function postMaster<
//   TResponse,
//   TPayload extends Record<string, unknown> = Record<string, unknown>,
// >(body: MasterRequest<TPayload>): Promise<TResponse> {
//   const envelope = await postToPath<TResponse, TPayload>(
//     ENV.MASTER_API_PATH,
//     body,
//     true,
//   );

//   if (envelope.Status !== 200) {
//     throw new ApiError(
//       envelope.Message || "API request failed",
//       envelope.Status,
//       envelope.Data,
//     );
//   }

//   return envelope.Data;
// }

// /** POST to /api/customer — returns full envelope so caller can inspect Status */
// export async function postCustomer<
//   TResponse,
//   TPayload extends Record<string, unknown> = Record<string, unknown>,
// >(body: MasterRequest<TPayload>): Promise<ApiEnvelope<TResponse>> {
//   return postToPath<TResponse, TPayload>(ENV.CUSTOMER_API_PATH, body, false);
// }

// /** POST to /api/auth — returns full envelope so caller can inspect Status */
// export async function postAuth<
//   TResponse,
//   TPayload extends Record<string, unknown> = Record<string, unknown>,
// >(body: MasterRequest<TPayload>): Promise<ApiEnvelope<TResponse>> {
//   return postToPath<TResponse, TPayload>(ENV.AUTH_API_PATH, body, false);
// }
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

async function parseResponseSafely<TResponse>(
  response: Response,
): Promise<ApiEnvelope<TResponse>> {
  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.toLowerCase().includes("application/json");
  const rawText = await response.text();

  if (!rawText) {
    throw new ApiError("Empty response received from server", response.status);
  }

  if (!isJson) {
    throw new ApiError(
      "Unexpected server response format",
      response.status,
      rawText,
      "INVALID_CONTENT_TYPE",
    );
  }

  try {
    return JSON.parse(rawText) as ApiEnvelope<TResponse>;
  } catch {
    throw new ApiError(
      "Failed to parse server response",
      response.status,
      rawText,
      "INVALID_JSON",
    );
  }
}

function getDefaultErrorMessage(status: number) {
  if (status === 401) return "Session expired. Please log in again.";
  if (status === 403) return "You do not have access to this action.";
  if (status === 404) return "Requested resource was not found.";
  if (status === 408) return "Request timeout. Please try again.";
  if (status >= 500) return "Server error. Please try again later.";
  return "Something went wrong. Please try again.";
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
  const requireAuth = options?.requireAuth ?? false;
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

    const envelope = await parseResponseSafely<TResponse>(response);

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
