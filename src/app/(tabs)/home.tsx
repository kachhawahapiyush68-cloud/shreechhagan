// app/(tabs)/home.tsx
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useCartStore } from "@/features/cart/store/cart.store";
import { useHomeData } from "@/features/home/hooks/use-home-data";
import { colors, radius, spacing } from "@/theme";

const fallbackImage =
  "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1200&auto=format&fit=crop";

export default function HomeRoute() {
  const {
    categories,
    featuredProducts,
    isLoading,
    error,
    refetch,
    isRefreshing,
  } = useHomeData();
  const addItem = useCartStore((s) => s.addItem);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  const filteredProducts = useMemo(() => {
    if (!selectedCategoryId) return featuredProducts;
    return featuredProducts.filter(
      (item) => item.CategoryId === selectedCategoryId,
    );
  }, [featuredProducts, selectedCategoryId]);

  if (isLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={colors.light.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.errorTitle}>Unable to load products</Text>
        <Text style={styles.errorSubtitle}>
          Please check API base URL, device network, and backend status.
        </Text>
        <Pressable onPress={() => refetch()} style={styles.retryBtn}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={refetch} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Bakery Store</Text>
          <Text style={styles.address}>
            Fresh cakes, donuts, cookies and breads
          </Text>
        </View>
      </View>

      <FlatList
        horizontal
        data={[{ CategoryId: 0, CategoryName: "All" }, ...categories]}
        keyExtractor={(item) => String(item.CategoryId)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => {
          const active =
            item.CategoryId === 0
              ? selectedCategoryId === null
              : selectedCategoryId === item.CategoryId;

          return (
            <Pressable
              onPress={() =>
                setSelectedCategoryId(
                  item.CategoryId === 0 ? null : item.CategoryId,
                )
              }
              style={[styles.categoryChip, active && styles.categoryChipActive]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  active && styles.categoryChipTextActive,
                ]}
              >
                {item.CategoryName}
              </Text>
            </Pressable>
          );
        }}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular products</Text>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => String(item.ProductId)}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productsGrid}
        renderItem={({ item }) => (
          <Pressable
            style={styles.productCard}
            onPress={() =>
              router.push({
                pathname: "/product/[id]",
                params: { id: String(item.ProductId) },
              })
            }
          >
            <Image
              source={{ uri: item.ImageUrl || fallbackImage }}
              style={styles.productImage}
            />
            <View style={styles.productBody}>
              <Text numberOfLines={1} style={styles.productName}>
                {item.ProductName}
              </Text>
              <Text style={styles.productMeta}>{item.CategoryName}</Text>
              <Text style={styles.productPrice}>₹{item.Price}</Text>

              <Pressable
                style={styles.addBtn}
                onPress={() =>
                  addItem({
                    productId: item.ProductId,
                    name: item.ProductName,
                    price: item.Price,
                    imageUrl: item.ImageUrl || null,
                  })
                }
              >
                <Text style={styles.addBtnText}>Add to cart</Text>
              </Pressable>
            </View>
          </Pressable>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.light.background },
  content: {
    padding: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing["3xl"],
  },
  header: { marginBottom: spacing.md },
  hello: { fontSize: 24, fontWeight: "800", color: colors.light.text },
  address: { marginTop: 4, fontSize: 13, color: colors.light.textSecondary },
  categoryList: { paddingVertical: spacing.sm, gap: spacing.sm },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.light.surface,
  },
  categoryChipActive: {
    backgroundColor: colors.light.primary,
  },
  categoryChipText: {
    color: colors.light.text,
    fontWeight: "600",
  },
  categoryChipTextActive: {
    color: colors.light.white,
  },
  sectionHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.light.text,
  },
  productsGrid: { gap: spacing.md },
  productRow: { gap: spacing.md },
  productCard: {
    flex: 1,
    backgroundColor: colors.light.surface,
    borderRadius: radius.xl,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: 140,
    backgroundColor: "#eee",
  },
  productBody: {
    padding: spacing.md,
  },
  productName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.light.text,
  },
  productMeta: {
    marginTop: 4,
    fontSize: 12,
    color: colors.light.textSecondary,
  },
  productPrice: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "800",
    color: colors.light.primary,
  },
  addBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.light.primary,
    borderRadius: radius.lg,
    paddingVertical: 10,
    alignItems: "center",
  },
  addBtnText: {
    color: colors.light.white,
    fontWeight: "700",
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.light.background,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.light.text,
  },
  errorSubtitle: {
    marginTop: 8,
    textAlign: "center",
    color: colors.light.textSecondary,
  },
  retryBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.light.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  retryBtnText: {
    color: colors.light.white,
    fontWeight: "700",
  },
});
