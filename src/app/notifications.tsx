import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { isNotificationRead } from "@/features/notifications/api/notifications.api";
import {
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from "@/features/notifications/hooks/use-notifications";
import { radius, shadows, spacing, useTheme } from "@/theme";
import type { NotificationDto } from "@/types/api";

function formatSentAt(value?: string) {
  if (!value) return "";
  const d = new Date(value.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationsRoute() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const { data, isLoading, isRefetching, error, refetch } =
    useNotificationsQuery();
  const markRead = useMarkNotificationReadMutation();

  const notifications = data ?? [];

  const handlePress = (n: NotificationDto) => {
    if (!isNotificationRead(n)) {
      markRead.mutate(n.NotificationId);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <View style={{ height: insets.top, backgroundColor: colors.primary }} />

      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.back}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Notifications
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="warning-outline" size={44} color={colors.error} />
          <Text style={[styles.muted, { color: colors.error }]}>
            Failed to load notifications.
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={[styles.retryBtn, { borderColor: colors.primary }]}
          >
            <Text style={[styles.retryText, { color: colors.primary }]}>
              Retry
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.NotificationId)}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <View
                style={[
                  styles.emptyIcon,
                  { backgroundColor: colors.surface, ...shadows.sm },
                ]}
              >
                <Ionicons
                  name="notifications-off-outline"
                  size={40}
                  color={colors.textMuted}
                />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No notifications yet
              </Text>
              <Text style={[styles.muted, { color: colors.textSecondary }]}>
                Offers and order updates will appear here.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const read = isNotificationRead(item);

            return (
              <Pressable
                onPress={() => handlePress(item)}
                style={[
                  styles.card,
                  {
                    backgroundColor: read
                      ? colors.surface
                      : colors.surfaceSecondary,
                    ...shadows.sm,
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconWrap,
                    { backgroundColor: colors.primary + "18" },
                  ]}
                >
                  <Ionicons
                    name={read ? "notifications-outline" : "notifications"}
                    size={20}
                    color={colors.primary}
                  />
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.cardTopRow}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.cardTitle,
                        {
                          color: colors.text,
                          fontWeight: read ? "600" : "800",
                        },
                      ]}
                    >
                      {item.Title}
                    </Text>
                    {!read ? (
                      <View
                        style={[
                          styles.unreadDot,
                          { backgroundColor: colors.primary },
                        ]}
                      />
                    ) : null}
                  </View>

                  <Text
                    style={[styles.cardText, { color: colors.textSecondary }]}
                  >
                    {item.Body}
                  </Text>

                  <Text style={[styles.cardTime, { color: colors.textMuted }]}>
                    {formatSentAt(item.SentAt)}
                  </Text>
                </View>
              </Pressable>
            );
          }}
        />
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
  },
  back: { padding: 2 },
  headerTitle: { fontSize: 20, fontWeight: "800" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  muted: { fontSize: 14, textAlign: "center" },
  listContent: { paddingHorizontal: spacing.md, paddingTop: spacing.xs },
  card: {
    flexDirection: "row",
    borderRadius: radius.xl,
    padding: spacing.md,
    columnGap: spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1, gap: 4 },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: spacing.sm,
  },
  cardTitle: { fontSize: 15, flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  cardText: { fontSize: 13, lineHeight: 19 },
  cardTime: { fontSize: 11, marginTop: 2 },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  emptyTitle: { fontSize: 18, fontWeight: "800" },
  retryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    marginTop: spacing.sm,
  },
  retryText: { fontSize: 14, fontWeight: "700" },
});
