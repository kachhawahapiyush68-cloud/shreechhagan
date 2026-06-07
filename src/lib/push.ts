// // src/lib/push.ts
// import * as Notifications from "expo-notifications";
// import * as Device from "expo-device";
// import { Platform } from "react-native";

// let cachedToken: string | null = null;

// /**
//  * Returns the native FCM registration token on Android
//  * (the value your backend expects in `fcm_token`).
//  * Returns null on emulators without Play Services or if permission is denied.
//  */
// export async function getFcmToken(): Promise<string | null> {
//   if (cachedToken) return cachedToken;
//   if (!Device.isDevice) return null;

//   if (Platform.OS === "android") {
//     await Notifications.setNotificationChannelAsync("default", {
//       name: "Default",
//       importance: Notifications.AndroidImportance.DEFAULT,
//     });
//   }

//   const existing = await Notifications.getPermissionsAsync();
//   let status = existing.status;
//   if (status !== "granted") {
//     status = (await Notifications.requestPermissionsAsync()).status;
//   }
//   if (status !== "granted") return null;

//   try {
//     const { data } = await Notifications.getDevicePushTokenAsync();
//     cachedToken = data as string;
//     return cachedToken;
//   } catch {
//     return null;
//   }
// }
// src/lib/push.ts
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

let cachedToken: string | null = null;

/** Permission + Android channel. Safe to call on every launch. */
export async function configurePushNotifications(): Promise<boolean> {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX, // heads-up banners
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FC8019",
        sound: "default",
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== "granted") {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    return status === "granted";
  } catch (err) {
    if (__DEV__) console.warn("[push] configure failed:", err);
    return false;
  }
}

/**
 * Native FCM token (Android) / APNs token (iOS).
 * Returns null on emulators, denied permission, or when Firebase isn't wired up.
 */
export async function getFcmToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  if (!Device.isDevice) return null; // emulator can't get a real token

  try {
    const granted = await configurePushNotifications();
    if (!granted) return null;

    const { data } = await Notifications.getDevicePushTokenAsync();
    cachedToken = typeof data === "string" ? data : String(data);
    if (__DEV__) console.log("[push] FCM token →", cachedToken);
    return cachedToken;
  } catch (err) {
    if (__DEV__) console.warn("[push] getFcmToken failed:", err);
    return null;
  }
}
