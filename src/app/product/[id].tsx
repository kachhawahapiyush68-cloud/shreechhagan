// app/product/[id].tsx
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useCartStore } from "@/features/cart/store/cart.store";
import { useProductsQuery } from "@/features/home/hooks/use-home-data";
import { colors, radius, spacing } from "@/theme";

const fallbackImage =
  "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1200&auto=format&fit=crop";

export default function ProductDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Number(id);

  const { data, isLoading } = useProductsQuery();
  const addItem = useCartStore((s) => s.addItem);

  const product = useMemo(
    () => (data ?? []).find((item) => item.ProductId === productId),
    [data, productId],
  );

  if (isLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={colors.light.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.notFound}>Product not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={{ uri: product.ImageUrl || fallbackImage }}
          style={styles.heroImage}
        />

        <View style={styles.body}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Back</Text>
          </Pressable>

          <Text style={styles.title}>{product.ProductName}</Text>
          <Text style={styles.meta}>{product.CategoryName}</Text>
          <Text style={styles.price}>₹{product.Price}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {product.Description?.trim() ||
                `${product.ProductName} is a freshly prepared bakery item from ${product.CategoryName}. This is dummy detail text until backend product description is finalized.`}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tax</Text>
            <Text style={styles.description}>{product.TaxPercent}% GST</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          style={styles.cartBtn}
          onPress={() =>
            addItem({
              productId: product.ProductId,
              name: product.ProductName,
              price: product.Price,
              imageUrl: product.ImageUrl || null,
            })
          }
        >
          <Text style={styles.cartBtnText}>Add to cart</Text>
        </Pressable>

        <Pressable
          style={styles.buyBtn}
          onPress={() =>
            addItem({
              productId: product.ProductId,
              name: product.ProductName,
              price: product.Price,
              imageUrl: product.ImageUrl || null,
            })
          }
        >
          <Text style={styles.buyBtnText}>Buy now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.light.background },
  content: { paddingBottom: 120 },
  heroImage: { width: "100%", height: 320, backgroundColor: "#eee" },
  body: { padding: spacing.lg },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.light.surface,
    borderRadius: radius.lg,
  },
  backBtnText: { fontWeight: "700", color: colors.light.text },
  title: { fontSize: 26, fontWeight: "800", color: colors.light.text },
  meta: { marginTop: 6, fontSize: 14, color: colors.light.textSecondary },
  price: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: "800",
    color: colors.light.primary,
  },
  section: { marginTop: spacing.xl },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.light.text },
  description: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 22,
    color: colors.light.textSecondary,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.light.background,
  },
  cartBtn: {
    flex: 1,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: colors.light.surface,
  },
  buyBtn: {
    flex: 1,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: colors.light.primary,
  },
  cartBtnText: { color: colors.light.text, fontWeight: "700" },
  buyBtnText: { color: colors.light.white, fontWeight: "700" },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFound: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.light.text,
  },
});
