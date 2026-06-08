// // src/lib/secure-storage.ts
// import * as SecureStore from "expo-secure-store";

// const KEYS = {
//   ACCESS_TOKEN: "access_token",
//   REFRESH_TOKEN: "refresh_token",
// };

// export async function setAccessToken(token: string) {
//   await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, token);
// }

// export async function getAccessToken() {
//   return SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
// }

// export async function removeAccessToken() {
//   await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
// }

// export async function setRefreshToken(token: string) {
//   await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, token);
// }

// export async function getRefreshToken() {
//   return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
// }

// export async function removeRefreshToken() {
//   await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
// }
import * as SecureStore from "expo-secure-store";

const KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
} as const;

const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainService: "shreechhagan.auth",
};

async function isSecureStoreAvailable() {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

async function setSecureItem(key: string, value: string) {
  const available = await isSecureStoreAvailable();
  if (!available) return;
  await SecureStore.setItemAsync(key, value, SECURE_STORE_OPTIONS);
}

async function getSecureItem(key: string) {
  const available = await isSecureStoreAvailable();
  if (!available) return null;
  return SecureStore.getItemAsync(key, SECURE_STORE_OPTIONS);
}

async function removeSecureItem(key: string) {
  const available = await isSecureStoreAvailable();
  if (!available) return;
  await SecureStore.deleteItemAsync(key, SECURE_STORE_OPTIONS);
}

export async function setAccessToken(token: string) {
  await setSecureItem(KEYS.ACCESS_TOKEN, token);
}

export async function getAccessToken() {
  return getSecureItem(KEYS.ACCESS_TOKEN);
}

export async function removeAccessToken() {
  await removeSecureItem(KEYS.ACCESS_TOKEN);
}

export async function setRefreshToken(token: string) {
  await setSecureItem(KEYS.REFRESH_TOKEN, token);
}

export async function getRefreshToken() {
  return getSecureItem(KEYS.REFRESH_TOKEN);
}

export async function removeRefreshToken() {
  await removeSecureItem(KEYS.REFRESH_TOKEN);
}

export async function clearAuthTokens() {
  await Promise.all([removeAccessToken(), removeRefreshToken()]);
}
