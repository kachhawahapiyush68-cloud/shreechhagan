// src/lib/secure-storage.ts
import * as SecureStore from "expo-secure-store";

const KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
};

export async function setAccessToken(token: string) {
  await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, token);
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
}

export async function removeAccessToken() {
  await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
}

export async function setRefreshToken(token: string) {
  await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, token);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
}

export async function removeRefreshToken() {
  await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
}
