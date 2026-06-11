import "@/lib/notifications";
import "react-native-gesture-handler";
import "react-native-reanimated";

import { Stack } from "expo-router";
import { useEffect } from "react";

import { registerNotificationListeners } from "@/lib/notifications";
import { configurePushNotifications } from "@/lib/push";
import { AppProviders } from "@/providers/app-providers";

export default function RootLayout() {
  useEffect(() => {
    void configurePushNotifications();
    const unsubscribe = registerNotificationListeners();
    return unsubscribe;
  }, []);

  return (
    <AppProviders>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="splash" options={{ animation: "none" }} />
        <Stack.Screen
          name="(auth)"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen name="(tabs)" />

        {/* ── Detail / flow screens ── */}
        <Stack.Screen
          name="product/[id]"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="category/[id]"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="checkout"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="order/[id]"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="favourites"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="notifications"
          options={{ animation: "slide_from_right" }}
        />

        {/* ── Content pages: Privacy / Help / Terms ── */}
        <Stack.Screen
          name="content/[slug]"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />

        <Stack.Screen name="+not-found" />
      </Stack>
    </AppProviders>
  );
}
