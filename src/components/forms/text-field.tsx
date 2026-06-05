import { forwardRef } from "react";
import type { TextInputProps } from "react-native";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radius, spacing } from "@/theme";

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, error, hint, style, ...props }, ref) => {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.label}>{label}</Text>

        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={colors.light.textMuted}
          style={[styles.input, error ? styles.inputError : null, style]}
          {...props}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {!error && hint ? <Text style={styles.hintText}>{hint}</Text> : null}
      </View>
    );
  },
);

TextField.displayName = "TextField";

const styles = StyleSheet.create({
  wrapper: {
    rowGap: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.light.text,
  },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    color: colors.light.text,
    backgroundColor: colors.light.surface,
    fontSize: 16,
  },
  inputError: {
    borderColor: colors.light.error,
  },
  hintText: {
    fontSize: 12,
    color: colors.light.textSecondary,
  },
  errorText: {
    fontSize: 12,
    color: colors.light.error,
  },
});
