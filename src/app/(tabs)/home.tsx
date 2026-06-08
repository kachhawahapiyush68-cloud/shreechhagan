// import { Ionicons } from "@expo/vector-icons";
// import { Image } from "expo-image";
// import { router } from "expo-router";
// import { useRef, useState } from "react";
// import {
//   ActivityIndicator,
//   Dimensions,
//   FlatList,
//   Pressable,
//   RefreshControl,
//   ScrollView,
//   StyleSheet,
//   Text,
//   View,
//   type ViewToken,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// import { useAuthStore } from "@/features/auth/store/auth.store";
// import { useHomeData } from "@/features/home/hooks/use-home-data";
// import { radius, shadows, spacing, useTheme } from "@/theme";
// import type { CategoryDto, ProductDto } from "@/types/api";

// const { width: SCREEN_W } = Dimensions.get("window");
// const BANNER_HEIGHT = 180;

// export default function HomeTab() {
//   const { colors } = useTheme();
//   const insets = useSafeAreaInsets();
//   const user = useAuthStore((s) => s.user);

//   const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
//   const [activeBanner, setActiveBanner] = useState(0);

//   const bannerListRef = useRef<FlatList>(null);

//   const {
//     categories,
//     featuredProducts,
//     navBanners,
//     specialProducts,
//     trendingProducts,
//     isLoading,
//     isRefreshing,
//     error,
//     refetch,
//   } = useHomeData(selectedCategory);

//   const onViewableItemsChanged = useRef(
//     ({ viewableItems }: { viewableItems: ViewToken[] }) => {
//       if (viewableItems[0]?.index != null) {
//         setActiveBanner(viewableItems[0].index);
//       }
//     },
//   ).current;

//   if (isLoading) {
//     return (
//       <View
//         style={[
//           styles.center,
//           { backgroundColor: colors.background, paddingTop: insets.top },
//         ]}
//       >
//         <ActivityIndicator color={colors.primary} size="large" />
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View
//         style={[
//           styles.center,
//           { backgroundColor: colors.background, paddingTop: insets.top },
//         ]}
//       >
//         <Ionicons name="warning-outline" size={44} color={colors.error} />
//         <Text style={[styles.errorText, { color: colors.error }]}>
//           Failed to load home. Check your connection.
//         </Text>
//         <Pressable
//           onPress={refetch}
//           style={[styles.retryBtn, { borderColor: colors.primary }]}
//         >
//           <Text style={[styles.retryText, { color: colors.primary }]}>
//             Retry
//           </Text>
//         </Pressable>
//       </View>
//     );
//   }

//   const allProductSections = [
//     ...(trendingProducts.length > 0
//       ? [{ title: "🔥 Trending", data: trendingProducts }]
//       : []),
//     ...(specialProducts.length > 0
//       ? [{ title: "⭐ Special Picks", data: specialProducts }]
//       : []),
//     ...(featuredProducts.length > 0
//       ? [
//           {
//             title: selectedCategory ? "Filtered Products" : "All Products",
//             data: featuredProducts,
//           },
//         ]
//       : []),
//   ];

//   return (
//     <ScrollView
//       style={[styles.root, { backgroundColor: colors.background }]}
//       contentContainerStyle={[
//         styles.scrollContent,
//         { paddingTop: insets.top, paddingBottom: insets.bottom + 80 },
//       ]}
//       showsVerticalScrollIndicator={false}
//       refreshControl={
//         <RefreshControl
//           refreshing={isRefreshing}
//           onRefresh={refetch}
//           colors={[colors.primary]}
//           tintColor={colors.primary}
//         />
//       }
//     >
//       {/* Header */}
//       <View style={styles.header}>
//         <View>
//           <Text style={[styles.greeting, { color: colors.textSecondary }]}>
//             Good morning 👋
//           </Text>
//           <Text style={[styles.username, { color: colors.text }]}>
//             {user?.fullName ?? "Guest"}
//           </Text>
//         </View>
//         <Pressable
//           style={[
//             styles.cartBtn,
//             { backgroundColor: colors.surface, ...shadows.sm },
//           ]}
//           onPress={() => router.push("/(tabs)/cart")}
//         >
//           <Ionicons name="cart-outline" size={22} color={colors.primary} />
//         </Pressable>
//       </View>

//       {/* Nav Banners */}
//       {navBanners.length > 0 ? (
//         <View style={styles.bannerSection}>
//           <FlatList
//             ref={bannerListRef}
//             data={navBanners}
//             horizontal
//             pagingEnabled
//             showsHorizontalScrollIndicator={false}
//             keyExtractor={(item) => String(item.BannerId)}
//             onViewableItemsChanged={onViewableItemsChanged}
//             viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
//             getItemLayout={(_, index) => ({
//               length: SCREEN_W - spacing.md * 2,
//               offset: (SCREEN_W - spacing.md * 2) * index,
//               index,
//             })}
//             renderItem={({ item }) => (
//               <Image
//                 source={{ uri: item.BannerImageUrl }}
//                 style={[
//                   styles.bannerImage,
//                   { width: SCREEN_W - spacing.md * 2 },
//                 ]}
//                 contentFit="cover"
//                 transition={300}
//               />
//             )}
//           />
//           {navBanners.length > 1 ? (
//             <View style={styles.bannerDots}>
//               {navBanners.map((_, index) => (
//                 <View
//                   key={index}
//                   style={[
//                     styles.bannerDot,
//                     {
//                       backgroundColor:
//                         index === activeBanner ? colors.primary : colors.border,
//                       width: index === activeBanner ? 20 : 6,
//                     },
//                   ]}
//                 />
//               ))}
//             </View>
//           ) : null}
//         </View>
//       ) : null}

//       {/* Categories */}
//       {categories.length > 0 ? (
//         <View style={styles.sectionBlock}>
//           <Text style={[styles.sectionTitle, { color: colors.text }]}>
//             Categories
//           </Text>
//           <FlatList
//             horizontal
//             data={categories}
//             keyExtractor={(item) => String(item.CategoryId)}
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.categoryList}
//             renderItem={({ item }: { item: CategoryDto }) => {
//               const isActive = selectedCategory === item.CategoryId;
//               return (
//                 <Pressable
//                   onPress={() =>
//                     setSelectedCategory(isActive ? null : item.CategoryId)
//                   }
//                   style={[
//                     styles.categoryPill,
//                     {
//                       backgroundColor: isActive
//                         ? colors.primary
//                         : colors.surface,
//                       borderColor: isActive ? colors.primary : colors.border,
//                     },
//                   ]}
//                 >
//                   {item.ImageUrl ? (
//                     <Image
//                       source={{ uri: item.ImageUrl }}
//                       style={styles.categoryIcon}
//                       contentFit="cover"
//                     />
//                   ) : null}
//                   <Text
//                     style={[
//                       styles.categoryLabel,
//                       {
//                         color: isActive ? colors.white : colors.text,
//                         fontWeight: isActive ? "700" : "500",
//                       },
//                     ]}
//                   >
//                     {item.CategoryName}
//                   </Text>
//                 </Pressable>
//               );
//             }}
//           />
//         </View>
//       ) : null}

//       {/* Product Sections */}
//       {allProductSections.length === 0 ? (
//         <View style={[styles.emptyProducts, styles.center]}>
//           <Ionicons name="basket-outline" size={48} color={colors.textMuted} />
//           <Text style={[styles.emptyHeading, { color: colors.text }]}>
//             No products yet
//           </Text>
//           <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
//             Products will appear here once they are added.
//           </Text>
//         </View>
//       ) : (
//         allProductSections.map((section) => (
//           <View key={section.title} style={styles.sectionBlock}>
//             <Text style={[styles.sectionTitle, { color: colors.text }]}>
//               {section.title}
//             </Text>
//             <FlatList
//               horizontal
//               data={section.data}
//               keyExtractor={(item: ProductDto) => String(item.ProductId)}
//               showsHorizontalScrollIndicator={false}
//               contentContainerStyle={styles.productList}
//               renderItem={({ item }: { item: ProductDto }) => (
//                 <Pressable
//                   onPress={() => router.push(`/product/${item.ProductId}`)}
//                   style={[
//                     styles.productCard,
//                     {
//                       backgroundColor: colors.surface,
//                       borderColor: colors.border,
//                       shadowColor: colors.black,
//                     },
//                   ]}
//                 >
//                   <Image
//                     source={
//                       item.ImageUrl
//                         ? { uri: item.ImageUrl }
//                         : require("../../assets/images/logo.png")
//                     }
//                     style={styles.productImage}
//                     contentFit="cover"
//                     transition={200}
//                   />
//                   <View style={styles.productInfo}>
//                     <Text
//                       numberOfLines={2}
//                       style={[styles.productName, { color: colors.text }]}
//                     >
//                       {item.ProductName}
//                     </Text>
//                     <Text
//                       style={[
//                         styles.productCategory,
//                         { color: colors.textMuted },
//                       ]}
//                     >
//                       {item.CategoryName}
//                     </Text>
//                     <Text
//                       style={[styles.productPrice, { color: colors.primary }]}
//                     >
//                       ₹{item.Price.toFixed(2)}
//                     </Text>
//                   </View>
//                 </Pressable>
//               )}
//             />
//           </View>
//         ))
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   root: { flex: 1 },
//   scrollContent: { paddingHorizontal: spacing.md, gap: spacing.lg },
//   center: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: spacing.sm,
//     paddingHorizontal: spacing.xl,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: spacing.sm,
//   },
//   greeting: { fontSize: 13 },
//   username: { fontSize: 20, fontWeight: "800" },
//   cartBtn: {
//     width: 44,
//     height: 44,
//     borderRadius: radius.pill,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   bannerSection: { gap: spacing.xs },
//   bannerImage: {
//     height: BANNER_HEIGHT,
//     borderRadius: radius.xl,
//   },
//   bannerDots: {
//     flexDirection: "row",
//     justifyContent: "center",
//     gap: 5,
//   },
//   bannerDot: {
//     height: 6,
//     borderRadius: radius.pill,
//   },
//   sectionBlock: { gap: spacing.sm },
//   sectionTitle: { fontSize: 18, fontWeight: "800" },
//   categoryList: { gap: spacing.xs, paddingRight: spacing.md },
//   categoryPill: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: spacing.md,
//     paddingVertical: spacing.xs,
//     borderRadius: radius.pill,
//     borderWidth: 1,
//     gap: spacing.xs,
//   },
//   categoryIcon: { width: 20, height: 20, borderRadius: 10 },
//   categoryLabel: { fontSize: 13 },
//   productList: { gap: spacing.sm, paddingRight: spacing.md },
//   productCard: {
//     width: 160,
//     borderRadius: radius.xl,
//     borderWidth: 1,
//     overflow: "hidden",
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.06,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   productImage: { width: "100%", height: 120 },
//   productInfo: { padding: spacing.sm, gap: 3 },
//   productName: { fontSize: 13, fontWeight: "700", lineHeight: 18 },
//   productCategory: { fontSize: 11 },
//   productPrice: { fontSize: 14, fontWeight: "800" },
//   errorText: { fontSize: 14, textAlign: "center" },
//   retryBtn: {
//     paddingHorizontal: spacing.lg,
//     paddingVertical: spacing.xs,
//     borderRadius: radius.pill,
//     borderWidth: 1.5,
//     marginTop: spacing.sm,
//   },
//   retryText: { fontSize: 14, fontWeight: "700" },
//   emptyProducts: { minHeight: 200 },
//   emptyHeading: { fontSize: 17, fontWeight: "700", textAlign: "center" },
//   emptySubtext: { fontSize: 14, textAlign: "center", lineHeight: 20 },
// });

// import { Ionicons } from "@expo/vector-icons";
// import { Image } from "expo-image";
// import { router } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import { useRef, useState } from "react";
// import {
//   ActivityIndicator,
//   Dimensions,
//   FlatList,
//   Pressable,
//   RefreshControl,
//   ScrollView,
//   StyleSheet,
//   Text,
//   View,
//   type ViewToken,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// import { useAuthStore } from "@/features/auth/store/auth.store";
// import { useHomeData } from "@/features/home/hooks/use-home-data";
// import { radius, shadows, spacing, useTheme } from "@/theme";
// import type { CategoryDto, ProductDto } from "@/types/api";

// const { width: SCREEN_W } = Dimensions.get("window");
// const BANNER_HEIGHT = 150;
// const BANNER_WIDTH = SCREEN_W - spacing.md * 2;

// export default function HomeTab() {
//   const { colors } = useTheme();
//   const insets = useSafeAreaInsets();
//   const user = useAuthStore((s) => s.user);
//   const address = (user as any)?.address as string | undefined;

//   const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
//   const [activeBanner, setActiveBanner] = useState(0);
//   const bannerListRef = useRef<FlatList>(null);

//   const {
//     categories,
//     featuredProducts,
//     navBanners,
//     specialProducts,
//     trendingProducts,
//     isLoading,
//     isRefreshing,
//     error,
//     refetch,
//   } = useHomeData(selectedCategory);

//   const onViewableItemsChanged = useRef(
//     ({ viewableItems }: { viewableItems: ViewToken[] }) => {
//       if (viewableItems[0]?.index != null) {
//         setActiveBanner(viewableItems[0].index);
//       }
//     },
//   ).current;

//   if (isLoading) {
//     return (
//       <View style={[styles.center, { backgroundColor: colors.background }]}>
//         <ActivityIndicator color={colors.primary} size="large" />
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={[styles.center, { backgroundColor: colors.background }]}>
//         <Ionicons name="warning-outline" size={44} color={colors.error} />
//         <Text style={[styles.errorText, { color: colors.error }]}>
//           Failed to load home. Check your connection.
//         </Text>
//         <Pressable
//           onPress={refetch}
//           style={[styles.retryBtn, { borderColor: colors.primary }]}
//         >
//           <Text style={[styles.retryText, { color: colors.primary }]}>
//             Retry
//           </Text>
//         </Pressable>
//       </View>
//     );
//   }

//   const sections = [
//     ...(trendingProducts.length > 0
//       ? [{ title: "Trending", data: trendingProducts }]
//       : []),
//     ...(specialProducts.length > 0
//       ? [{ title: "Special picks", data: specialProducts }]
//       : []),
//     ...(featuredProducts.length > 0
//       ? [
//           {
//             title: selectedCategory ? "Filtered products" : "Popular products",
//             data: featuredProducts,
//           },
//         ]
//       : []),
//   ];

//   return (
//     <View style={[styles.root, { backgroundColor: colors.background }]}>
//       <StatusBar style="light" />
//       <View style={{ height: insets.top, backgroundColor: colors.primary }} />

//       <ScrollView
//         contentContainerStyle={[
//           styles.scrollContent,
//           { paddingBottom: insets.bottom + 90 },
//         ]}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={isRefreshing}
//             onRefresh={refetch}
//             colors={[colors.primary]}
//             tintColor={colors.primary}
//           />
//         }
//       >
//         {/* Header */}
//         <View style={styles.header}>
//           <View style={styles.headerLeft}>
//             <Text style={[styles.greeting, { color: colors.text }]}>
//               Hello {user?.fullName ?? "Guest"}
//             </Text>
//             <View style={styles.locationRow}>
//               <Ionicons
//                 name="location-outline"
//                 size={14}
//                 color={colors.textSecondary}
//               />
//               <Text
//                 numberOfLines={1}
//                 style={[styles.locationText, { color: colors.textSecondary }]}
//               >
//                 {address ?? "Add your delivery address"}
//               </Text>
//             </View>
//           </View>

//           <View style={styles.headerActions}>
//             <Pressable
//               style={[
//                 styles.iconBtn,
//                 { backgroundColor: colors.surface, ...shadows.sm },
//               ]}
//               onPress={() => router.push("/(tabs)/cart")}
//             >
//               <Ionicons name="cart-outline" size={20} color={colors.text} />
//               {/* TODO: show only when cart has items (wire to cart store count) */}
//               <View style={[styles.badge, { backgroundColor: colors.error }]} />
//             </Pressable>

//             <Pressable
//               style={[
//                 styles.iconBtn,
//                 { backgroundColor: colors.surface, ...shadows.sm },
//               ]}
//               onPress={() => router.push("/notifications")}
//             >
//               <Ionicons
//                 name="notifications-outline"
//                 size={20}
//                 color={colors.text}
//               />
//             </Pressable>
//           </View>
//         </View>

//         {/* Search + filter */}
//         <View style={styles.searchRow}>
//           <Pressable
//             style={[
//               styles.searchBar,
//               { backgroundColor: colors.surface, ...shadows.sm },
//             ]}
//             onPress={() => router.push("/(tabs)/search")}
//           >
//             <Ionicons
//               name="search-outline"
//               size={18}
//               color={colors.textMuted}
//             />
//             <Text
//               style={[styles.searchPlaceholder, { color: colors.textMuted }]}
//             >
//               Search here...
//             </Text>
//           </Pressable>
//           <Pressable
//             style={[styles.filterBtn, { backgroundColor: colors.primary }]}
//             onPress={() => router.push("/(tabs)/search")}
//           >
//             <Ionicons name="options-outline" size={20} color={colors.white} />
//           </Pressable>
//         </View>

//         {/* Promo banner */}
//         {navBanners.length > 0 ? (
//           <View style={styles.bannerSection}>
//             <FlatList
//               ref={bannerListRef}
//               data={navBanners}
//               horizontal
//               pagingEnabled
//               showsHorizontalScrollIndicator={false}
//               keyExtractor={(item) => String(item.BannerId)}
//               onViewableItemsChanged={onViewableItemsChanged}
//               viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
//               getItemLayout={(_, index) => ({
//                 length: BANNER_WIDTH,
//                 offset: BANNER_WIDTH * index,
//                 index,
//               })}
//               renderItem={({ item }) => (
//                 <Image
//                   source={{ uri: item.BannerImageUrl }}
//                   style={[styles.bannerImage, { width: BANNER_WIDTH }]}
//                   contentFit="cover"
//                   transition={300}
//                 />
//               )}
//             />
//             {navBanners.length > 1 ? (
//               <View style={styles.bannerDots}>
//                 {navBanners.map((_, index) => (
//                   <View
//                     key={index}
//                     style={[
//                       styles.bannerDot,
//                       {
//                         backgroundColor:
//                           index === activeBanner
//                             ? colors.primary
//                             : colors.border,
//                         width: index === activeBanner ? 20 : 6,
//                       },
//                     ]}
//                   />
//                 ))}
//               </View>
//             ) : null}
//           </View>
//         ) : null}

//         {/* Category tiles */}
//         {categories.length > 0 ? (
//           <FlatList
//             horizontal
//             data={categories}
//             keyExtractor={(item) => String(item.CategoryId)}
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.categoryList}
//             renderItem={({ item }: { item: CategoryDto }) => {
//               const isActive = selectedCategory === item.CategoryId;
//               return (
//                 <Pressable
//                   style={styles.categoryTile}
//                   onPress={() =>
//                     setSelectedCategory(isActive ? null : item.CategoryId)
//                   }
//                 >
//                   <View
//                     style={[
//                       styles.categoryIconBox,
//                       {
//                         backgroundColor: colors.surface,
//                         borderColor: isActive ? colors.primary : colors.border,
//                         ...shadows.sm,
//                       },
//                     ]}
//                   >
//                     {item.ImageUrl ? (
//                       <Image
//                         source={{ uri: item.ImageUrl }}
//                         style={styles.categoryIcon}
//                         contentFit="contain"
//                       />
//                     ) : (
//                       <Ionicons
//                         name="fast-food-outline"
//                         size={24}
//                         color={colors.primary}
//                       />
//                     )}
//                   </View>
//                   <Text
//                     numberOfLines={1}
//                     style={[
//                       styles.categoryLabel,
//                       {
//                         color: isActive ? colors.primary : colors.text,
//                         fontWeight: isActive ? "700" : "500",
//                       },
//                     ]}
//                   >
//                     {item.CategoryName}
//                   </Text>
//                 </Pressable>
//               );
//             }}
//           />
//         ) : null}

//         {/* Product sections */}
//         {sections.length === 0 ? (
//           <View style={[styles.emptyProducts, styles.center]}>
//             <Ionicons
//               name="basket-outline"
//               size={48}
//               color={colors.textMuted}
//             />
//             <Text style={[styles.emptyHeading, { color: colors.text }]}>
//               No products yet
//             </Text>
//             <Text
//               style={[styles.emptySubtext, { color: colors.textSecondary }]}
//             >
//               Products will appear here once they are added.
//             </Text>
//           </View>
//         ) : (
//           sections.map((section) => (
//             <View key={section.title} style={styles.sectionBlock}>
//               <View style={styles.sectionHeader}>
//                 <Text style={[styles.sectionTitle, { color: colors.text }]}>
//                   {section.title}
//                 </Text>
//                 <Pressable onPress={() => router.push("/(tabs)/search")}>
//                   <Text
//                     style={[styles.viewAll, { color: colors.textSecondary }]}
//                   >
//                     View all
//                   </Text>
//                 </Pressable>
//               </View>

//               <FlatList
//                 horizontal
//                 data={section.data}
//                 keyExtractor={(item: ProductDto) => String(item.ProductId)}
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={styles.productList}
//                 renderItem={({ item }: { item: ProductDto }) => {
//                   const rating =
//                     (item as any).Rating ?? (item as any).AvgRating;
//                   const reviews =
//                     (item as any).ReviewCount ?? (item as any).TotalReviews;
//                   return (
//                     <Pressable
//                       onPress={() => router.push(`/product/${item.ProductId}`)}
//                       style={[
//                         styles.productCard,
//                         { backgroundColor: colors.surface, ...shadows.sm },
//                       ]}
//                     >
//                       <Image
//                         source={
//                           item.ImageUrl
//                             ? { uri: item.ImageUrl }
//                             : require("../../assets/images/logo.png")
//                         }
//                         style={styles.productImage}
//                         contentFit="cover"
//                         transition={200}
//                       />
//                       <View style={styles.productInfo}>
//                         <Text
//                           numberOfLines={1}
//                           style={[styles.productName, { color: colors.text }]}
//                         >
//                           {item.ProductName}
//                         </Text>
//                         {rating != null ? (
//                           <View style={styles.ratingRow}>
//                             <Ionicons
//                               name="star"
//                               size={13}
//                               color={colors.warning}
//                             />
//                             <Text
//                               style={[
//                                 styles.ratingText,
//                                 { color: colors.textSecondary },
//                               ]}
//                             >
//                               {rating}
//                               {reviews != null ? ` | ${reviews} review` : ""}
//                             </Text>
//                           </View>
//                         ) : null}
//                         <Text
//                           style={[
//                             styles.productPrice,
//                             { color: colors.primary },
//                           ]}
//                         >
//                           ₹{item.Price.toFixed(2)}
//                         </Text>
//                       </View>
//                     </Pressable>
//                   );
//                 }}
//               />
//             </View>
//           ))
//         )}
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   root: { flex: 1 },
//   scrollContent: {
//     paddingHorizontal: spacing.md,
//     paddingTop: spacing.sm,
//     gap: spacing.lg,
//   },
//   center: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: spacing.sm,
//     paddingHorizontal: spacing.xl,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   headerLeft: { flex: 1, marginRight: spacing.sm },
//   greeting: { fontSize: 20, fontWeight: "800" },
//   locationRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     columnGap: 4,
//     marginTop: 2,
//   },
//   locationText: { fontSize: 13, flexShrink: 1 },
//   headerActions: { flexDirection: "row", columnGap: spacing.xs },
//   iconBtn: {
//     width: 44,
//     height: 44,
//     borderRadius: radius.md,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   badge: {
//     position: "absolute",
//     top: 9,
//     right: 10,
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//   },
//   searchRow: { flexDirection: "row", columnGap: spacing.xs },
//   searchBar: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     columnGap: spacing.xs,
//     height: 48,
//     borderRadius: radius.md,
//     paddingHorizontal: spacing.md,
//   },
//   searchPlaceholder: { fontSize: 14 },
//   filterBtn: {
//     width: 48,
//     height: 48,
//     borderRadius: radius.md,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   bannerSection: { gap: spacing.xs },
//   bannerImage: { height: BANNER_HEIGHT, borderRadius: radius.xl },
//   bannerDots: {
//     flexDirection: "row",
//     justifyContent: "center",
//     gap: 5,
//   },
//   bannerDot: { height: 6, borderRadius: radius.pill },
//   categoryList: { gap: spacing.md, paddingRight: spacing.md },
//   categoryTile: { alignItems: "center", width: 64, gap: 6 },
//   categoryIconBox: {
//     width: 60,
//     height: 60,
//     borderRadius: radius.lg,
//     borderWidth: 1.5,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   categoryIcon: { width: 34, height: 34 },
//   categoryLabel: { fontSize: 12, textAlign: "center" },
//   sectionBlock: { gap: spacing.sm },
//   sectionHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   sectionTitle: { fontSize: 18, fontWeight: "800" },
//   viewAll: { fontSize: 13, fontWeight: "600" },
//   productList: { gap: spacing.sm, paddingRight: spacing.md },
//   productCard: {
//     width: 160,
//     borderRadius: radius.xl,
//     overflow: "hidden",
//   },
//   productImage: { width: "100%", height: 120 },
//   productInfo: { padding: spacing.sm, gap: 4 },
//   productName: { fontSize: 14, fontWeight: "700" },
//   ratingRow: { flexDirection: "row", alignItems: "center", columnGap: 4 },
//   ratingText: { fontSize: 12 },
//   productPrice: { fontSize: 15, fontWeight: "800" },
//   errorText: { fontSize: 14, textAlign: "center" },
//   retryBtn: {
//     paddingHorizontal: spacing.lg,
//     paddingVertical: spacing.xs,
//     borderRadius: radius.pill,
//     borderWidth: 1.5,
//     marginTop: spacing.sm,
//   },
//   retryText: { fontSize: 14, fontWeight: "700" },
//   emptyProducts: { minHeight: 200 },
//   emptyHeading: { fontSize: 17, fontWeight: "700", textAlign: "center" },
//   emptySubtext: { fontSize: 14, textAlign: "center", lineHeight: 20 },
// });

// import { Ionicons } from "@expo/vector-icons";
// import { Image } from "expo-image";
// import { router } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import { useCallback, useEffect, useRef, useState } from "react";
// import {
//   ActivityIndicator,
//   Dimensions,
//   FlatList,
//   NativeScrollEvent,
//   NativeSyntheticEvent,
//   Pressable,
//   RefreshControl,
//   ScrollView,
//   StyleSheet,
//   Text,
//   View,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// import { useAuthStore } from "@/features/auth/store/auth.store";
// import { useCartStore } from "@/features/cart/store/cart.store";
// import { useHomeData } from "@/features/home/hooks/use-home-data";
// import { radius, shadows, spacing, useTheme } from "@/theme";
// import type { CategoryDto, ProductDto } from "@/types/api";

// const { width: SCREEN_W } = Dimensions.get("window");
// const BANNER_HEIGHT = 150;
// const BANNER_WIDTH = SCREEN_W - spacing.md * 2;
// const BANNER_AUTO_PLAY_MS = 4500;

// export default function HomeTab() {
//   const { colors } = useTheme();
//   const insets = useSafeAreaInsets();
//   const user = useAuthStore((s) => s.user);
//   const address = (user as any)?.address as string | undefined;
//   const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.qty, 0));

//   const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
//   const [activeBanner, setActiveBanner] = useState(0);

//   const bannerScrollRef = useRef<ScrollView>(null);
//   const bannerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const bannerIndexRef = useRef(0);
//   const isUserScrollingRef = useRef(false);

//   const {
//     categories,
//     featuredProducts,
//     navBanners,
//     specialProducts,
//     trendingProducts,
//     isLoading,
//     isRefreshing,
//     error,
//     refetch,
//   } = useHomeData(selectedCategory);

//   const startBannerTimer = useCallback(() => {
//     if (bannerTimerRef.current) clearInterval(bannerTimerRef.current);
//     if (navBanners.length <= 1) return;

//     bannerTimerRef.current = setInterval(() => {
//       if (isUserScrollingRef.current) return;
//       const nextIndex =
//         bannerIndexRef.current >= navBanners.length - 1
//           ? 0
//           : bannerIndexRef.current + 1;
//       bannerScrollRef.current?.scrollTo({
//         x: BANNER_WIDTH * nextIndex,
//         animated: true,
//       });
//       bannerIndexRef.current = nextIndex;
//       setActiveBanner(nextIndex);
//     }, BANNER_AUTO_PLAY_MS);
//   }, [navBanners.length]);

//   useEffect(() => {
//     startBannerTimer();
//     return () => {
//       if (bannerTimerRef.current) clearInterval(bannerTimerRef.current);
//     };
//   }, [startBannerTimer]);

//   const handleBannerScrollEnd = useCallback(
//     (e: NativeSyntheticEvent<NativeScrollEvent>) => {
//       const offsetX = e.nativeEvent.contentOffset.x;
//       const index = Math.round(offsetX / BANNER_WIDTH);
//       const clampedIndex = Math.max(0, Math.min(index, navBanners.length - 1));
//       bannerIndexRef.current = clampedIndex;
//       setActiveBanner(clampedIndex);
//       isUserScrollingRef.current = false;
//       startBannerTimer();
//     },
//     [navBanners.length, startBannerTimer],
//   );

//   const handleBannerScrollBegin = useCallback(() => {
//     isUserScrollingRef.current = true;
//   }, []);

//   const sections = [
//     ...(trendingProducts.length > 0
//       ? [{ title: "Trending", data: trendingProducts }]
//       : []),
//     ...(specialProducts.length > 0
//       ? [{ title: "Special picks", data: specialProducts }]
//       : []),
//     ...(featuredProducts.length > 0
//       ? [
//           {
//             title: selectedCategory ? "Filtered products" : "Popular products",
//             data: featuredProducts,
//           },
//         ]
//       : []),
//   ];

//   if (isLoading) {
//     return (
//       <View
//         style={[
//           styles.center,
//           { backgroundColor: colors.background, paddingTop: insets.top },
//         ]}
//       >
//         <ActivityIndicator color={colors.primary} size="large" />
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View
//         style={[
//           styles.center,
//           { backgroundColor: colors.background, paddingTop: insets.top },
//         ]}
//       >
//         <Ionicons name="warning-outline" size={44} color={colors.error} />
//         <Text style={[styles.errorText, { color: colors.error }]}>
//           Failed to load home. Check your connection.
//         </Text>
//         <Pressable
//           onPress={refetch}
//           style={[styles.retryBtn, { borderColor: colors.primary }]}
//         >
//           <Text style={[styles.retryText, { color: colors.primary }]}>
//             Retry
//           </Text>
//         </Pressable>
//       </View>
//     );
//   }

//   return (
//     <View style={[styles.root, { backgroundColor: colors.background }]}>
//       <StatusBar style="light" />
//       <View style={{ height: insets.top, backgroundColor: colors.primary }} />

//       <ScrollView
//         contentContainerStyle={[
//           styles.scrollContent,
//           { paddingBottom: insets.bottom + 90 },
//         ]}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={isRefreshing}
//             onRefresh={refetch}
//             colors={[colors.primary]}
//             tintColor={colors.primary}
//           />
//         }
//       >
//         {/* Header */}
//         <View style={styles.header}>
//           <View style={styles.headerLeft}>
//             <Text style={[styles.greeting, { color: colors.text }]}>
//               Hello {user?.fullName ?? "Guest"} 👋
//             </Text>
//             <Pressable
//               style={styles.locationRow}
//               onPress={() => router.push("/(tabs)/profile")}
//             >
//               <Ionicons
//                 name="location-outline"
//                 size={14}
//                 color={colors.textSecondary}
//               />
//               <Text
//                 numberOfLines={1}
//                 style={[styles.locationText, { color: colors.textSecondary }]}
//               >
//                 {address ?? "Add your delivery address"}
//               </Text>
//               <Ionicons
//                 name="chevron-down"
//                 size={12}
//                 color={colors.textMuted}
//               />
//             </Pressable>
//           </View>

//           <View style={styles.headerActions}>
//             <Pressable
//               style={[
//                 styles.iconBtn,
//                 { backgroundColor: colors.surface, ...shadows.sm },
//               ]}
//               onPress={() => router.push("/(tabs)/cart")}
//             >
//               <Ionicons name="cart-outline" size={20} color={colors.text} />
//               {cartCount > 0 ? (
//                 <View style={[styles.badge, { backgroundColor: colors.error }]}>
//                   <Text style={styles.badgeText}>{cartCount}</Text>
//                 </View>
//               ) : null}
//             </Pressable>

//             <Pressable
//               style={[
//                 styles.iconBtn,
//                 { backgroundColor: colors.surface, ...shadows.sm },
//               ]}
//               onPress={() => router.push("/notifications" as any)}
//             >
//               <Ionicons
//                 name="notifications-outline"
//                 size={20}
//                 color={colors.text}
//               />
//             </Pressable>
//           </View>
//         </View>

//         {/* Search + filter */}
//         <View style={styles.searchRow}>
//           <Pressable
//             style={[
//               styles.searchBar,
//               { backgroundColor: colors.surface, ...shadows.sm },
//             ]}
//             onPress={() => router.push("/(tabs)/search")}
//           >
//             <Ionicons
//               name="search-outline"
//               size={18}
//               color={colors.textMuted}
//             />
//             <Text
//               style={[styles.searchPlaceholder, { color: colors.textMuted }]}
//             >
//               Search here...
//             </Text>
//           </Pressable>
//           <Pressable
//             style={[styles.filterBtn, { backgroundColor: colors.primary }]}
//             onPress={() => router.push("/(tabs)/search")}
//           >
//             <Ionicons name="options-outline" size={20} color={colors.white} />
//           </Pressable>
//         </View>

//         {/* Banners */}
//         {navBanners.length > 0 ? (
//           <View style={styles.bannerSection}>
//             <ScrollView
//               ref={bannerScrollRef}
//               horizontal
//               pagingEnabled
//               showsHorizontalScrollIndicator={false}
//               scrollEventThrottle={16}
//               decelerationRate="fast"
//               onScrollBeginDrag={handleBannerScrollBegin}
//               onMomentumScrollEnd={handleBannerScrollEnd}
//               style={styles.bannerScroll}
//             >
//               {navBanners.map((item) => (
//                 <Image
//                   key={String(item.BannerId)}
//                   source={{ uri: item.BannerImageUrl }}
//                   style={styles.bannerImage}
//                   contentFit="cover"
//                   transition={600}
//                 />
//               ))}
//             </ScrollView>

//             {navBanners.length > 1 ? (
//               <View style={styles.bannerDots}>
//                 {navBanners.map((_, index) => (
//                   <View
//                     key={index}
//                     style={[
//                       styles.bannerDot,
//                       {
//                         backgroundColor:
//                           index === activeBanner
//                             ? colors.primary
//                             : colors.border,
//                         width: index === activeBanner ? 20 : 6,
//                       },
//                     ]}
//                   />
//                 ))}
//               </View>
//             ) : null}
//           </View>
//         ) : null}

//         {/* Categories */}
//         {categories.length > 0 ? (
//           <FlatList
//             horizontal
//             data={categories}
//             keyExtractor={(item) => String(item.CategoryId)}
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.categoryList}
//             renderItem={({ item }: { item: CategoryDto }) => {
//               const isActive = selectedCategory === item.CategoryId;
//               return (
//                 <Pressable
//                   style={styles.categoryTile}
//                   onPress={() =>
//                     setSelectedCategory(isActive ? null : item.CategoryId)
//                   }
//                 >
//                   <View
//                     style={[
//                       styles.categoryIconBox,
//                       {
//                         backgroundColor: isActive
//                           ? colors.primary
//                           : colors.surface,
//                         borderColor: isActive ? colors.primary : colors.border,
//                         ...shadows.sm,
//                       },
//                     ]}
//                   >
//                     {item.ImageUrl ? (
//                       <Image
//                         source={{ uri: item.ImageUrl }}
//                         style={styles.categoryIcon}
//                         contentFit="contain"
//                       />
//                     ) : (
//                       <Ionicons
//                         name="fast-food-outline"
//                         size={24}
//                         color={isActive ? colors.white : colors.primary}
//                       />
//                     )}
//                   </View>
//                   <Text
//                     numberOfLines={1}
//                     style={[
//                       styles.categoryLabel,
//                       {
//                         color: isActive ? colors.primary : colors.text,
//                         fontWeight: isActive ? "700" : "500",
//                       },
//                     ]}
//                   >
//                     {item.CategoryName}
//                   </Text>
//                 </Pressable>
//               );
//             }}
//           />
//         ) : null}

//         {/* Products */}
//         {sections.length === 0 ? (
//           <View style={[styles.emptyProducts, styles.center]}>
//             <Ionicons
//               name="basket-outline"
//               size={48}
//               color={colors.textMuted}
//             />
//             <Text style={[styles.emptyHeading, { color: colors.text }]}>
//               No products yet
//             </Text>
//             <Text
//               style={[styles.emptySubtext, { color: colors.textSecondary }]}
//             >
//               Products will appear here once they are added.
//             </Text>
//           </View>
//         ) : (
//           sections.map((section) => (
//             <View key={section.title} style={styles.sectionBlock}>
//               <View style={styles.sectionHeader}>
//                 <Text style={[styles.sectionTitle, { color: colors.text }]}>
//                   {section.title}
//                 </Text>
//                 <Pressable onPress={() => router.push("/(tabs)/search")}>
//                   <Text
//                     style={[styles.viewAll, { color: colors.textSecondary }]}
//                   >
//                     View all
//                   </Text>
//                 </Pressable>
//               </View>

//               <FlatList
//                 horizontal
//                 data={section.data}
//                 keyExtractor={(item: ProductDto) => String(item.ProductId)}
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={styles.productList}
//                 renderItem={({ item }: { item: ProductDto }) => {
//                   const rating =
//                     (item as any).Rating ?? (item as any).AvgRating;
//                   const reviews =
//                     (item as any).ReviewCount ?? (item as any).TotalReviews;
//                   return (
//                     <Pressable
//                       onPress={() =>
//                         router.push(`/product/${item.ProductId}` as any)
//                       }
//                       style={[
//                         styles.productCard,
//                         { backgroundColor: colors.surface, ...shadows.sm },
//                       ]}
//                     >
//                       <Image
//                         source={
//                           item.ImageUrl
//                             ? { uri: item.ImageUrl }
//                             : require("../../assets/images/sweet1.png")
//                         }
//                         style={styles.productImage}
//                         contentFit="cover"
//                         transition={200}
//                       />
//                       <View style={styles.productInfo}>
//                         <Text
//                           numberOfLines={1}
//                           style={[styles.productName, { color: colors.text }]}
//                         >
//                           {item.ProductName}
//                         </Text>
//                         {rating != null ? (
//                           <View style={styles.ratingRow}>
//                             <Ionicons
//                               name="star"
//                               size={12}
//                               color={colors.warning}
//                             />
//                             <Text
//                               style={[
//                                 styles.ratingText,
//                                 { color: colors.textSecondary },
//                               ]}
//                             >
//                               {rating}
//                               {reviews != null ? ` (${reviews})` : ""}
//                             </Text>
//                           </View>
//                         ) : null}
//                         <Text
//                           style={[
//                             styles.productPrice,
//                             { color: colors.primary },
//                           ]}
//                         >
//                           ₹{item.Price.toFixed(2)}
//                         </Text>
//                       </View>
//                     </Pressable>
//                   );
//                 }}
//               />
//             </View>
//           ))
//         )}
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   root: { flex: 1 },
//   scrollContent: {
//     paddingHorizontal: spacing.md,
//     paddingTop: spacing.sm,
//     gap: spacing.lg,
//   },
//   center: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: spacing.sm,
//     paddingHorizontal: spacing.xl,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   headerLeft: { flex: 1, marginRight: spacing.sm },
//   greeting: { fontSize: 20, fontWeight: "800" },
//   locationRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     columnGap: 4,
//     marginTop: 2,
//   },
//   locationText: { fontSize: 13, flexShrink: 1 },
//   headerActions: { flexDirection: "row", columnGap: spacing.xs },
//   iconBtn: {
//     width: 44,
//     height: 44,
//     borderRadius: radius.md,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   badge: {
//     position: "absolute",
//     top: 4,
//     right: 4,
//     minWidth: 16,
//     height: 16,
//     borderRadius: 8,
//     paddingHorizontal: 3,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
//   searchRow: { flexDirection: "row", columnGap: spacing.xs },
//   searchBar: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     columnGap: spacing.xs,
//     height: 48,
//     borderRadius: radius.md,
//     paddingHorizontal: spacing.md,
//   },
//   searchPlaceholder: { fontSize: 14 },
//   filterBtn: {
//     width: 48,
//     height: 48,
//     borderRadius: radius.md,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   bannerSection: { gap: spacing.xs },
//   bannerScroll: { borderRadius: radius.xl, overflow: "hidden" },
//   bannerImage: {
//     width: BANNER_WIDTH,
//     height: BANNER_HEIGHT,
//     borderRadius: radius.xl,
//   },
//   bannerDots: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 5,
//   },
//   bannerDot: { height: 6, borderRadius: radius.pill },
//   categoryList: { gap: spacing.md, paddingRight: spacing.md },
//   categoryTile: { alignItems: "center", width: 64, gap: 6 },
//   categoryIconBox: {
//     width: 60,
//     height: 60,
//     borderRadius: radius.lg,
//     borderWidth: 1.5,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   categoryIcon: { width: 34, height: 34 },
//   categoryLabel: { fontSize: 12, textAlign: "center" },
//   sectionBlock: { gap: spacing.sm },
//   sectionHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   sectionTitle: { fontSize: 18, fontWeight: "800" },
//   viewAll: { fontSize: 13, fontWeight: "600" },
//   productList: { gap: spacing.sm, paddingRight: spacing.md },
//   productCard: { width: 160, borderRadius: radius.xl, overflow: "hidden" },
//   productImage: { width: "100%", height: 120 },
//   productInfo: { padding: spacing.sm, gap: 4 },
//   productName: { fontSize: 14, fontWeight: "700" },
//   ratingRow: { flexDirection: "row", alignItems: "center", columnGap: 4 },
//   ratingText: { fontSize: 12 },
//   productPrice: { fontSize: 15, fontWeight: "800" },
//   errorText: { fontSize: 14, textAlign: "center" },
//   retryBtn: {
//     paddingHorizontal: spacing.lg,
//     paddingVertical: spacing.xs,
//     borderRadius: radius.pill,
//     borderWidth: 1.5,
//     marginTop: spacing.sm,
//   },
//   retryText: { fontSize: 14, fontWeight: "700" },
//   emptyProducts: { minHeight: 200 },
//   emptyHeading: { fontSize: 17, fontWeight: "700", textAlign: "center" },
//   emptySubtext: { fontSize: 14, textAlign: "center", lineHeight: 20 },
// });
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
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
import { useHomeData } from "@/features/home/hooks/use-home-data";
import { radius, shadows, spacing, useTheme } from "@/theme";
import type { CategoryDto, ProductDto } from "@/types/api";

const { width: SCREEN_W } = Dimensions.get("window");
const BANNER_HEIGHT = 150;
const BANNER_WIDTH = SCREEN_W - spacing.md * 2;
const BANNER_AUTO_PLAY_MS = 4500;
const PRODUCT_CARD_WIDTH = 160;
const PRODUCT_IMAGE_HEIGHT = 120;

export default function HomeTab() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const address = (user as any)?.address as string | undefined;
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.qty, 0));

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [activeBanner, setActiveBanner] = useState(0);

  const bannerScrollRef = useRef<ScrollView>(null);
  const bannerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bannerIndexRef = useRef(0);
  const isUserScrollingRef = useRef(false);

  const {
    categories,
    featuredProducts,
    navBanners,
    specialProducts,
    trendingProducts,
    isLoading,
    isRefreshing,
    error,
    refetch,
  } = useHomeData(selectedCategory);

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
    }, BANNER_AUTO_PLAY_MS);
  }, [navBanners.length]);

  useEffect(() => {
    startBannerTimer();

    return () => {
      if (bannerTimerRef.current) clearInterval(bannerTimerRef.current);
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

  const sections = useMemo(
    () => [
      ...(trendingProducts.length > 0
        ? [{ title: "Trending", data: trendingProducts }]
        : []),
      ...(specialProducts.length > 0
        ? [{ title: "Special picks", data: specialProducts }]
        : []),
      ...(featuredProducts.length > 0
        ? [
            {
              title: selectedCategory
                ? "Filtered products"
                : "Popular products",
              data: featuredProducts,
            },
          ]
        : []),
    ],
    [featuredProducts, selectedCategory, specialProducts, trendingProducts],
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
              Hello {user?.fullName ?? "Guest"} 👋
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
                  <Text style={styles.badgeText}>{cartCount}</Text>
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
              {navBanners.map((item) => (
                <Image
                  key={String(item.BannerId)}
                  source={{ uri: item.BannerImageUrl }}
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

        {categories.length > 0 ? (
          <FlatList
            horizontal
            data={categories}
            keyExtractor={(item) => String(item.CategoryId)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item }: { item: CategoryDto }) => {
              const isActive = selectedCategory === item.CategoryId;

              return (
                <Pressable
                  style={styles.categoryTile}
                  onPress={() =>
                    setSelectedCategory(isActive ? null : item.CategoryId)
                  }
                >
                  <View
                    style={[
                      styles.categoryIconBox,
                      {
                        backgroundColor: isActive
                          ? colors.primary
                          : colors.surface,
                        borderColor: isActive ? colors.primary : colors.border,
                        ...shadows.sm,
                      },
                    ]}
                  >
                    {item.ImageUrl ? (
                      <Image
                        source={{ uri: item.ImageUrl }}
                        style={styles.categoryIcon}
                        contentFit="contain"
                      />
                    ) : (
                      <Ionicons
                        name="fast-food-outline"
                        size={24}
                        color={isActive ? colors.white : colors.primary}
                      />
                    )}
                  </View>

                  <Text
                    numberOfLines={1}
                    style={[
                      styles.categoryLabel,
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

                <Pressable onPress={() => router.push("/(tabs)/search")}>
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
                keyExtractor={(item: ProductDto) => String(item.ProductId)}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productList}
                renderItem={({ item }: { item: ProductDto }) => {
                  const rating =
                    (item as any).Rating ?? (item as any).AvgRating;
                  const reviews =
                    (item as any).ReviewCount ?? (item as any).TotalReviews;

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
                      <Image
                        source={
                          item.ImageUrl
                            ? { uri: item.ImageUrl }
                            : require("../../assets/images/sweet1.png")
                        }
                        style={styles.productImage}
                        contentFit="cover"
                        transition={200}
                      />

                      <View style={styles.productInfo}>
                        <View style={styles.nameBlock}>
                          <Text
                            numberOfLines={2}
                            style={[styles.productName, { color: colors.text }]}
                          >
                            {item.ProductName}
                          </Text>
                        </View>

                        <View style={styles.metaBlock}>
                          {rating != null ? (
                            <View style={styles.ratingRow}>
                              <Ionicons
                                name="star"
                                size={12}
                                color={colors.warning}
                              />
                              <Text
                                numberOfLines={1}
                                style={[
                                  styles.ratingText,
                                  { color: colors.textSecondary },
                                ]}
                              >
                                {rating}
                                {reviews != null ? ` (${reviews})` : ""}
                              </Text>
                            </View>
                          ) : (
                            <View style={styles.ratingPlaceholder}>
                              <Text
                                style={[
                                  styles.ratingText,
                                  { color: colors.textMuted },
                                ]}
                              >
                                No reviews yet
                              </Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.priceRow}>
                          <Text
                            style={[
                              styles.productPrice,
                              { color: colors.primary },
                            ]}
                          >
                            ₹{Number(item.Price ?? 0).toFixed(2)}
                          </Text>

                          <Pressable
                            style={[
                              styles.addBtn,
                              { backgroundColor: colors.primary },
                            ]}
                          >
                            <Ionicons
                              name="add"
                              size={16}
                              color={colors.white}
                            />
                          </Pressable>
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
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  locationText: {
    fontSize: 13,
    flexShrink: 1,
    marginHorizontal: 4,
  },
  headerActions: {
    flexDirection: "row",
  },
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
  searchRow: {
    flexDirection: "row",
  },
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
  bannerDot: { height: 6, borderRadius: radius.pill },
  categoryList: {
    paddingRight: spacing.md,
  },
  categoryTile: {
    alignItems: "center",
    width: 68,
    marginRight: spacing.md,
  },
  categoryIconBox: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryIcon: { width: 34, height: 34 },
  categoryLabel: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
  },
  sectionBlock: { gap: spacing.sm },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { fontSize: 18, fontWeight: "800" },
  viewAll: { fontSize: 13, fontWeight: "600" },
  productList: {
    paddingRight: spacing.md,
  },
  productCard: {
    width: PRODUCT_CARD_WIDTH,
    borderRadius: radius.xl,
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  productImage: {
    width: "100%",
    height: PRODUCT_IMAGE_HEIGHT,
    borderRadius: radius.lg,
  },
  productInfo: {
    paddingHorizontal: 4,
    paddingTop: spacing.xs,
  },
  nameBlock: {
    minHeight: 40,
    justifyContent: "flex-start",
  },
  metaBlock: {
    minHeight: 20,
    justifyContent: "center",
    marginTop: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingPlaceholder: {
    justifyContent: "center",
    minHeight: 16,
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  priceRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "800",
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: { fontSize: 14, textAlign: "center" },
  retryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    marginTop: spacing.sm,
  },
  retryText: { fontSize: 14, fontWeight: "700" },
  emptyProducts: { minHeight: 200 },
  emptyHeading: { fontSize: 17, fontWeight: "700", textAlign: "center" },
  emptySubtext: { fontSize: 14, textAlign: "center", lineHeight: 20 },
});
