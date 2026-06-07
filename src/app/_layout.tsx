import "@/lib/notifications"; // registers the foreground notification handler
import "react-native-gesture-handler";
import "react-native-reanimated";

import { Stack } from "expo-router";
import { useEffect } from "react";

import { registerNotificationListeners } from "@/lib/notifications";
import { configurePushNotifications } from "@/lib/push";
import { AppProviders } from "@/providers/app-providers";

export default function RootLayout() {
  useEffect(() => {
    configurePushNotifications(); // permission + channel
    const unsubscribe = registerNotificationListeners(); // received + tapped
    return unsubscribe;
  }, []);

  return (
    <AppProviders>
      <Stack
        initialRouteName="index"
        screenOptions={{ headerShown: false, animation: "fade" }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="splash" options={{ animation: "none" }} />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen
          name="(auth)"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </AppProviders>
  );
}
