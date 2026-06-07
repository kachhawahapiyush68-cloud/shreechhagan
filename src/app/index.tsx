import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { colors } from "@/theme";

export default function IndexPage() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);

  if (!hasHydrated) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.light.primary} />
      </View>
    );
  }

  // Already logged in → go straight to home
  if (accessToken) {
    return <Redirect href="/(tabs)/home" />;
  }

  // Not logged in → show splash first
  return <Redirect href="/splash" />;
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    backgroundColor: colors.light.background,
    alignItems: "center",
    justifyContent: "center",
  },
});
