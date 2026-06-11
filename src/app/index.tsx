import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { getAccessToken } from "@/lib/secure-storage";
import { colors } from "@/theme";

export default function IndexPage() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [tokenChecked, setTokenChecked] = useState(false);
  const [hasSecureToken, setHasSecureToken] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkToken() {
      try {
        const token = await getAccessToken();
        if (mounted) {
          setHasSecureToken(!!token);
        }
      } catch {
        if (mounted) {
          setHasSecureToken(false);
        }
      } finally {
        if (mounted) {
          setTokenChecked(true);
        }
      }
    }

    void checkToken();

    return () => {
      mounted = false;
    };
  }, []);

  if (!hasHydrated || !tokenChecked) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.light.primary} />
      </View>
    );
  }

  if (isAuthenticated || hasSecureToken) {
    return <Redirect href="/(tabs)/home" />;
  }

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
