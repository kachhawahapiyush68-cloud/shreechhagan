import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const ANDROID_CHANNEL_ID = "main-alerts";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Wire up received + tapped listeners. Returns an unsubscribe fn. */
export function registerNotificationListeners() {
  const receivedSub = Notifications.addNotificationReceivedListener((n) => {
    if (__DEV__) {
      console.log("NOTIFICATION RECEIVED →", JSON.stringify(n.request.content));
    }
  });

  const responseSub = Notifications.addNotificationResponseReceivedListener(
    (r) => {
      if (__DEV__) {
        console.log(
          "NOTIFICATION TAPPED →",
          JSON.stringify(r.notification.request.content),
        );
      }
      // Optional: navigate based on r.notification.request.content.data
    },
  );

  return () => {
    receivedSub.remove();
    responseSub.remove();
  };
}

/**
 * LOCAL test — proves the app can DISPLAY a notification.
 * Needs NO FCM, NO backend, NO Firebase.
 */
export async function sendLocalTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "ShreeChhagan test 🛵",
      body: "If you see this, notification display is working.",
      sound: true,
      ...(Platform.OS === "android"
        ? { priority: Notifications.AndroidNotificationPriority.HIGH }
        : {}),
    },
    trigger:
      Platform.OS === "android"
        ? {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 1,
            channelId: ANDROID_CHANNEL_ID,
          }
        : null,
  });
}
