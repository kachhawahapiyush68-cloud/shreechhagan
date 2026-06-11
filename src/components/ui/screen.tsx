import type { PropsWithChildren, ReactNode } from "react";
import type {
  KeyboardShouldPersistTaps,
  StyleProp,
  ViewStyle,
} from "react-native";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { spacing, useTheme } from "@/theme";

type ScreenProps = PropsWithChildren<{
  scrollable?: boolean;
  withHorizontalPadding?: boolean;
  backgroundColor?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
  header?: ReactNode;
  keyboardShouldPersistTaps?: KeyboardShouldPersistTaps;
}>;

export function Screen({
  children,
  scrollable = false,
  withHorizontalPadding = true,
  backgroundColor,
  contentContainerStyle,
  header,
  keyboardShouldPersistTaps = "handled",
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const resolvedBackgroundColor = backgroundColor ?? colors.background;

  const content = (
    <View
      style={[
        styles.content,
        withHorizontalPadding && styles.horizontalPadding,
        { paddingBottom: spacing.xl + insets.bottom },
        contentContainerStyle,
      ]}
    >
      {header}
      {children}
    </View>
  );

  if (scrollable) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: resolvedBackgroundColor }]}
      >
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          contentContainerStyle={styles.scrollContent}
        >
          {content}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: resolvedBackgroundColor }]}
    >
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingTop: spacing.md,
  },
  horizontalPadding: {
    paddingHorizontal: spacing.md,
  },
});
