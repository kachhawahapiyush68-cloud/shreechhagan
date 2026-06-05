// src/config/env.ts
const DEV_API_URL = "http://192.168.1.22:5000"; // replace with your server/LAN IP
const PROD_API_URL = "https://api.yourdomain.com"; // future production

export const ENV = {
  API_BASE_URL: __DEV__ ? DEV_API_URL : PROD_API_URL,
  MASTER_API_PATH: "/api/master",
  REQUEST_TIMEOUT_MS: 15000,
};
