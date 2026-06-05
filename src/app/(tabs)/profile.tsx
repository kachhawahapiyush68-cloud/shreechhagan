import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/ui/primary-button";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { colors, spacing } from "@/theme";

export default function ProfileRoute() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user?.fullName ?? "Guest"}</Text>

        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>{user?.phone ?? "-"}</Text>

        {user?.email ? (
          <>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user.email}</Text>
          </>
        ) : null}

        <View style={styles.buttonWrap}>
          <PrimaryButton title="Logout" onPress={logout} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.light.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: colors.light.surface,
    padding: spacing["2xl"],
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: spacing.lg,
    color: colors.light.text,
  },
  label: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.light.textSecondary,
  },
  value: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.light.text,
  },
  buttonWrap: {
    marginTop: spacing["2xl"],
  },
});
