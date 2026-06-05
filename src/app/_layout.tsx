import "react-native-gesture-handler";
import "react-native-reanimated";

import { Stack } from "expo-router";

import { AppProviders } from "@/providers/app-providers";

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </AppProviders>
  );
}
