// // app/product/[id].tsx
// import { router, useLocalSearchParams } from "expo-router";
// import { useMemo } from "react";
// import {
//   ActivityIndicator,
//   Image,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   Text,
//   View,
// } from "react-native";

// import { useCartStore } from "@/features/cart/store/cart.store";
// import { useProductsQuery } from "@/features/home/hooks/use-home-data";
// import { colors, radius, spacing } from "@/theme";

// const fallbackImage =
//   "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1200&auto=format&fit=crop";

// export default function ProductDetailsRoute() {
//   const { id } = useLocalSearchParams<{ id: string }>();
//   const productId = Number(id);

//   const { data, isLoading } = useProductsQuery();
//   const addItem = useCartStore((s) => s.addItem);

//   const product = useMemo(
//     () => (data ?? []).find((item) => item.ProductId === productId),
//     [data, productId],
//   );

//   if (isLoading) {
//     return (
//       <View style={styles.centerState}>
//         <ActivityIndicator size="large" color={colors.light.primary} />
//       </View>
//     );
//   }

//   if (!product) {
//     return (
//       <View style={styles.centerState}>
//         <Text style={styles.notFound}>Product not found</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.root}>
//       <ScrollView contentContainerStyle={styles.content}>
//         <Image
//           source={{ uri: product.ImageUrl || fallbackImage }}
//           style={styles.heroImage}
//         />

//         <View style={styles.body}>
//           <Pressable onPress={() => router.back()} style={styles.backBtn}>
//             <Text style={styles.backBtnText}>Back</Text>
//           </Pressable>

//           <Text style={styles.title}>{product.ProductName}</Text>
//           <Text style={styles.meta}>{product.CategoryName}</Text>
//           <Text style={styles.price}>₹{product.Price}</Text>

//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Description</Text>
//             <Text style={styles.description}>
//               {product.Description?.trim() ||
//                 `${product.ProductName} is a freshly prepared bakery item from ${product.CategoryName}. This is dummy detail text until backend product description is finalized.`}
//             </Text>
//           </View>

//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Tax</Text>
//             <Text style={styles.description}>{product.TaxPercent}% GST</Text>
//           </View>
//         </View>
//       </ScrollView>

//       <View style={styles.bottomBar}>
//         <Pressable
//           style={styles.cartBtn}
//           onPress={() =>
//             addItem({
//               productId: product.ProductId,
//               name: product.ProductName,
//               price: product.Price,
//               imageUrl: product.ImageUrl || null,
//             })
//           }
//         >
//           <Text style={styles.cartBtnText}>Add to cart</Text>
//         </Pressable>

//         <Pressable
//           style={styles.buyBtn}
//           onPress={() =>
//             addItem({
//               productId: product.ProductId,
//               name: product.ProductName,
//               price: product.Price,
//               imageUrl: product.ImageUrl || null,
//             })
//           }
//         >
//           <Text style={styles.buyBtnText}>Buy now</Text>
//         </Pressable>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   root: { flex: 1, backgroundColor: colors.light.background },
//   content: { paddingBottom: 120 },
//   heroImage: { width: "100%", height: 320, backgroundColor: "#eee" },
//   body: { padding: spacing.lg },
//   backBtn: {
//     alignSelf: "flex-start",
//     marginBottom: spacing.md,
//     paddingHorizontal: spacing.md,
//     paddingVertical: spacing.sm,
//     backgroundColor: colors.light.surface,
//     borderRadius: radius.lg,
//   },
//   backBtnText: { fontWeight: "700", color: colors.light.text },
//   title: { fontSize: 26, fontWeight: "800", color: colors.light.text },
//   meta: { marginTop: 6, fontSize: 14, color: colors.light.textSecondary },
//   price: {
//     marginTop: 10,
//     fontSize: 24,
//     fontWeight: "800",
//     color: colors.light.primary,
//   },
//   section: { marginTop: spacing.xl },
//   sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.light.text },
//   description: {
//     marginTop: spacing.sm,
//     fontSize: 14,
//     lineHeight: 22,
//     color: colors.light.textSecondary,
//   },
//   bottomBar: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     flexDirection: "row",
//     gap: spacing.md,
//     padding: spacing.md,
//     backgroundColor: colors.light.background,
//   },
//   cartBtn: {
//     flex: 1,
//     borderRadius: radius.lg,
//     paddingVertical: 14,
//     alignItems: "center",
//     backgroundColor: colors.light.surface,
//   },
//   buyBtn: {
//     flex: 1,
//     borderRadius: radius.lg,
//     paddingVertical: 14,
//     alignItems: "center",
//     backgroundColor: colors.light.primary,
//   },
//   cartBtnText: { color: colors.light.text, fontWeight: "700" },
//   buyBtnText: { color: colors.light.white, fontWeight: "700" },
//   centerState: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   notFound: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: colors.light.text,
//   },
// });
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
import { useProductsQuery } from "@/features/home/hooks/use-home-data";
import { radius, shadows, spacing, useTheme } from "@/theme";

const HERO_HEIGHT = 360;

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

  const [fav, setFav] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  // TODO: replace fallback with real size data from your product/API.
  const sizes = useMemo<string[]>(() => {
    const raw = (product as any)?.Sizes ?? (product as any)?.SizeOptions;
    if (Array.isArray(raw) && raw.length) {
      return raw.map((s: any) =>
        typeof s === "string" ? s : (s?.Name ?? s?.Label ?? String(s)),
      );
    }
    return ["0.5 Kg", "1 Kg", "1.5 Kg", "2 Kg"];
  }, [product]);

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

  const rating = (product as any).Rating ?? (product as any).AvgRating;
  const reviews = (product as any).ReviewCount ?? (product as any).TotalReviews;
  const stock = (product as any).Stock ?? (product as any).Quantity;
  const description =
    product.Description?.trim() ||
    `${product.ProductName} is a freshly prepared item from ${product.CategoryName}.`;

  const handleAdd = () => {
    addItem({
      productId: product.ProductId,
      name: product.ProductName,
      price: product.Price,
      imageUrl: product.ImageUrl || null,
    });
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
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={
            product.ImageUrl
              ? { uri: product.ImageUrl }
              : require("../../assets/images/logo.png")
          }
          style={styles.hero}
          contentFit="cover"
          transition={200}
        />

        <View
          style={[
            styles.body,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]}>
              {product.ProductName}
            </Text>
            <Text style={[styles.price, { color: colors.primary }]}>
              ₹{product.Price.toFixed(2)}
            </Text>
          </View>

          <View style={styles.metaRow}>
            {rating != null ? (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={15} color={colors.warning} />
                <Text
                  style={[styles.ratingText, { color: colors.textSecondary }]}
                >
                  {rating}
                  {reviews != null ? ` | ${reviews} review` : ""}
                </Text>
              </View>
            ) : null}
          </View>

          {stock != null ? (
            <Text style={[styles.stock, { color: colors.textMuted }]}>
              {stock} left
            </Text>
          ) : null}

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Description
          </Text>
          <Text
            numberOfLines={expanded ? undefined : 4}
            style={[styles.description, { color: colors.textSecondary }]}
          >
            {description}
          </Text>
          <Pressable
            onPress={() => setExpanded((e) => !e)}
            hitSlop={8}
            style={styles.readMoreWrap}
          >
            <Text style={[styles.readMore, { color: colors.primary }]}>
              {expanded ? "Read less" : "Read more"}
            </Text>
          </Pressable>

          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text, marginTop: spacing.lg },
            ]}
          >
            Size
          </Text>
          <Pressable
            onPress={() => setSizeOpen((o) => !o)}
            style={[
              styles.dropdown,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text
              style={{
                color: selectedSize ? colors.text : colors.textMuted,
                fontSize: 15,
              }}
            >
              {selectedSize ?? "Select Size"}
            </Text>
            <Ionicons
              name={sizeOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color={colors.textSecondary}
            />
          </Pressable>

          {sizeOpen ? (
            <View
              style={[
                styles.dropdownList,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              {sizes.map((s) => (
                <Pressable
                  key={s}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedSize(s);
                    setSizeOpen(false);
                  }}
                >
                  <Text style={{ color: colors.text, fontSize: 15 }}>{s}</Text>
                  {selectedSize === s ? (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={colors.primary}
                    />
                  ) : null}
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Back + favourite overlay */}
      <Pressable
        onPress={() => router.back()}
        hitSlop={10}
        style={[
          styles.circleBtn,
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
      <Pressable
        onPress={() => setFav((f) => !f)}
        hitSlop={10}
        style={[
          styles.circleBtn,
          {
            top: insets.top + spacing.sm,
            right: spacing.md,
            backgroundColor: colors.surface,
            ...shadows.sm,
          },
        ]}
      >
        <Ionicons
          name={fav ? "heart" : "heart-outline"}
          size={22}
          color={fav ? colors.error : colors.text}
        />
      </Pressable>

      {/* Add to cart bar */}
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
          style={({ pressed }) => [
            styles.addBtn,
            {
              backgroundColor: pressed ? colors.primaryPressed : colors.primary,
            },
          ]}
          onPress={handleAdd}
        >
          <Text style={[styles.addBtnText, { color: colors.white }]}>
            Add to cart
          </Text>
        </Pressable>
      </View>

      {/* Added-to-cart modal (Image 10) */}
      <Modal
        visible={added}
        transparent
        animationType="fade"
        onRequestClose={() => setAdded(false)}
      >
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Ionicons name="cart" size={40} color={colors.primary} />
            <Text style={[styles.modalText, { color: colors.text }]}>
              Your product successfully added to cart
            </Text>
            <Pressable
              style={[styles.modalPrimary, { backgroundColor: colors.primary }]}
              onPress={() => {
                setAdded(false);
                router.push("/(tabs)/cart");
              }}
            >
              <Text style={[styles.modalPrimaryText, { color: colors.white }]}>
                Go to the cart
              </Text>
            </Pressable>
            <Pressable onPress={() => setAdded(false)} hitSlop={8}>
              <Text style={[styles.modalStay, { color: colors.primary }]}>
                Stay here
              </Text>
            </Pressable>
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
    marginTop: -24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  title: { fontSize: 22, fontWeight: "800", flex: 1, marginRight: spacing.md },
  price: { fontSize: 22, fontWeight: "800" },
  metaRow: { marginTop: spacing.xs },
  ratingRow: { flexDirection: "row", alignItems: "center", columnGap: 5 },
  ratingText: { fontSize: 13 },
  stock: { fontSize: 13, marginTop: 4 },
  sectionTitle: { fontSize: 17, fontWeight: "800", marginTop: spacing.lg },
  description: { fontSize: 14, lineHeight: 22, marginTop: spacing.sm },
  readMoreWrap: { alignSelf: "flex-end", marginTop: 4 },
  readMore: { fontSize: 13, fontWeight: "700" },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  dropdownList: {
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.xs,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  circleBtn: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 4,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  addBtn: {
    height: 54,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: { fontSize: 16, fontWeight: "700" },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  modalCard: {
    width: "100%",
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
  },
  modalText: { fontSize: 16, fontWeight: "700", textAlign: "center" },
  modalPrimary: {
    alignSelf: "stretch",
    height: 50,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  modalPrimaryText: { fontSize: 15, fontWeight: "700" },
  modalStay: { fontSize: 14, fontWeight: "700" },
});
