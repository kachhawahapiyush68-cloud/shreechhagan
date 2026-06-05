import type { PropsWithChildren, ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { colors, spacing } from "@/theme";

type ScreenProps = PropsWithChildren<{
  scrollable?: boolean;
  withHorizontalPadding?: boolean;
  backgroundColor?: string;
  contentContainerStyle?: object;
  header?: ReactNode;
}>;

export function Screen({
  children,
  scrollable = false,
  withHorizontalPadding = true,
  backgroundColor = colors.light.background,
  contentContainerStyle,
  header,
}: ScreenProps) {
  const insets = useSafeAreaInsets();

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
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {content}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
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
