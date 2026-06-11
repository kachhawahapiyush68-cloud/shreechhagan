import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
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

import {
  getDisplayPrice,
  getPrimaryProductImage,
} from "@/features/home/api/home.api";
// NOTE: adjust this path to wherever your favourites hooks live
import {
  useFavouriteProductsQuery,
  useToggleFavouriteMutation,
} from "@/features/favourites/hooks/use-favourites";
import { radius, shadows, spacing, useTheme } from "@/theme";
import type { ProductDto } from "@/types/api";

const { width: SCREEN_W } = Dimensions.get("window");
const H_PAD = spacing.md;
const GAP = spacing.sm;
const CARD_W = (SCREEN_W - H_PAD * 2 - GAP) / 2;

export default function FavouritesRoute() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const {
    data: favourites = [],
    isLoading,
    error,
    refetch,
  } = useFavouriteProductsQuery();
  const toggleFav = useToggleFavouriteMutation();

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
          Favourites
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="warning-outline" size={44} color={colors.error} />
          <Text style={[styles.muted, { color: colors.error }]}>
            Failed to load favourites.
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
          data={favourites}
          numColumns={2}
          keyExtractor={(item) => String(item.ProductId)}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <View
                style={[
                  styles.emptyIcon,
                  { backgroundColor: colors.surface, ...shadows.sm },
                ]}
              >
                <Ionicons
                  name="heart-outline"
                  size={40}
                  color={colors.textMuted}
                />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No favourites yet
              </Text>
              <Text style={[styles.muted, { color: colors.textSecondary }]}>
                Tap the heart on a product to save it here.
              </Text>
              <Pressable
                style={[styles.shopBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/(tabs)/home")}
              >
                <Text style={[styles.shopBtnText, { color: colors.white }]}>
                  Browse products
                </Text>
              </Pressable>
            </View>
          }
          renderItem={({ item }: { item: ProductDto }) => {
            const img = getPrimaryProductImage(item);
            return (
              <Pressable
                style={[
                  styles.card,
                  { backgroundColor: colors.surface, ...shadows.sm },
                ]}
                onPress={() => router.push(`/product/${item.ProductId}` as any)}
              >
                <View>
                  <Image
                    source={
                      img
                        ? { uri: img }
                        : require("../assets/images/sweet1.png")
                    }
                    style={styles.cardImage}
                    contentFit="cover"
                    transition={200}
                  />
                  <Pressable
                    onPress={() =>
                      toggleFav.mutate({ ...item, isfavorite: true })
                    }
                    hitSlop={10}
                    style={[
                      styles.heartBtn,
                      { backgroundColor: colors.surface },
                    ]}
                  >
                    <Ionicons name="heart" size={18} color={colors.error} />
                  </Pressable>
                </View>
                <View style={styles.cardInfo}>
                  <Text
                    numberOfLines={1}
                    style={[styles.cardName, { color: colors.text }]}
                  >
                    {item.ProductName}
                  </Text>
                  <Text style={[styles.cardPrice, { color: colors.primary }]}>
                    ₹{getDisplayPrice(item).toFixed(2)}
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
    paddingHorizontal: H_PAD,
    paddingVertical: spacing.md,
  },
  back: { padding: 2 },
  headerTitle: { fontSize: 20, fontWeight: "800" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingTop: spacing["4xl"],
    paddingHorizontal: spacing.xl,
  },
  muted: { fontSize: 14, textAlign: "center" },
  listContent: { paddingHorizontal: H_PAD, paddingBottom: spacing["4xl"] },
  row: { gap: GAP, marginBottom: GAP },
  card: { width: CARD_W, borderRadius: radius.xl, padding: spacing.xs },
  cardImage: { width: "100%", height: 130, borderRadius: radius.lg },
  heartBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },
  cardInfo: { paddingHorizontal: 4, paddingTop: spacing.xs, gap: 4 },
  cardName: { fontSize: 14, fontWeight: "700" },
  cardPrice: { fontSize: 15, fontWeight: "800" },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  emptyTitle: { fontSize: 18, fontWeight: "800" },
  shopBtn: {
    height: 46,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  shopBtnText: { fontSize: 15, fontWeight: "800" },
  retryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    marginTop: spacing.sm,
  },
  retryText: { fontSize: 14, fontWeight: "700" },
});
