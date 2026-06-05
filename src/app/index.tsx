import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { colors } from "@/theme";

export default function IndexPage() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isOnboardingCompleted = useAuthStore((s) => s.isOnboardingCompleted);
  const accessToken = useAuthStore((s) => s.accessToken);

  if (!hasHydrated) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.light.primary} />
      </View>
    );
  }

  if (!isOnboardingCompleted) {
    return <Redirect href="/(onboarding)" />;
  }

  if (!accessToken) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)/home" />;
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    backgroundColor: colors.light.background,
    alignItems: "center",
    justifyContent: "center",
  },
});
