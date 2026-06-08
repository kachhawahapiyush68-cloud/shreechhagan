import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
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

const TABS: OrderStatus[] = ["Pending", "Cancelled", "Delivered"];

export default function OrdersTab() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeStatus, setActiveStatus] = useState<OrderStatus>("Pending");

  const ordersQuery = useOrderListQuery({ status: activeStatus });
  const orders = ordersQuery.data ?? [];

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
          keyExtractor={(item, i) =>
            String((item as any).OrderId ?? (item as any).Id ?? i)
          }
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
          renderItem={({ item }) => {
            // Defensive field reads — see note below; replace with real DTO fields.
            const o = item as any;
            const id = o.OrderId ?? o.Id ?? o.OrderNumber;
            const displayId = o.OrderNumber ?? o.OrderId ?? o.Id ?? "";
            const date = o.OrderDate ?? o.CreatedAt ?? o.Date ?? "";
            const name =
              o.ProductName ??
              o.Items?.[0]?.ProductName ??
              o.Items?.[0]?.Name ??
              "Order items";
            const price =
              o.TotalAmount ?? o.Total ?? o.Amount ?? o.GrandTotal ?? 0;
            const image = o.ImageUrl ?? o.Items?.[0]?.ImageUrl;

            return (
              <Pressable
                style={[
                  styles.card,
                  { backgroundColor: colors.surface, ...shadows.sm },
                ]}
                onPress={() => router.push(`/order/${id}` as any)}
              >
                <Image
                  source={
                    image
                      ? { uri: image }
                      : require("../../assets/images/logo.png")
                  }
                  style={styles.cardImage}
                  contentFit="cover"
                  transition={200}
                />
                <View style={styles.cardInfo}>
                  <Text
                    numberOfLines={1}
                    style={[styles.orderId, { color: colors.text }]}
                  >
                    Order ID : #{displayId}
                    {date ? `  |  ${date}` : ""}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.orderName, { color: colors.textSecondary }]}
                  >
                    {name}
                  </Text>
                  <Text style={[styles.orderPrice, { color: colors.primary }]}>
                    ₹{Number(price).toFixed(2)}
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
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.xl,
    padding: spacing.sm,
    columnGap: spacing.sm,
  },
  cardImage: { width: 72, height: 72, borderRadius: radius.lg },
  cardInfo: { flex: 1, gap: 4 },
  orderId: { fontSize: 14, fontWeight: "700" },
  orderName: { fontSize: 13 },
  orderPrice: { fontSize: 15, fontWeight: "800" },
  retryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    marginTop: spacing.sm,
  },
  retryText: { fontSize: 14, fontWeight: "700" },
});
