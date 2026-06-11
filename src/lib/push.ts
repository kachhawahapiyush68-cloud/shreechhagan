import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const ANDROID_CHANNEL_ID = "main-alerts";

let cachedToken: string | null = null;

/** Permission + Android channel. Safe to call on every launch. */
export async function configurePushNotifications(): Promise<boolean> {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
        name: "Main Alerts",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FC8019",
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: false,
        enableVibrate: true,
        showBadge: true,
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
  if (!Device.isDevice) return null;

  try {
    const granted = await configurePushNotifications();
    if (!granted) return null;

    const { data } = await Notifications.getDevicePushTokenAsync();
    cachedToken = typeof data === "string" ? data : String(data);

    if (__DEV__) console.log("[push] native push token →", cachedToken);

    return cachedToken;
  } catch (err) {
    if (__DEV__) console.warn("[push] getFcmToken failed:", err);
    return null;
  }
}

export { ANDROID_CHANNEL_ID };
