// src/lib/notifications.ts
import * as Notifications from "expo-notifications";

// Foreground display handler. WITHOUT this, a notification that arrives while
// the app is OPEN is received but never shown (no banner/sound).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    // Expo SDK 51+ field names:
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    // If you're on SDK 50 or older, delete the two above and use:
    // shouldShowAlert: true,
  }),
});

/** Wire up received + tapped listeners. Returns an unsubscribe fn. */
export function registerNotificationListeners() {
  const receivedSub = Notifications.addNotificationReceivedListener((n) => {
    if (__DEV__)
      console.log("NOTIFICATION RECEIVED →", JSON.stringify(n.request.content));
  });

  const responseSub = Notifications.addNotificationResponseReceivedListener(
    (r) => {
      if (__DEV__)
        console.log(
          "NOTIFICATION TAPPED →",
          JSON.stringify(r.notification.request.content),
        );
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
 * Needs NO FCM, NO backend, NO Firebase. Works on emulator too.
 */
export async function sendLocalTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "ShreeChhagan test 🛵",
      body: "If you see this, notification display is working.",
      sound: "default",
    },
    trigger: null, // fire immediately
  });
}
