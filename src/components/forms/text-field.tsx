import { forwardRef } from "react";
import type { TextInputProps } from "react-native";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { radius, spacing, useTheme } from "@/theme";

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, error, hint, style, ...props }, ref) => {
    const { colors } = useTheme();

    return (
      <View style={styles.wrapper}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>

        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            {
              borderColor: error ? colors.error : colors.border,
              color: colors.text,
              backgroundColor: colors.surface,
            },
            style,
          ]}
          {...props}
        />

        {error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        ) : null}

        {!error && hint ? (
          <Text style={[styles.hintText, { color: colors.textSecondary }]}>
            {hint}
          </Text>
        ) : null}
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
  },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    fontSize: 16,
  },
  hintText: {
    fontSize: 12,
  },
  errorText: {
    fontSize: 12,
  },
});
