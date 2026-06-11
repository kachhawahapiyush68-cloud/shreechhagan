import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  getDisplayPrice,
  getPrimaryProductImage,
} from "@/features/home/api/home.api";
import {
  useCategoriesQuery,
  useProductsQuery,
} from "@/features/home/hooks/use-home-data";
import { radius, shadows, spacing, useTheme } from "@/theme";
import type { CategoryDto } from "@/types/api";

const { width: SCREEN_W } = Dimensions.get("window");
const H_PAD = spacing.md;
const COLS = 3;
const CAT_GAP = spacing.sm;
const CARD_W = (SCREEN_W - H_PAD * 2 - CAT_GAP * (COLS - 1)) / COLS;

export default function SearchRoute() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const trimmed = query.trim().toLowerCase();

  const {
    data: catData,
    isLoading: catLoading,
    error: catError,
    refetch: catRefetch,
  } = useCategoriesQuery();

  const { data: prodData, isLoading: prodLoading } = useProductsQuery();

  const categories = useMemo(
    () => (catData ?? []).filter((c) => c.IsActive !== false),
    [catData],
  );

  const filteredCategories = useMemo(() => {
    if (!trimmed) return categories;
    return categories.filter((c) =>
      c.CategoryName?.toLowerCase().includes(trimmed),
    );
  }, [categories, trimmed]);

  const filteredProducts = useMemo(() => {
    if (!trimmed) return [];
    return (prodData ?? []).filter(
      (p) =>
        p.ProductName?.toLowerCase().includes(trimmed) ||
        p.CategoryName?.toLowerCase().includes(trimmed) ||
        p.Description?.toLowerCase().includes(trimmed),
    );
  }, [prodData, trimmed]);

  const isLoading = catLoading || (!!trimmed && prodLoading);
  const showSearch = trimmed.length > 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <View style={{ height: insets.top, backgroundColor: colors.primary }} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Search</Text>
      </View>

      {/* ── Search bar ── */}
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            ...shadows.sm,
          },
        ]}
      >
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search products or categories..."
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          style={[styles.searchInput, { color: colors.text }]}
        />
        {query.length > 0 ? (
          <Pressable onPress={() => setQuery("")} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {/* ── Body ── */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : catError ? (
        <View style={styles.center}>
          <Ionicons name="warning-outline" size={44} color={colors.error} />
          <Text style={[styles.muted, { color: colors.error }]}>
            Failed to load categories.
          </Text>
          <Pressable
            onPress={() => catRefetch()}
            style={[styles.retryBtn, { borderColor: colors.primary }]}
          >
            <Text style={[styles.retryText, { color: colors.primary }]}>
              Retry
            </Text>
          </Pressable>
        </View>
      ) : showSearch ? (
        /*
         * ── SEARCH RESULTS VIEW ──
         * Key="search" — completely separate component tree from the grid below.
         * No numColumns here → single-column product list.
         */
        <ScrollView
          key="search-results"
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Matching category chips */}
          {filteredCategories.length > 0 ? (
            <View style={{ marginBottom: spacing.md }}>
              <Text
                style={[
                  styles.sectionLabel,
                  { color: colors.textSecondary, marginBottom: spacing.sm },
                ]}
              >
                Categories
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: spacing.sm }}
              >
                {filteredCategories.map((item) => (
                  <Pressable
                    key={String(item.CategoryId)}
                    style={[
                      styles.searchCatChip,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() =>
                      router.push({
                        pathname: "/category/[id]",
                        params: {
                          id: String(item.CategoryId),
                          name: item.CategoryName,
                        },
                      })
                    }
                  >
                    <View
                      style={[
                        styles.chipImgWrap,
                        { backgroundColor: colors.surfaceSecondary },
                      ]}
                    >
                      {item.PhotoUrl ? (
                        <Image
                          source={{ uri: item.PhotoUrl }}
                          style={styles.chipImg}
                          contentFit="cover"
                          transition={200}
                        />
                      ) : (
                        <Ionicons
                          name="fast-food-outline"
                          size={16}
                          color={colors.primary}
                        />
                      )}
                    </View>
                    <Text style={[styles.chipLabel, { color: colors.text }]}>
                      {item.CategoryName}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* Matching products */}
          {filteredProducts.length === 0 && filteredCategories.length === 0 ? (
            <View style={styles.center}>
              <Ionicons
                name="search-outline"
                size={44}
                color={colors.textMuted}
              />
              <Text style={[styles.muted, { color: colors.textSecondary }]}>
                No results for "{query}"
              </Text>
            </View>
          ) : filteredProducts.length > 0 ? (
            <>
              <Text
                style={[
                  styles.sectionLabel,
                  { color: colors.textSecondary, marginBottom: spacing.sm },
                ]}
              >
                Products
              </Text>
              {filteredProducts.map((item, index) => {
                const img = getPrimaryProductImage(item);
                const isLast = index === filteredProducts.length - 1;
                return (
                  <View key={String(item.ProductId)}>
                    <Pressable
                      style={styles.productRow}
                      onPress={() =>
                        router.push(`/product/${item.ProductId}` as any)
                      }
                    >
                      <Image
                        source={
                          img
                            ? { uri: img }
                            : require("../../assets/images/sweet1.png")
                        }
                        style={[
                          styles.productThumb,
                          { backgroundColor: colors.surface },
                        ]}
                        contentFit="cover"
                        transition={200}
                      />
                      <View style={styles.productMeta}>
                        <Text
                          numberOfLines={1}
                          style={[styles.productName, { color: colors.text }]}
                        >
                          {item.ProductName}
                        </Text>
                        <Text
                          style={[
                            styles.productCategory,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {item.CategoryName}
                        </Text>
                        <Text
                          style={[
                            styles.productPrice,
                            { color: colors.primary },
                          ]}
                        >
                          ₹{getDisplayPrice(item).toFixed(2)}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={colors.textMuted}
                      />
                    </Pressable>
                    {!isLast ? (
                      <View
                        style={[
                          styles.divider,
                          { backgroundColor: colors.border },
                        ]}
                      />
                    ) : null}
                  </View>
                );
              })}
            </>
          ) : null}
        </ScrollView>
      ) : (
        /*
         * ── CATEGORY GRID VIEW ──
         * Key="grid" — completely separate component tree from the search view above.
         * numColumns={3} is FIXED here and never changes — no invariant violation.
         */
        <FlatList
          key="category-grid"
          data={filteredCategories}
          numColumns={COLS}
          keyExtractor={(item) => String(item.CategoryId)}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text
              style={[
                styles.sectionLabel,
                { color: colors.textSecondary, marginBottom: spacing.sm },
              ]}
            >
              All Categories
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons
                name="grid-outline"
                size={44}
                color={colors.textMuted}
              />
              <Text style={[styles.muted, { color: colors.textSecondary }]}>
                No categories yet.
              </Text>
            </View>
          }
          renderItem={({ item }: { item: CategoryDto }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/category/[id]",
                  params: {
                    id: String(item.CategoryId),
                    name: item.CategoryName,
                  },
                })
              }
              style={[
                styles.sqCard,
                {
                  backgroundColor: colors.surface,
                  ...shadows.sm,
                },
              ]}
            >
              {/* Square image fills top of card */}
              <View style={styles.sqImgWrap}>
                {item.PhotoUrl ? (
                  <Image
                    source={{ uri: item.PhotoUrl }}
                    style={styles.sqImg}
                    contentFit="cover"
                    transition={200}
                  />
                ) : (
                  <View
                    style={[
                      styles.sqImgFallback,
                      { backgroundColor: colors.surfaceSecondary },
                    ]}
                  >
                    <Ionicons
                      name="fast-food-outline"
                      size={32}
                      color={colors.primary}
                    />
                  </View>
                )}
              </View>

              {/* Name below image */}
              <View style={styles.sqLabelWrap}>
                <Text
                  numberOfLines={2}
                  style={[styles.sqLabel, { color: colors.text }]}
                >
                  {item.CategoryName}
                </Text>
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

  header: {
    paddingHorizontal: H_PAD,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  headerTitle: { fontSize: 24, fontWeight: "800" },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: H_PAD,
    marginVertical: spacing.sm,
    height: 50,
    borderRadius: radius.md, // was radius.lg
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchInput: { flex: 1, fontSize: 15 },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingTop: spacing.xl,
    paddingHorizontal: H_PAD,
  },
  muted: { fontSize: 14, textAlign: "center" },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  listContent: {
    paddingHorizontal: H_PAD,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
  row: { gap: CAT_GAP, marginBottom: CAT_GAP },

  /* ── Square category card (grid mode) ── */
  sqCard: {
    width: CARD_W,
    borderRadius: radius.md, // was radius.xl
    overflow: "hidden",
  },
  sqImgWrap: {
    width: "100%",
    aspectRatio: 1,
  },
  sqImg: {
    width: "100%",
    height: "100%",
  },
  sqImgFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  sqLabelWrap: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  sqLabel: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 16,
  },

  /* ── Search result rows ── */
  divider: { height: 1, marginLeft: 72 + spacing.md },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  productThumb: { width: 72, height: 72, borderRadius: radius.sm }, // was radius.lg
  productMeta: { flex: 1, gap: 3 },
  productName: { fontSize: 15, fontWeight: "700" },
  productCategory: { fontSize: 12 },
  productPrice: { fontSize: 14, fontWeight: "800", marginTop: 2 },

  /* ── Category chips in search results ── */
  searchCatChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 5,
    paddingLeft: 5,
    paddingRight: spacing.md,
    borderRadius: radius.md, // was 999 (pill)
    borderWidth: 1,
  },
  chipImgWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.sm, // was 14 (circle)
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  chipImg: { width: 28, height: 28 },
  chipLabel: { fontSize: 13, fontWeight: "700" },

  retryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.md, // was 999 (pill)
    borderWidth: 1.5,
    marginTop: spacing.sm,
  },
  retryText: { fontSize: 14, fontWeight: "700" },
});
