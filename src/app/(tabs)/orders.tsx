import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
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

import type { OrderStatus } from "@/features/orders/api/orders.api";
import { useOrderListQuery } from "@/features/orders/hooks/use-orders";
import { radius, shadows, spacing, useTheme } from "@/theme";
import type { OrderListItemDto } from "@/types/api";

const TABS: OrderStatus[] = ["Pending", "Cancelled", "Delivered"];

function formatDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function OrdersTab() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeStatus, setActiveStatus] = useState<OrderStatus>("Pending");

  const ordersQuery = useOrderListQuery({ status: activeStatus });
  const orders = ordersQuery.data ?? [];

  const statusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === "delivered") return colors.success;
    if (s === "cancelled") return colors.error;
    return colors.primary;
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <View style={{ height: insets.top, backgroundColor: colors.primary }} />

      <View style={styles.header}>
        <Text style={[styles.heading, { color: colors.text }]}>My orders</Text>
      </View>

      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        {TABS.map((tab) => {
          const active = tab === activeStatus;
          return (
            <Pressable
              key={tab}
              style={styles.tab}
              onPress={() => setActiveStatus(tab)}
            >
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: active ? colors.primary : colors.textSecondary,
                    fontWeight: active ? "700" : "500",
                  },
                ]}
              >
                {tab}
              </Text>
              {active ? (
                <View
                  style={[
                    styles.tabUnderline,
                    { backgroundColor: colors.primary },
                  ]}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {ordersQuery.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : ordersQuery.error ? (
        <View style={styles.center}>
          <Ionicons name="warning-outline" size={44} color={colors.error} />
          <Text style={[styles.muted, { color: colors.error }]}>
            Failed to load orders.
          </Text>
          <Pressable
            onPress={() => ordersQuery.refetch()}
            style={[styles.retryBtn, { borderColor: colors.primary }]}
          >
            <Text style={[styles.retryText, { color: colors.primary }]}>
              Retry
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.OrderId)}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 90 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={ordersQuery.isRefetching}
              onRefresh={() => ordersQuery.refetch()}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons
                name="receipt-outline"
                size={44}
                color={colors.textMuted}
              />
              <Text style={[styles.muted, { color: colors.textSecondary }]}>
                No {activeStatus.toLowerCase()} orders.
              </Text>
            </View>
          }
          renderItem={({ item }: { item: OrderListItemDto }) => (
            <Pressable
              style={[
                styles.card,
                { backgroundColor: colors.surface, ...shadows.sm },
              ]}
              onPress={() => router.push(`/order/${item.OrderId}` as any)}
            >
              <View style={styles.cardTop}>
                <Text
                  numberOfLines={1}
                  style={[styles.orderNo, { color: colors.text }]}
                >
                  #{item.OrderNo}
                </Text>
                <View
                  style={[
                    styles.statusChip,
                    { backgroundColor: statusColor(item.OrderStatus) + "1A" },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: statusColor(item.OrderStatus) },
                    ]}
                  >
                    {item.OrderStatus}
                  </Text>
                </View>
              </View>

              <Text style={[styles.orderDate, { color: colors.textSecondary }]}>
                {formatDate(item.OrderDate)}
              </Text>

              <View style={styles.cardBottom}>
                <Text style={[styles.orderAmount, { color: colors.primary }]}>
                  ₹{Number(item.TotalAmount).toFixed(2)}
                </Text>
                {item.TotalDiscount > 0 ? (
                  <Text
                    style={[styles.orderDiscount, { color: colors.success }]}
                  >
                    Saved ₹{Number(item.TotalDiscount).toFixed(2)}
                  </Text>
                ) : null}
                {item.PaymentStatus ? (
                  <Text style={[styles.payStatus, { color: colors.textMuted }]}>
                    {item.PaymentStatus}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingVertical: spacing.md, alignItems: "center" },
  heading: { fontSize: 20, fontWeight: "800" },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: spacing.sm },
  tabLabel: { fontSize: 15 },
  tabUnderline: {
    height: 2,
    width: "60%",
    borderRadius: 2,
    marginTop: spacing.xs,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingTop: spacing["4xl"],
  },
  muted: { fontSize: 14, textAlign: "center" },
  listContent: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  card: { borderRadius: radius.xl, padding: spacing.md, gap: 6 },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderNo: {
    fontSize: 15,
    fontWeight: "800",
    flex: 1,
    marginRight: spacing.sm,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  statusText: { fontSize: 12, fontWeight: "700" },
  orderDate: { fontSize: 13 },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: 2,
  },
  orderAmount: { fontSize: 16, fontWeight: "800" },
  orderDiscount: { fontSize: 12, fontWeight: "600" },
  payStatus: { fontSize: 12, marginLeft: "auto" },
  retryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    marginTop: spacing.sm,
  },
  retryText: { fontSize: 14, fontWeight: "700" },
});
