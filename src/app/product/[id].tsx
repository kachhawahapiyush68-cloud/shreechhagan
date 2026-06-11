import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCartStore } from "@/features/cart/store/cart.store";
import {
  getDefaultPricingOption,
  getPrimaryProductImage,
} from "@/features/home/api/home.api";
import { useProductsQuery } from "@/features/home/hooks/use-home-data";
import { shadows, spacing, useTheme } from "@/theme";

const HERO_HEIGHT = 330;

export default function ProductDetailsRoute() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Number(id);

  const { data, isLoading } = useProductsQuery();
  const addItem = useCartStore((s) => s.addItem);

  const product = useMemo(
    () => (data ?? []).find((item) => item.ProductId === productId),
    [data, productId],
  );

  const options = useMemo(() => {
    const active =
      product?.PricingOptions?.filter((o) => o.IsActive !== false) ?? [];
    if (active.length) return active;
    return product ? [getDefaultPricingOption(product)] : [];
  }, [product]);

  const [selectedPriceId, setSelectedPriceId] = useState<number | null>(null);
  const [fav, setFav] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.text }]}>
          Product not found
        </Text>
      </View>
    );
  }

  const selectedOption =
    options.find((o) => o.ProductPriceId === selectedPriceId) ?? options[0];

  const heroImage = getPrimaryProductImage(product);
  const description =
    product.Description?.trim() ||
    `${product.ProductName} is a freshly prepared item from ${product.CategoryName}.`;

  const sectionLabel = (() => {
    const units = options.map((o) => (o.UnitName ?? "").toLowerCase());
    const looksLikeWeight = units.some(
      (u) => u.includes("kg") || u.includes("gm") || u.includes(" g"),
    );
    return looksLikeWeight ? "Size" : "Quantity";
  })();

  const totalPrice = (selectedOption?.Price ?? product.Price) * qty;

  const handleAdd = () => {
    if (!selectedOption) return;

    for (let i = 0; i < qty; i += 1) {
      addItem({
        productId: product.ProductId,
        productPriceId: selectedOption.ProductPriceId,
        productName: product.ProductName,
        unitName: selectedOption.UnitName,
        price: selectedOption.Price,
        imageUrl: heroImage,
        taxPercent: product.TaxPercent,
      });
    }

    setAdded(true);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <View
        style={{
          height: insets.top,
          backgroundColor: colors.primary,
          zIndex: 3,
        }}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 130 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={
            heroImage
              ? { uri: heroImage }
              : require("../../assets/images/sweet1.png")
          }
          style={styles.hero}
          contentFit="cover"
          transition={200}
        />

        <View style={[styles.body, { backgroundColor: colors.background }]}>
          <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
            <View style={styles.infoTopRow}>
              <View style={[styles.vegBadge, { borderColor: "#1ea44f" }]}>
                <View style={styles.vegDot} />
              </View>

              <View style={styles.actionIcons}>
                <Pressable
                  onPress={() => setFav((f) => !f)}
                  style={[
                    styles.iconCircle,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    },
                  ]}
                >
                  <Ionicons
                    name={fav ? "bookmark" : "bookmark-outline"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </Pressable>

                <Pressable
                  style={[
                    styles.iconCircle,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    },
                  ]}
                >
                  <Ionicons
                    name="share-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>
              {product.ProductName}
            </Text>

            <View style={styles.reorderRow}>
              <View
                style={[
                  styles.reorderTrack,
                  { backgroundColor: colors.border },
                ]}
              >
                <View style={styles.reorderFill} />
              </View>
              <Text
                style={[styles.reorderText, { color: colors.textSecondary }]}
              >
                Highly reordered
              </Text>
            </View>

            <Text
              numberOfLines={expanded ? undefined : 5}
              style={[styles.description, { color: colors.textSecondary }]}
            >
              {description}
            </Text>

            {description.length > 140 ? (
              <Pressable
                onPress={() => setExpanded((e) => !e)}
                hitSlop={8}
                style={styles.readMoreWrap}
              >
                <Text style={[styles.readMore, { color: colors.primary }]}>
                  {expanded ? "Read less" : "Read more"}
                </Text>
              </Pressable>
            ) : null}

            <View
              style={[
                styles.servesChip,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
            >
              <Text
                style={[styles.servesText, { color: colors.textSecondary }]}
              >
                Serves 3
              </Text>
            </View>
          </View>

          <View
            style={[styles.optionsCard, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.optionHeader, { color: colors.text }]}>
              {sectionLabel}
            </Text>
            <Text style={[styles.optionSub, { color: colors.textSecondary }]}>
              Required • Select any 1 option
            </Text>

            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />

            {options.map((opt, index) => {
              const active =
                opt.ProductPriceId === selectedOption?.ProductPriceId;

              return (
                <Pressable
                  key={opt.ProductPriceId}
                  onPress={() => setSelectedPriceId(opt.ProductPriceId)}
                  style={[
                    styles.optionRow,
                    index !== options.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionUnit,
                      {
                        color: colors.text,
                        fontWeight: active ? "800" : "600",
                      },
                    ]}
                  >
                    {opt.UnitName}
                  </Text>

                  <View style={styles.optionRight}>
                    <Text
                      style={[
                        styles.optionPrice,
                        {
                          color: colors.text,
                          fontWeight: active ? "800" : "700",
                        },
                      ]}
                    >
                      ₹{opt.Price.toFixed(2)}
                    </Text>

                    <View
                      style={[
                        styles.radioOuter,
                        { borderColor: active ? "#ef4f5f" : "#e17a86" },
                      ]}
                    >
                      {active ? <View style={styles.radioInner} /> : null}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <Pressable
        onPress={() => router.back()}
        hitSlop={10}
        style={[
          styles.backBtn,
          {
            top: insets.top + spacing.sm,
            left: spacing.md,
            backgroundColor: colors.surface,
            ...shadows.sm,
          },
        ]}
      >
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </Pressable>

      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: Math.max(insets.bottom, spacing.sm),
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.qtyBox,
            { borderColor: "#e17a86", backgroundColor: colors.surface },
          ]}
        >
          <Pressable
            onPress={() => setQty((q) => Math.max(1, q - 1))}
            hitSlop={8}
            style={styles.qtyBtn}
          >
            <Ionicons name="remove" size={22} color="#e17a86" />
          </Pressable>

          <Text style={[styles.qtyText, { color: colors.text }]}>{qty}</Text>

          <Pressable
            onPress={() => setQty((q) => q + 1)}
            hitSlop={8}
            style={styles.qtyBtn}
          >
            <Ionicons name="add" size={22} color="#e17a86" />
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.addCartBtn,
            { backgroundColor: pressed ? "#df4355" : "#ef4f5f" },
          ]}
          onPress={handleAdd}
        >
          <Text style={styles.addCartText}>
            Add item ₹{totalPrice.toFixed(2)}
          </Text>
        </Pressable>
      </View>

      <Modal
        visible={added}
        transparent
        animationType="fade"
        onRequestClose={() => setAdded(false)}
      >
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Ionicons name="checkmark-circle" size={44} color="#1ea44f" />
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Added to cart
            </Text>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              {product.ProductName} • {selectedOption?.UnitName} • Qty {qty}
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={[
                  styles.modalGhostBtn,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
                onPress={() => setAdded(false)}
              >
                <Text style={[styles.modalGhostText, { color: colors.text }]}>
                  Stay here
                </Text>
              </Pressable>

              <Pressable
                style={[styles.modalPrimaryBtn, { backgroundColor: "#ef4f5f" }]}
                onPress={() => {
                  setAdded(false);
                  router.push("/(tabs)/cart");
                }}
              >
                <Text style={styles.modalPrimaryText}>Go to cart</Text>
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
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFound: { fontSize: 18, fontWeight: "700" },

  hero: { width: "100%", height: HERO_HEIGHT },

  body: {
    marginTop: -22,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.md,
    gap: spacing.md,
  },

  infoCard: {
    borderRadius: 22,
    padding: spacing.md,
  },

  infoTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  vegBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  vegDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1ea44f",
  },

  actionIcons: {
    flexDirection: "row",
    gap: spacing.sm,
  },

  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 21,
    fontWeight: "800",
    marginTop: spacing.md,
  },

  reorderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },

  reorderTrack: {
    width: 38,
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    marginRight: 10,
  },

  reorderFill: {
    width: 26,
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#1ea44f",
  },

  reorderText: {
    fontSize: 14,
    fontWeight: "600",
  },

  description: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: spacing.md,
  },

  readMoreWrap: {
    alignSelf: "flex-start",
    marginTop: 6,
  },

  readMore: {
    fontSize: 13,
    fontWeight: "700",
  },

  servesChip: {
    alignSelf: "flex-start",
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 10,
  },

  servesText: {
    fontSize: 14,
    fontWeight: "600",
  },

  optionsCard: {
    borderRadius: 22,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },

  optionHeader: {
    fontSize: 18,
    fontWeight: "800",
  },

  optionSub: {
    fontSize: 14,
    marginTop: 6,
    fontWeight: "500",
  },

  divider: {
    height: 1,
    marginTop: spacing.md,
    marginBottom: 2,
  },

  optionRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  optionUnit: {
    fontSize: 16,
  },

  optionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  optionPrice: {
    fontSize: 16,
  },

  radioOuter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  radioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#ef4f5f",
  },

  backBtn: {
    position: "absolute",
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 4,
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },

  qtyBox: {
    width: 148,
    height: 58,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
  },

  qtyBtn: {
    padding: 2,
  },

  qtyText: {
    fontSize: 18,
    fontWeight: "800",
  },

  addCartBtn: {
    flex: 1,
    height: 58,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  addCartText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },

  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },

  modalCard: {
    width: "100%",
    borderRadius: 22,
    padding: spacing.xl,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: spacing.sm,
  },

  modalText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
  },

  modalActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
    width: "100%",
  },

  modalGhostBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  modalGhostText: {
    fontSize: 14,
    fontWeight: "700",
  },

  modalPrimaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  modalPrimaryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
});
