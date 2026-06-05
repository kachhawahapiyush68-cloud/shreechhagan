import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, radius, spacing } from "@/theme";

type PrimaryButtonProps = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={colors.light.white} />
        ) : (
          <>
            {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
            <Text style={styles.title}>{title}</Text>
            {rightIcon ? (
              <View style={styles.iconRight}>{rightIcon}</View>
            ) : null}
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  buttonPressed: {
    backgroundColor: colors.light.primaryPressed,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: spacing.sm,
  },
  title: {
    color: colors.light.white,
    fontSize: 16,
    fontWeight: "700",
  },
  iconLeft: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconRight: {
    justifyContent: "center",
    alignItems: "center",
  },
});
