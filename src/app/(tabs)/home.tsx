import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { useCartStore } from "@/features/cart/store/cart.store";
import {
  useFavouriteProductsQuery,
  useToggleFavouriteMutation,
} from "@/features/favourites/hooks/use-favourites";
import {
  getDefaultPricingOption,
  getDisplayPrice,
  getPrimaryProductImage,
} from "@/features/home/api/home.api";
import { useHomeData } from "@/features/home/hooks/use-home-data";
import { useUnreadNotificationCount } from "@/features/notifications/hooks/use-notifications";
import { radius, shadows, spacing, useTheme } from "@/theme";
import type { CategoryDto, ProductDto } from "@/types/api";

const { width: SCREEN_W } = Dimensions.get("window");
const BANNER_HEIGHT = 160;
const BANNER_WIDTH = SCREEN_W - spacing.md * 2;
const BANNER_AUTOPLAY_MS = 4500;
const PRODUCT_CARD_WIDTH = 172;
const PRODUCT_IMAGE_HEIGHT = 160;
const CAT_CIRCLE = 68;

type AddedProductPopup = {
  visible: boolean;
  productName: string;
  qty: number;
  unitName: string;
};

type PickerState = {
  visible: boolean;
  product: ProductDto | null;
  selectedPriceId: number | null;
  qty: number;
};

function getOptionSectionLabel(unitNames: string[]) {
  const normalized = unitNames
    .map((u) => (u ?? "").trim().toLowerCase())
    .filter(Boolean);

  const weightWords = [
    "kg",
    "kgs",
    "kilogram",
    "kilograms",
    "gm",
    "gms",
    "gram",
    "grams",
    "g",
  ];

  const countWords = [
    "pc",
    "pcs",
    "piece",
    "pieces",
    "qty",
    "quantity",
    "plate",
    "plates",
    "box",
    "boxes",
    "pack",
    "packs",
    "dozen",
    "serving",
    "servings",
    "cup",
    "cups",
    "bottle",
    "bottles",
  ];

  const hasWeight = normalized.some((unit) =>
    weightWords.some((word) => unit === word || unit.includes(word)),
  );

  const hasCount = normalized.some((unit) =>
    countWords.some((word) => unit === word || unit.includes(word)),
  );

  if (hasWeight) return "Size";
  if (hasCount) return "Quantity";
  return "Quantity";
}

export default function HomeTab() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const user = useAuthStore((s) => s.user);
  const address = (user as any)?.address as string | undefined;

  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const increaseQty = useCartStore((s) => s.increaseQty);
  const decreaseQty = useCartStore((s) => s.decreaseQty);

  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const unreadCount = useUnreadNotificationCount();

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [activeBanner, setActiveBanner] = useState(0);
  const [addedPopup, setAddedPopup] = useState<AddedProductPopup>({
    visible: false,
    productName: "",
    qty: 0,
    unitName: "",
  });
  const [picker, setPicker] = useState<PickerState>({
    visible: false,
    product: null,
    selectedPriceId: null,
    qty: 1,
  });

  const bannerScrollRef = useRef<ScrollView>(null);
  const bannerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bannerIndexRef = useRef(0);
  const isUserScrollingRef = useRef(false);
  const popupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    categories,
    products,
    featuredProducts,
    navBanners,
    specialProducts,
    isLoading,
    isRefreshing,
    error,
    refetch,
  } = useHomeData(selectedCategory);

  const { data: favourites = [] } = useFavouriteProductsQuery();
  const toggleFav = useToggleFavouriteMutation();

  const favouriteIds = useMemo(
    () => new Set((favourites ?? []).map((p) => p.ProductId)),
    [favourites],
  );

  const onToggleFav = useCallback(
    (item: ProductDto) => {
      const isFav = favouriteIds.has(item.ProductId);
      toggleFav.mutate({ ...item, isfavorite: isFav });
    },
    [favouriteIds, toggleFav],
  );

  const showAddedPopup = useCallback(
    (productName: string, qty: number, unitName: string) => {
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);

      setAddedPopup({
        visible: true,
        productName,
        qty,
        unitName,
      });

      popupTimerRef.current = setTimeout(() => {
        setAddedPopup((prev) => ({ ...prev, visible: false }));
      }, 1800);
    },
    [],
  );

  const getActivePricingOptions = useCallback((product: ProductDto) => {
    return product.PricingOptions?.filter((o) => o.IsActive !== false) ?? [];
  }, []);

  const getResolvedOption = useCallback(
    (product: ProductDto) => {
      const activeOptions = getActivePricingOptions(product);
      if (activeOptions.length > 0) return activeOptions[0];
      return getDefaultPricingOption(product);
    },
    [getActivePricingOptions],
  );

  const hasConfigurableOptions = useCallback(
    (product: ProductDto) => {
      return getActivePricingOptions(product).length > 1;
    },
    [getActivePricingOptions],
  );

  const getSimpleCartLine = useCallback(
    (product: ProductDto) => {
      const resolved = getResolvedOption(product);
      if (!resolved) return null;

      return (
        items.find(
          (cartItem) =>
            cartItem.productId === product.ProductId &&
            cartItem.productPriceId === resolved.ProductPriceId,
        ) ?? null
      );
    },
    [getResolvedOption, items],
  );

  const addProductToCart = useCallback(
    (product: ProductDto, qty: number, selectedOption: any) => {
      const existing = items.find(
        (cartItem) =>
          cartItem.productId === product.ProductId &&
          cartItem.productPriceId === selectedOption.ProductPriceId,
      );

      for (let i = 0; i < qty; i += 1) {
        addItem({
          productId: product.ProductId,
          productPriceId: selectedOption.ProductPriceId,
          productName: product.ProductName,
          unitName: selectedOption.UnitName,
          price: selectedOption.Price,
          imageUrl: getPrimaryProductImage(product),
          taxPercent: product.TaxPercent,
        });
      }

      const nextQty = (existing?.qty ?? 0) + qty;
      showAddedPopup(product.ProductName, nextQty, selectedOption.UnitName);
    },
    [addItem, items, showAddedPopup],
  );

  const openOptionPicker = useCallback(
    (item: ProductDto) => {
      const activeOptions = getActivePricingOptions(item);

      if (activeOptions.length <= 1) {
        const selectedOption =
          activeOptions.length === 1
            ? activeOptions[0]
            : getDefaultPricingOption(item);

        if (!selectedOption) return;
        addProductToCart(item, 1, selectedOption);
        return;
      }

      setPicker({
        visible: true,
        product: item,
        selectedPriceId: activeOptions[0]?.ProductPriceId ?? null,
        qty: 1,
      });
    },
    [addProductToCart, getActivePricingOptions],
  );

  const closePicker = useCallback(() => {
    setPicker({
      visible: false,
      product: null,
      selectedPriceId: null,
      qty: 1,
    });
  }, []);

  const pickerOptions = useMemo(() => {
    const active =
      picker.product?.PricingOptions?.filter((o) => o.IsActive !== false) ?? [];
    if (active.length) return active;
    return picker.product ? [getDefaultPricingOption(picker.product)] : [];
  }, [picker.product]);

  const selectedPickerOption = useMemo(() => {
    return (
      pickerOptions.find((o) => o.ProductPriceId === picker.selectedPriceId) ??
      pickerOptions[0] ??
      null
    );
  }, [picker.selectedPriceId, pickerOptions]);

  const pickerSectionLabel = useMemo(() => {
    return getOptionSectionLabel(pickerOptions.map((o) => o.UnitName ?? ""));
  }, [pickerOptions]);

  const pickerTotal = useMemo(() => {
    return (selectedPickerOption?.Price ?? 0) * picker.qty;
  }, [picker.qty, selectedPickerOption]);

  const confirmPickerAdd = useCallback(() => {
    if (!picker.product || !selectedPickerOption) return;
    addProductToCart(picker.product, picker.qty, selectedPickerOption);
    closePicker();
  }, [
    addProductToCart,
    closePicker,
    picker.product,
    picker.qty,
    selectedPickerOption,
  ]);

  const startBannerTimer = useCallback(() => {
    if (bannerTimerRef.current) clearInterval(bannerTimerRef.current);
    if (navBanners.length <= 1) return;

    bannerTimerRef.current = setInterval(() => {
      if (isUserScrollingRef.current) return;

      const nextIndex =
        bannerIndexRef.current >= navBanners.length - 1
          ? 0
          : bannerIndexRef.current + 1;

      bannerScrollRef.current?.scrollTo({
        x: BANNER_WIDTH * nextIndex,
        animated: true,
      });

      bannerIndexRef.current = nextIndex;
      setActiveBanner(nextIndex);
    }, BANNER_AUTOPLAY_MS);
  }, [navBanners.length]);

  useEffect(() => {
    startBannerTimer();

    return () => {
      if (bannerTimerRef.current) clearInterval(bannerTimerRef.current);
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    };
  }, [startBannerTimer]);

  const handleBannerScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / BANNER_WIDTH);
      const clampedIndex = Math.max(0, Math.min(index, navBanners.length - 1));

      bannerIndexRef.current = clampedIndex;
      setActiveBanner(clampedIndex);
      isUserScrollingRef.current = false;
      startBannerTimer();
    },
    [navBanners.length, startBannerTimer],
  );

  const handleBannerScrollBegin = useCallback(() => {
    isUserScrollingRef.current = true;
  }, []);

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.IsActive !== false),
    [categories],
  );

  const selectedCategoryName = useMemo(
    () =>
      visibleCategories.find((c) => c.CategoryId === selectedCategory)
        ?.CategoryName,
    [selectedCategory, visibleCategories],
  );

  const sections = useMemo(
    () => [
      ...(selectedCategory && featuredProducts.length > 0
        ? [
            {
              title: selectedCategoryName ?? "Products",
              data: featuredProducts,
            },
          ]
        : []),
      ...(favourites.length > 0
        ? [{ title: "Your favourites", data: favourites }]
        : []),
      ...(specialProducts.length > 0
        ? [{ title: "Special picks", data: specialProducts }]
        : []),
      ...(products.length > 0
        ? [{ title: "Popular products", data: products }]
        : []),
    ],
    [
      favourites,
      featuredProducts,
      products,
      selectedCategory,
      selectedCategoryName,
      specialProducts,
    ],
  );

  if (isLoading) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        <Ionicons name="warning-outline" size={44} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>
          Failed to load home. Check your connection.
        </Text>
        <Pressable
          onPress={refetch}
          style={[styles.retryBtn, { borderColor: colors.primary }]}
        >
          <Text style={[styles.retryText, { color: colors.primary }]}>
            Retry
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <View style={{ height: insets.top, backgroundColor: colors.primary }} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: colors.text }]}>
              Hello {user?.fullName ?? "Guest"}
            </Text>

            <Pressable
              style={styles.locationRow}
              onPress={() => router.push("/(tabs)/profile")}
            >
              <Ionicons
                name="location-outline"
                size={14}
                color={colors.textSecondary}
              />
              <Text
                numberOfLines={1}
                style={[styles.locationText, { color: colors.textSecondary }]}
              >
                {address ?? "Add your delivery address"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={12}
                color={colors.textMuted}
              />
            </Pressable>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              style={[
                styles.iconBtn,
                { backgroundColor: colors.surface, ...shadows.sm },
              ]}
              onPress={() => router.push("/(tabs)/cart")}
            >
              <Ionicons name="cart-outline" size={20} color={colors.text} />
              {cartCount > 0 ? (
                <View style={[styles.badge, { backgroundColor: colors.error }]}>
                  <Text style={styles.badgeText}>
                    {cartCount > 99 ? "99+" : cartCount}
                  </Text>
                </View>
              ) : null}
            </Pressable>

            <Pressable
              style={[
                styles.iconBtn,
                { backgroundColor: colors.surface, ...shadows.sm },
              ]}
              onPress={() => router.push("/notifications" as any)}
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color={colors.text}
              />
              {unreadCount > 0 ? (
                <View style={[styles.badge, { backgroundColor: colors.error }]}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>

        <View style={styles.searchRow}>
          <Pressable
            style={[
              styles.searchBar,
              { backgroundColor: colors.surface, ...shadows.sm },
            ]}
            onPress={() => router.push("/(tabs)/search")}
          >
            <Ionicons
              name="search-outline"
              size={18}
              color={colors.textMuted}
            />
            <Text
              style={[styles.searchPlaceholder, { color: colors.textMuted }]}
            >
              Search here...
            </Text>
          </Pressable>

          <Pressable
            style={[styles.filterBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)/search")}
          >
            <Ionicons name="options-outline" size={20} color={colors.white} />
          </Pressable>
        </View>

        {navBanners.length > 0 ? (
          <View style={styles.bannerSection}>
            <ScrollView
              ref={bannerScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              decelerationRate="fast"
              onScrollBeginDrag={handleBannerScrollBegin}
              onMomentumScrollEnd={handleBannerScrollEnd}
              style={styles.bannerScroll}
            >
              {navBanners.map((item, index) => (
                <Image
                  key={String(item.BannerId ?? index)}
                  source={
                    item.BannerImageUrl
                      ? { uri: item.BannerImageUrl }
                      : require("../../assets/images/sweet1.png")
                  }
                  style={styles.bannerImage}
                  contentFit="cover"
                  transition={600}
                />
              ))}
            </ScrollView>

            {navBanners.length > 1 ? (
              <View style={styles.bannerDots}>
                {navBanners.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.bannerDot,
                      {
                        backgroundColor:
                          index === activeBanner
                            ? colors.primary
                            : colors.border,
                        width: index === activeBanner ? 20 : 6,
                      },
                    ]}
                  />
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        {visibleCategories.length > 0 ? (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Categories
              </Text>
              <Pressable onPress={() => router.push("/(tabs)/search")}>
                <Text style={[styles.viewAll, { color: colors.textSecondary }]}>
                  View all
                </Text>
              </Pressable>
            </View>

            <FlatList
              horizontal
              data={visibleCategories}
              keyExtractor={(item) => String(item.CategoryId)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
              ItemSeparatorComponent={() => (
                <View style={{ width: spacing.sm }} />
              )}
              renderItem={({ item }: { item: CategoryDto }) => {
                const isActive = selectedCategory === item.CategoryId;

                return (
                  <Pressable
                    onPress={() =>
                      setSelectedCategory(isActive ? null : item.CategoryId)
                    }
                    style={({ pressed }) => [
                      styles.categoryItem,
                      pressed && { transform: [{ scale: 0.93 }] },
                    ]}
                  >
                    <View
                      style={[
                        styles.categoryCircleOuter,
                        {
                          borderColor: isActive
                            ? colors.primary
                            : "transparent",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.categoryCircle,
                          {
                            backgroundColor: isActive
                              ? colors.primary + "18"
                              : colors.surface,
                            ...shadows.sm,
                          },
                        ]}
                      >
                        {item.PhotoUrl ? (
                          <Image
                            source={{ uri: item.PhotoUrl }}
                            style={styles.categoryCircleImg}
                            contentFit="cover"
                            transition={200}
                          />
                        ) : (
                          <Ionicons
                            name="fast-food-outline"
                            size={30}
                            color={
                              isActive ? colors.primary : colors.textSecondary
                            }
                          />
                        )}
                      </View>
                    </View>

                    <Text
                      numberOfLines={1}
                      style={[
                        styles.categoryCircleLabel,
                        {
                          color: isActive ? colors.primary : colors.text,
                          fontWeight: isActive ? "700" : "500",
                        },
                      ]}
                    >
                      {item.CategoryName}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>
        ) : null}

        {sections.length === 0 ? (
          <View style={[styles.emptyProducts, styles.center]}>
            <Ionicons
              name="basket-outline"
              size={48}
              color={colors.textMuted}
            />
            <Text style={[styles.emptyHeading, { color: colors.text }]}>
              No products yet
            </Text>
            <Text
              style={[styles.emptySubtext, { color: colors.textSecondary }]}
            >
              Products will appear here once they are added.
            </Text>
          </View>
        ) : (
          sections.map((section) => (
            <View key={section.title} style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {section.title}
                </Text>

                <Pressable
                  onPress={() =>
                    section.title === "Your favourites"
                      ? router.push("/favourites")
                      : router.push("/(tabs)/search")
                  }
                >
                  <Text
                    style={[styles.viewAll, { color: colors.textSecondary }]}
                  >
                    View all
                  </Text>
                </Pressable>
              </View>

              <FlatList
                horizontal
                data={section.data}
                keyExtractor={(item: ProductDto, index) =>
                  `${section.title}-${item.ProductId}-${index}`
                }
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productList}
                renderItem={({ item }: { item: ProductDto }) => {
                  const img = getPrimaryProductImage(item);
                  const isFav = favouriteIds.has(item.ProductId);
                  const configurable = hasConfigurableOptions(item);
                  const simpleCartLine = getSimpleCartLine(item);
                  const simpleQty = simpleCartLine?.qty ?? 0;

                  return (
                    <Pressable
                      onPress={() =>
                        router.push(`/product/${item.ProductId}` as any)
                      }
                      style={[
                        styles.productCard,
                        { backgroundColor: colors.surface, ...shadows.sm },
                      ]}
                    >
                      <View style={styles.imageWrap}>
                        <Image
                          source={
                            img
                              ? { uri: img }
                              : require("../../assets/images/sweet1.png")
                          }
                          style={styles.productImage}
                          contentFit="cover"
                          transition={200}
                        />

                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            onToggleFav(item);
                          }}
                          hitSlop={8}
                          style={[
                            styles.heartBtn,
                            {
                              backgroundColor: isFav
                                ? colors.error + "CC"
                                : "rgba(0,0,0,0.28)",
                            },
                          ]}
                        >
                          <Ionicons
                            name={isFav ? "heart" : "heart-outline"}
                            size={15}
                            color="#fff"
                          />
                        </Pressable>

                        {configurable ? (
                          <View
                            style={[
                              styles.multiBadge,
                              { backgroundColor: "rgba(0,0,0,0.55)" },
                            ]}
                          >
                            <Text style={styles.multiBadgeText}>
                              Customizable
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      <View style={styles.productInfo}>
                        <Text
                          numberOfLines={1}
                          style={[styles.productName, { color: colors.text }]}
                        >
                          {item.ProductName}
                        </Text>

                        <View style={styles.priceRow}>
                          <Text
                            style={[
                              styles.productPrice,
                              { color: colors.primary },
                            ]}
                          >
                            ₹{getDisplayPrice(item).toFixed(2)}
                          </Text>

                          {configurable ? (
                            <Pressable
                              onPress={(e) => {
                                e.stopPropagation();
                                openOptionPicker(item);
                              }}
                              hitSlop={6}
                              style={[
                                styles.addBtn,
                                { backgroundColor: colors.primary },
                              ]}
                            >
                              <Ionicons name="add" size={18} color="#fff" />
                            </Pressable>
                          ) : simpleQty > 0 ? (
                            <View
                              style={[
                                styles.inlineQtyBox,
                                {
                                  borderColor: "#e17a86",
                                  backgroundColor: colors.surfaceSecondary,
                                },
                              ]}
                            >
                              <Pressable
                                onPress={(e) => {
                                  e.stopPropagation();
                                  const resolved = getResolvedOption(item);
                                  if (!resolved) return;
                                  decreaseQty(
                                    item.ProductId,
                                    resolved.ProductPriceId,
                                  );
                                }}
                                hitSlop={6}
                                style={styles.inlineQtyBtn}
                              >
                                <Ionicons
                                  name="remove"
                                  size={16}
                                  color="#e17a86"
                                />
                              </Pressable>

                              <Text
                                style={[
                                  styles.inlineQtyText,
                                  { color: colors.text },
                                ]}
                              >
                                {simpleQty}
                              </Text>

                              <Pressable
                                onPress={(e) => {
                                  e.stopPropagation();
                                  const resolved = getResolvedOption(item);
                                  if (!resolved) return;
                                  increaseQty(
                                    item.ProductId,
                                    resolved.ProductPriceId,
                                  );
                                }}
                                hitSlop={6}
                                style={styles.inlineQtyBtn}
                              >
                                <Ionicons
                                  name="add"
                                  size={16}
                                  color="#e17a86"
                                />
                              </Pressable>
                            </View>
                          ) : (
                            <Pressable
                              onPress={(e) => {
                                e.stopPropagation();
                                const resolved = getResolvedOption(item);
                                if (!resolved) return;
                                addProductToCart(item, 1, resolved);
                              }}
                              hitSlop={6}
                              style={[
                                styles.addBtn,
                                { backgroundColor: colors.primary },
                              ]}
                            >
                              <Ionicons name="add" size={18} color="#fff" />
                            </Pressable>
                          )}
                        </View>
                      </View>
                    </Pressable>
                  );
                }}
              />
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={picker.visible}
        transparent
        animationType="slide"
        onRequestClose={closePicker}
      >
        <View
          style={[styles.sheetOverlay, { backgroundColor: colors.overlay }]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={closePicker} />

          <View
            style={[
              styles.sheetCard,
              {
                backgroundColor: colors.background,
                paddingBottom: Math.max(insets.bottom, spacing.sm),
              },
            ]}
          >
            {picker.product ? (
              <View>
                <View style={styles.sheetHandleWrap}>
                  <View
                    style={[
                      styles.sheetHandle,
                      { backgroundColor: colors.border },
                    ]}
                  />
                </View>

                <View
                  style={[
                    styles.sheetProductCard,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <Image
                    source={
                      getPrimaryProductImage(picker.product)
                        ? { uri: getPrimaryProductImage(picker.product)! }
                        : require("../../assets/images/sweet1.png")
                    }
                    style={styles.sheetProductImage}
                    contentFit="cover"
                    transition={200}
                  />

                  <View style={styles.sheetProductBody}>
                    <Text
                      style={[styles.sheetProductName, { color: colors.text }]}
                    >
                      {picker.product.ProductName}
                    </Text>

                    <Text
                      numberOfLines={3}
                      style={[
                        styles.sheetProductDesc,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {picker.product.Description?.trim() ||
                        `${picker.product.ProductName} from ${picker.product.CategoryName}.`}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.sheetOptionsCard,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <Text
                    style={[styles.sheetSectionTitle, { color: colors.text }]}
                  >
                    {pickerSectionLabel}
                  </Text>
                  <Text
                    style={[
                      styles.sheetSectionSub,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Required • Select any 1 option
                  </Text>

                  <View
                    style={[
                      styles.sheetDivider,
                      { backgroundColor: colors.border },
                    ]}
                  />

                  {pickerOptions.map((opt, index) => {
                    const active =
                      opt.ProductPriceId ===
                      selectedPickerOption?.ProductPriceId;

                    return (
                      <Pressable
                        key={opt.ProductPriceId}
                        onPress={() =>
                          setPicker((prev) => ({
                            ...prev,
                            selectedPriceId: opt.ProductPriceId,
                          }))
                        }
                        style={[
                          styles.sheetOptionRow,
                          index !== pickerOptions.length - 1 && {
                            borderBottomWidth: StyleSheet.hairlineWidth,
                            borderBottomColor: colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.sheetOptionUnit,
                            {
                              color: colors.text,
                              fontWeight: active ? "800" : "600",
                            },
                          ]}
                        >
                          {opt.UnitName}
                        </Text>

                        <View style={styles.sheetOptionRight}>
                          <Text
                            style={[
                              styles.sheetOptionPrice,
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

                <View
                  style={[
                    styles.sheetBottomBar,
                    {
                      backgroundColor: colors.background,
                      borderTopColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.qtyBox,
                      {
                        borderColor: "#e17a86",
                        backgroundColor: colors.surface,
                      },
                    ]}
                  >
                    <Pressable
                      onPress={() =>
                        setPicker((prev) => ({
                          ...prev,
                          qty: Math.max(1, prev.qty - 1),
                        }))
                      }
                      hitSlop={8}
                      style={styles.qtyBtn}
                    >
                      <Ionicons name="remove" size={22} color="#e17a86" />
                    </Pressable>

                    <Text style={[styles.qtyText, { color: colors.text }]}>
                      {picker.qty}
                    </Text>

                    <Pressable
                      onPress={() =>
                        setPicker((prev) => ({
                          ...prev,
                          qty: prev.qty + 1,
                        }))
                      }
                      hitSlop={8}
                      style={styles.qtyBtn}
                    >
                      <Ionicons name="add" size={22} color="#e17a86" />
                    </Pressable>
                  </View>

                  <Pressable
                    style={styles.sheetAddBtn}
                    onPress={confirmPickerAdd}
                  >
                    <Text style={styles.sheetAddBtnText}>
                      Add item ₹{pickerTotal.toFixed(2)}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal
        visible={addedPopup.visible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setAddedPopup((prev) => ({ ...prev, visible: false }))
        }
      >
        <View
          style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}
        >
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.surface, ...shadows.md },
            ]}
          >
            <View
              style={[
                styles.modalIconWrap,
                { backgroundColor: colors.primary + "18" },
              ]}
            >
              <Ionicons name="checkmark" size={24} color={colors.primary} />
            </View>

            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Added to cart
            </Text>

            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              {addedPopup.productName}
            </Text>

            <Text style={[styles.modalMeta, { color: colors.primary }]}>
              Qty {addedPopup.qty}
              {addedPopup.unitName ? ` • ${addedPopup.unitName}` : ""}
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={[
                  styles.modalSecondaryBtn,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surfaceSecondary,
                  },
                ]}
                onPress={() =>
                  setAddedPopup((prev) => ({ ...prev, visible: false }))
                }
              >
                <Text
                  style={[styles.modalSecondaryText, { color: colors.text }]}
                >
                  Continue
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.modalPrimaryBtn,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => {
                  setAddedPopup((prev) => ({ ...prev, visible: false }));
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
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.lg,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flex: 1, marginRight: spacing.sm },
  greeting: { fontSize: 20, fontWeight: "800" },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  locationText: { fontSize: 13, flexShrink: 1, marginHorizontal: 4 },

  headerActions: { flexDirection: "row" },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.xs,
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },

  searchRow: { flexDirection: "row" },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginRight: spacing.xs,
  },
  searchPlaceholder: { fontSize: 14, marginLeft: spacing.xs },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },

  bannerSection: { gap: spacing.xs },
  bannerScroll: { borderRadius: radius.xl, overflow: "hidden" },
  bannerImage: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: radius.xl,
  },
  bannerDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  bannerDot: { height: 6, borderRadius: 999 },

  categoryList: {
    paddingBottom: spacing.xs,
    paddingRight: spacing.md,
  },
  categoryItem: { alignItems: "center", width: CAT_CIRCLE + 4 },
  categoryCircleOuter: {
    width: CAT_CIRCLE + 6,
    height: CAT_CIRCLE + 6,
    borderRadius: (CAT_CIRCLE + 6) / 2,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  categoryCircle: {
    width: CAT_CIRCLE,
    height: CAT_CIRCLE,
    borderRadius: CAT_CIRCLE / 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  categoryCircleImg: { width: CAT_CIRCLE, height: CAT_CIRCLE },
  categoryCircleLabel: {
    fontSize: 12,
    textAlign: "center",
    maxWidth: CAT_CIRCLE + 12,
  },

  sectionBlock: { gap: spacing.sm },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { fontSize: 18, fontWeight: "800" },
  viewAll: { fontSize: 13, fontWeight: "600" },

  productList: { paddingRight: spacing.md },
  productCard: {
    width: PRODUCT_CARD_WIDTH,
    borderRadius: radius.md,
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  imageWrap: {
    width: "100%",
    height: PRODUCT_IMAGE_HEIGHT,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  productImage: { width: "100%", height: "100%" },
  heartBtn: {
    position: "absolute",
    top: spacing.xs,
    right: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  multiBadge: {
    position: "absolute",
    left: spacing.xs,
    bottom: spacing.xs,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  multiBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },

  productInfo: { paddingHorizontal: 4, paddingTop: spacing.xs, gap: 6 },
  productName: { fontSize: 14, fontWeight: "700", lineHeight: 19 },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  productPrice: { fontSize: 15, fontWeight: "800" },

  addBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },

  inlineQtyBox: {
    minWidth: 90,
    height: 32,
    borderRadius: 10,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
  },
  inlineQtyBtn: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  inlineQtyText: {
    fontSize: 14,
    fontWeight: "800",
    minWidth: 18,
    textAlign: "center",
  },

  errorText: { fontSize: 14, textAlign: "center" },
  retryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1.5,
    marginTop: spacing.sm,
  },
  retryText: { fontSize: 14, fontWeight: "700" },

  emptyProducts: { minHeight: 200 },
  emptyHeading: { fontSize: 17, fontWeight: "700", textAlign: "center" },
  emptySubtext: { fontSize: 14, textAlign: "center", lineHeight: 20 },

  sheetOverlay: { flex: 1, justifyContent: "flex-end" },
  sheetCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",
  },
  sheetHandleWrap: {
    alignItems: "center",
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  sheetHandle: { width: 44, height: 5, borderRadius: 999 },

  sheetProductCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    borderRadius: 22,
    overflow: "hidden",
  },
  sheetProductImage: { width: "100%", height: 220 },
  sheetProductBody: { padding: spacing.md },
  sheetProductName: { fontSize: 22, fontWeight: "800" },
  sheetProductDesc: { fontSize: 14, lineHeight: 22, marginTop: spacing.sm },

  sheetOptionsCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: 22,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  sheetSectionTitle: { fontSize: 18, fontWeight: "800" },
  sheetSectionSub: { fontSize: 14, marginTop: 6, fontWeight: "500" },
  sheetDivider: { height: 1, marginTop: spacing.md, marginBottom: 2 },
  sheetOptionRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetOptionUnit: { fontSize: 16 },
  sheetOptionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  sheetOptionPrice: { fontSize: 16 },

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

  sheetBottomBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
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
  qtyBtn: { padding: 2 },
  qtyText: { fontSize: 18, fontWeight: "800" },
  sheetAddBtn: {
    flex: 1,
    height: 58,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4f5f",
  },
  sheetAddBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },

  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  modalCard: {
    width: "100%",
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: "center",
  },
  modalIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  modalTitle: { fontSize: 18, fontWeight: "800" },
  modalText: { fontSize: 15, marginTop: spacing.xs, textAlign: "center" },
  modalMeta: { fontSize: 14, fontWeight: "700", marginTop: 6 },
  modalActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
    width: "100%",
  },
  modalSecondaryBtn: {
    flex: 1,
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalPrimaryBtn: {
    flex: 1,
    height: 46,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSecondaryText: { fontSize: 14, fontWeight: "700" },
  modalPrimaryText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});
