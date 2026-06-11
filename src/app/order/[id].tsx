import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { getPrimaryProductImage } from "@/features/home/api/home.api";
import { useProductsQuery } from "@/features/home/hooks/use-home-data";
import {
  useCancelOrderMutation,
  useOrderDetailQuery,
} from "@/features/orders/hooks/use-orders";
import { radius, shadows, spacing, useTheme } from "@/theme";
import type { ProductDto } from "@/types/api";

export default function OrderDetailRoute() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Number(id);

  const customerId = Number(useAuthStore((s) => s.user?.id) ?? 0);

  const { data, isLoading, error, refetch } = useOrderDetailQuery(orderId);
  const cancelOrder = useCancelOrderMutation();

  // Catalogue is used to fill the product name/image the order API leaves null.
  const { data: products = [] } = useProductsQuery();

  const { byPriceId, byProductId } = useMemo(() => {
    const priceMap = new Map<number, ProductDto>();
    const productMap = new Map<number, ProductDto>();
    for (const p of products) {
      productMap.set(p.ProductId, p);
      for (const opt of p.PricingOptions ?? []) {
        priceMap.set(opt.ProductPriceId, p);
      }
    }
    return { byPriceId: priceMap, byProductId: productMap };
  }, [products]);

  // ItemId is the ProductPriceId; fall back to matching a ProductId.
  const resolveProduct = (itemId: number) =>
    byPriceId.get(itemId) ?? byProductId.get(itemId);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [remark, setRemark] = useState("");

  const order = data?.Order;
  const items = data?.Items ?? [];
  const status = (order?.OrderStatus ?? "").toLowerCase();
  const canCancel = !!order && status !== "delivered" && status !== "cancelled";

  const submitCancel = async () => {
    const reason = remark.trim();
    if (!reason) {
      Alert.alert("Reason needed", "Please tell us why you're cancelling.");
      return;
    }
    try {
      const ok = await cancelOrder.mutateAsync({ orderId, remark: reason });
      setCancelOpen(false);
      if (ok) {
        await refetch();
        Alert.alert("Order cancelled", "Your order has been cancelled.");
      } else {
        Alert.alert("Could not cancel", "Please try again later.");
      }
    } catch {
      setCancelOpen(false);
      Alert.alert("Could not cancel", "Something went wrong.");
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
          Order details
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error || !order ? (
        <View style={styles.center}>
          <Ionicons name="warning-outline" size={44} color={colors.error} />
          <Text style={[styles.muted, { color: colors.error }]}>
            {customerId === 0
              ? "Please log in to view your order."
              : "Couldn't load this order."}
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
        <>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.card,
                { backgroundColor: colors.surface, ...shadows.sm },
              ]}
            >
              <View style={styles.cardTop}>
                <Text style={[styles.orderNo, { color: colors.text }]}>
                  #{order.OrderNo}
                </Text>
                <Text style={[styles.status, { color: colors.primary }]}>
                  {order.OrderStatus}
                </Text>
              </View>
              <Text style={[styles.total, { color: colors.text }]}>
                ₹{Number(order.TotalAmount).toFixed(2)}
              </Text>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Items
            </Text>
            {items.map((it) => {
              const product = resolveProduct(it.ItemId);
              const name =
                it.ProductName?.trim() ||
                product?.ProductName ||
                `Item #${it.ItemId}`;
              const image = product ? getPrimaryProductImage(product) : null;

              return (
                <View
                  key={String(it.Id)}
                  style={[styles.itemRow, { borderColor: colors.border }]}
                >
                  <Image
                    source={
                      image
                        ? { uri: image }
                        : require("../../assets/images/sweet1.png")
                    }
                    style={[
                      styles.itemImage,
                      { backgroundColor: colors.surfaceSecondary },
                    ]}
                    contentFit="cover"
                    transition={200}
                  />

                  <View style={styles.itemInfo}>
                    <Text
                      numberOfLines={1}
                      style={[styles.itemName, { color: colors.text }]}
                    >
                      {name}
                    </Text>
                    {it.Remark ? (
                      <Text
                        numberOfLines={1}
                        style={[styles.itemRemark, { color: colors.textMuted }]}
                      >
                        {it.Remark}
                      </Text>
                    ) : null}
                    <Text
                      style={[styles.itemQty, { color: colors.textSecondary }]}
                    >
                      Qty {it.Qty} × ₹{Number(it.Rate).toFixed(2)}
                    </Text>
                  </View>

                  <Text style={[styles.itemPrice, { color: colors.text }]}>
                    ₹{(it.Rate * it.Qty).toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          {canCancel ? (
            <View
              style={[
                styles.bottomBar,
                {
                  paddingBottom: insets.bottom + spacing.sm,
                  backgroundColor: colors.background,
                },
              ]}
            >
              <Pressable
                style={[styles.cancelBtn, { borderColor: colors.error }]}
                onPress={() => {
                  setRemark("");
                  setCancelOpen(true);
                }}
              >
                <Text style={[styles.cancelText, { color: colors.error }]}>
                  Cancel order
                </Text>
              </Pressable>
            </View>
          ) : null}
        </>
      )}

      <Modal
        visible={cancelOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelOpen(false)}
      >
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Cancel order?
            </Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Tell us the reason for cancelling.
            </Text>
            <TextInput
              value={remark}
              onChangeText={setRemark}
              placeholder="Reason"
              placeholderTextColor={colors.textMuted}
              multiline
              style={[
                styles.modalInput,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalGhost, { borderColor: colors.border }]}
                onPress={() => setCancelOpen(false)}
                disabled={cancelOrder.isPending}
              >
                <Text style={[styles.modalGhostText, { color: colors.text }]}>
                  Keep order
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modalDanger, { backgroundColor: colors.error }]}
                onPress={submitCancel}
                disabled={cancelOrder.isPending}
              >
                {cancelOrder.isPending ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text
                    style={[styles.modalDangerText, { color: colors.white }]}
                  >
                    Confirm cancel
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: spacing.xl,
  },
  muted: { fontSize: 14, textAlign: "center" },
  content: { paddingHorizontal: spacing.md, paddingBottom: 120 },
  card: {
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: 8,
    marginBottom: spacing.lg,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderNo: { fontSize: 16, fontWeight: "800" },
  status: { fontSize: 14, fontWeight: "700" },
  total: { fontSize: 22, fontWeight: "800" },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: spacing.sm },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  itemImage: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
  },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { fontSize: 14, fontWeight: "700" },
  itemRemark: { fontSize: 12 },
  itemQty: { fontSize: 12 },
  itemPrice: {
    fontSize: 14,
    fontWeight: "800",
    minWidth: 72,
    textAlign: "right",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  cancelBtn: {
    height: 52,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { fontSize: 16, fontWeight: "700" },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  modalCard: { width: "100%", borderRadius: radius.xl, padding: spacing.lg },
  modalTitle: { fontSize: 18, fontWeight: "800" },
  modalSub: { fontSize: 14, marginTop: 4 },
  modalInput: {
    minHeight: 70,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    fontSize: 15,
    textAlignVertical: "top",
    marginTop: spacing.md,
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  modalGhost: {
    flex: 1,
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalGhostText: { fontSize: 14, fontWeight: "700" },
  modalDanger: {
    flex: 1,
    height: 48,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  modalDangerText: { fontSize: 14, fontWeight: "700" },
  retryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    marginTop: spacing.sm,
  },
  retryText: { fontSize: 14, fontWeight: "700" },
});
