import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useProductsQuery } from "@/features/home/hooks/use-home-data";
import { radius, shadows, spacing, useTheme } from "@/theme";
import type { ProductDto } from "@/types/api";

const { width: SCREEN_W } = Dimensions.get("window");
const H_PAD = spacing.md;
const GAP = spacing.sm;
const CARD_W = (SCREEN_W - H_PAD * 2 - GAP) / 2;

export default function CategoryListingRoute() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const categoryId = Number(id);

  const { data, isLoading, error, refetch } = useProductsQuery();

  const products = useMemo(
    () => (data ?? []).filter((p) => p.IsActive && p.CategoryId === categoryId),
    [data, categoryId],
  );

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
        <Text
          numberOfLines={1}
          style={[styles.headerTitle, { color: colors.text }]}
        >
          {name ?? "Products"}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="warning-outline" size={44} color={colors.error} />
          <Text style={[styles.muted, { color: colors.error }]}>
            Failed to load products.
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
          data={products}
          numColumns={2}
          keyExtractor={(item) => String(item.ProductId)}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons
                name="basket-outline"
                size={44}
                color={colors.textMuted}
              />
              <Text style={[styles.muted, { color: colors.textSecondary }]}>
                No products in this category.
              </Text>
            </View>
          }
          renderItem={({ item }: { item: ProductDto }) => {
            const rating = (item as any).Rating ?? (item as any).AvgRating;
            const reviews =
              (item as any).ReviewCount ?? (item as any).TotalReviews;
            return (
              <Pressable
                style={[
                  styles.card,
                  { backgroundColor: colors.surface, ...shadows.sm },
                ]}
                onPress={() => router.push(`/product/${item.ProductId}` as any)}
              >
                <Image
                  source={
                    item.ImageUrl
                      ? { uri: item.ImageUrl }
                      : require("../../assets/images/logo.png")
                  }
                  style={styles.cardImage}
                  contentFit="cover"
                  transition={200}
                />
                <View style={styles.cardInfo}>
                  <Text
                    numberOfLines={1}
                    style={[styles.cardName, { color: colors.text }]}
                  >
                    {item.ProductName}
                  </Text>
                  {rating != null ? (
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={13} color={colors.warning} />
                      <Text
                        style={[
                          styles.ratingText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {rating}
                        {reviews != null ? ` | ${reviews} review` : ""}
                      </Text>
                    </View>
                  ) : null}
                  <Text style={[styles.cardPrice, { color: colors.primary }]}>
                    ₹{item.Price.toFixed(2)}
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
    columnGap: spacing.sm,
    paddingHorizontal: H_PAD,
    paddingVertical: spacing.md,
  },
  back: { padding: 2 },
  headerTitle: { fontSize: 20, fontWeight: "800", flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingTop: spacing["4xl"],
  },
  muted: { fontSize: 14, textAlign: "center" },
  listContent: { paddingHorizontal: H_PAD, paddingBottom: spacing["4xl"] },
  row: { gap: GAP, marginBottom: GAP },
  card: { width: CARD_W, borderRadius: radius.xl, overflow: "hidden" },
  cardImage: { width: "100%", height: 130 },
  cardInfo: { padding: spacing.sm, gap: 4 },
  cardName: { fontSize: 14, fontWeight: "700" },
  ratingRow: { flexDirection: "row", alignItems: "center", columnGap: 4 },
  ratingText: { fontSize: 12 },
  cardPrice: { fontSize: 15, fontWeight: "800" },
  retryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    marginTop: spacing.sm,
  },
  retryText: { fontSize: 14, fontWeight: "700" },
});
