import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { useContentQuery } from "@/features/content/hooks/use-content";
import { radius, spacing, useTheme } from "@/theme";
import type { ContentSlug } from "@/types/api";

const SLUG_TITLES: Record<ContentSlug, string> = {
  privacy: "Privacy Policy",
  help: "Help & Support",
  terms: "Terms & Conditions",
};

export default function ContentRoute() {
  const { slug } = useLocalSearchParams<{ slug: ContentSlug }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const safeSlug: ContentSlug =
    slug === "privacy" || slug === "help" || slug === "terms" ? slug : "help";

  const { data, isLoading, error, refetch } = useContentQuery(safeSlug);

  const title = SLUG_TITLES[safeSlug];

  const injectedHtml = data?.HtmlContent
    ? `
      <html><head><meta name="viewport" content="width=device-width,initial-scale=1">
      <style>
        body {
          font-family: -apple-system, sans-serif;
          font-size: 15px;
          line-height: 1.7;
          color: ${colors.text};
          background: ${colors.background};
          padding: 16px;
          margin: 0;
        }
        h1,h2,h3 { color: ${colors.text}; }
        a { color: ${colors.primary}; }
        p { margin-bottom: 12px; }
      </style></head>
      <body>${data.HtmlContent}</body></html>
    `
    : null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="auto" />
      <View
        style={{ height: insets.top, backgroundColor: colors.background }}
      />

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.back}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text
          style={[styles.headerTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Body */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error || !data ? (
        <View style={styles.center}>
          <Ionicons name="warning-outline" size={44} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Content unavailable
          </Text>
          <Text style={[styles.muted, { color: colors.textSecondary }]}>
            Could not load this page right now.
          </Text>
          {error ? (
            <Pressable
              onPress={() => refetch()}
              style={[styles.retryBtn, { borderColor: colors.primary }]}
            >
              <Text style={[styles.retryText, { color: colors.primary }]}>
                Retry
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : injectedHtml ? (
        <WebView
          source={{ html: injectedHtml }}
          style={[styles.webview, { backgroundColor: colors.background }]}
          scrollEnabled
          showsVerticalScrollIndicator={false}
          originWhitelist={["*"]}
          onShouldStartLoadWithRequest={(req) => {
            // Block navigating away — let system browser handle links
            return req.url === "about:blank" || req.url.startsWith("data:");
          }}
        />
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
        >
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            No content available.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  back: { padding: 2 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    flex: 1,
    textAlign: "center",
  },
  webview: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  emptyTitle: { fontSize: 18, fontWeight: "800" },
  muted: { fontSize: 14, textAlign: "center", color: "#888" },
  bodyText: { fontSize: 15, lineHeight: 24 },
  retryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    marginTop: spacing.sm,
  },
  retryText: { fontSize: 14, fontWeight: "700" },
});
