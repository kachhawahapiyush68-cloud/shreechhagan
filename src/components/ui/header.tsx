import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "@/theme";

type HeaderProps = {
  title: string;
  subtitle?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
};

export function Header({ title, subtitle, leftSlot, rightSlot }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.side}>{leftSlot}</View>

      <View style={styles.center}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={2} style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={[styles.side, styles.sideRight]}>{rightSlot}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  side: {
    width: 44,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  sideRight: {
    alignItems: "flex-end",
  },
  center: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.light.text,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 13,
    color: colors.light.textSecondary,
  },
});
