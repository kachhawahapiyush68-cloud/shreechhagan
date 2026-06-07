// config/env.ts
const BASE_URL = "https://kotsuperadmin.pankhhms.com";

export const ENV = {
  API_BASE_URL: BASE_URL,
  CUSTOMER_API_PATH: "/api/customer",
  AUTH_API_PATH: "/api/auth",
  MASTER_API_PATH: "/api/master",
  CLIENT_CODE: "KOT000001",
  REQUEST_TIMEOUT_MS: 15000,
} as const;
