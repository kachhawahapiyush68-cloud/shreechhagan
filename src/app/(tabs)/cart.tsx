// import { Ionicons } from "@expo/vector-icons";
// import { Image } from "expo-image";
// import { router } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import { useMemo, useState } from "react";
// import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// import { radius, shadows, spacing, useTheme } from "@/theme";

// type CartItem = {
//   id: string;
//   name: string;
//   price: number;
//   qty: number;
//   image: string;
//   subtitle: string;
// };

// const INITIAL_CART: CartItem[] = [
//   {
//     id: "1",
//     name: "Chocolate Truffle Cake",
//     price: 549,
//     qty: 1,
//     subtitle: "500g • Eggless",
//     image:
//       "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1200&auto=format&fit=crop",
//   },
//   {
//     id: "2",
//     name: "Butter Croissant",
//     price: 79,
//     qty: 2,
//     subtitle: "Freshly baked",
//     image:
//       "https://images.unsplash.com/photo-1555507036-ab794f4afe5a?q=80&w=1200&auto=format&fit=crop",
//   },
// ];

// export default function CartTab() {
//   const { colors } = useTheme();
//   const insets = useSafeAreaInsets();
//   const [items, setItems] = useState<CartItem[]>(INITIAL_CART);

//   const updateQty = (id: string, type: "inc" | "dec") => {
//     setItems((prev) =>
//       prev
//         .map((item) => {
//           if (item.id !== id) return item;
//           const nextQty = type === "inc" ? item.qty + 1 : item.qty - 1;
//           return { ...item, qty: nextQty };
//         })
//         .filter((item) => item.qty > 0),
//     );
//   };

//   const subtotal = useMemo(
//     () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
//     [items],
//   );
//   const deliveryFee = items.length > 0 ? 40 : 0;
//   const tax = subtotal * 0.05;
//   const total = subtotal + deliveryFee + tax;

//   return (
//     <View style={[styles.root, { backgroundColor: colors.background }]}>
//       <StatusBar style="auto" />
//       <View style={{ height: insets.top, backgroundColor: colors.primary }} />

//       <View style={[styles.header, { borderBottomColor: colors.border }]}>
//         <Pressable onPress={() => router.back()} style={styles.backBtn}>
//           <Ionicons name="arrow-left" size={22} color={colors.text} />
//         </Pressable>
//         <Text style={[styles.headerTitle, { color: colors.text }]}>
//           My Cart
//         </Text>
//         <View style={styles.backBtn} />
//       </View>

//       {items.length === 0 ? (
//         <View style={styles.emptyWrap}>
//           <View
//             style={[
//               styles.emptyIconWrap,
//               { backgroundColor: colors.surface, ...shadows.sm },
//             ]}
//           >
//             <Ionicons name="cart-outline" size={42} color={colors.textMuted} />
//           </View>
//           <Text style={[styles.emptyTitle, { color: colors.text }]}>
//             Your cart is empty
//           </Text>
//           <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
//             Add some delicious items to get started.
//           </Text>
//           <Pressable
//             style={[styles.shopBtn, { backgroundColor: colors.primary }]}
//             onPress={() => router.push("/(tabs)/home" as any)}
//           >
//             <Text style={[styles.shopBtnText, { color: colors.white }]}>
//               Start shopping
//             </Text>
//           </Pressable>
//         </View>
//       ) : (
//         <>
//           <FlatList
//             data={items}
//             keyExtractor={(item) => item.id}
//             contentContainerStyle={[
//               styles.listContent,
//               { paddingBottom: insets.bottom + 220 },
//             ]}
//             ItemSeparatorComponent={() => (
//               <View style={{ height: spacing.sm }} />
//             )}
//             renderItem={({ item }) => (
//               <View
//                 style={[
//                   styles.cartCard,
//                   {
//                     backgroundColor: colors.surface,
//                     borderColor: colors.border,
//                     ...shadows.sm,
//                   },
//                 ]}
//               >
//                 <Image
//                   source={{ uri: item.image }}
//                   style={styles.itemImage}
//                   contentFit="cover"
//                   transition={200}
//                 />

//                 <View style={styles.itemInfo}>
//                   <Text
//                     numberOfLines={1}
//                     style={[styles.itemName, { color: colors.text }]}
//                   >
//                     {item.name}
//                   </Text>
//                   <Text
//                     numberOfLines={1}
//                     style={[
//                       styles.itemSubtitle,
//                       { color: colors.textSecondary },
//                     ]}
//                   >
//                     {item.subtitle}
//                   </Text>
//                   <Text style={[styles.itemPrice, { color: colors.primary }]}>
//                     ₹{item.price.toFixed(2)}
//                   </Text>
//                 </View>

//                 <View style={styles.qtyWrap}>
//                   <Pressable
//                     style={[
//                       styles.qtyBtn,
//                       {
//                         backgroundColor: colors.surfaceSecondary,
//                         borderColor: colors.border,
//                       },
//                     ]}
//                     onPress={() => updateQty(item.id, "dec")}
//                   >
//                     <Ionicons name="remove" size={16} color={colors.text} />
//                   </Pressable>

//                   <Text style={[styles.qtyText, { color: colors.text }]}>
//                     {item.qty}
//                   </Text>

//                   <Pressable
//                     style={[
//                       styles.qtyBtn,
//                       {
//                         backgroundColor: colors.primary,
//                         borderColor: colors.primary,
//                       },
//                     ]}
//                     onPress={() => updateQty(item.id, "inc")}
//                   >
//                     <Ionicons name="add" size={16} color={colors.white} />
//                   </Pressable>
//                 </View>
//               </View>
//             )}
//           />

//           <View
//             style={[
//               styles.summaryWrap,
//               {
//                 backgroundColor: colors.background,
//                 borderTopColor: colors.border,
//                 paddingBottom: insets.bottom + spacing.md,
//               },
//             ]}
//           >
//             <View
//               style={[
//                 styles.summaryCard,
//                 {
//                   backgroundColor: colors.surface,
//                   borderColor: colors.border,
//                   ...shadows.sm,
//                 },
//               ]}
//             >
//               <View style={styles.summaryRow}>
//                 <Text
//                   style={[styles.summaryLabel, { color: colors.textSecondary }]}
//                 >
//                   Subtotal
//                 </Text>
//                 <Text style={[styles.summaryValue, { color: colors.text }]}>
//                   ₹{subtotal.toFixed(2)}
//                 </Text>
//               </View>

//               <View style={styles.summaryRow}>
//                 <Text
//                   style={[styles.summaryLabel, { color: colors.textSecondary }]}
//                 >
//                   Delivery Fee
//                 </Text>
//                 <Text style={[styles.summaryValue, { color: colors.text }]}>
//                   ₹{deliveryFee.toFixed(2)}
//                 </Text>
//               </View>

//               <View style={styles.summaryRow}>
//                 <Text
//                   style={[styles.summaryLabel, { color: colors.textSecondary }]}
//                 >
//                   Taxes
//                 </Text>
//                 <Text style={[styles.summaryValue, { color: colors.text }]}>
//                   ₹{tax.toFixed(2)}
//                 </Text>
//               </View>

//               <View
//                 style={[styles.totalRow, { borderTopColor: colors.border }]}
//               >
//                 <Text style={[styles.totalLabel, { color: colors.text }]}>
//                   Total
//                 </Text>
//                 <Text style={[styles.totalValue, { color: colors.primary }]}>
//                   ₹{total.toFixed(2)}
//                 </Text>
//               </View>

//               <Pressable
//                 style={[
//                   styles.checkoutBtn,
//                   { backgroundColor: colors.primary },
//                 ]}
//               >
//                 <Text style={[styles.checkoutText, { color: colors.white }]}>
//                   Proceed to Checkout
//                 </Text>
//               </Pressable>
//             </View>
//           </View>
//         </>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   root: { flex: 1 },
//   header: {
//     height: 56,
//     paddingHorizontal: spacing.md,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     borderBottomWidth: 1,
//   },
//   backBtn: {
//     width: 36,
//     height: 36,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: "800",
//   },
//   listContent: {
//     padding: spacing.md,
//   },
//   cartCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderRadius: radius.xl,
//     borderWidth: 1,
//     padding: spacing.sm,
//   },
//   itemImage: {
//     width: 84,
//     height: 84,
//     borderRadius: radius.lg,
//   },
//   itemInfo: {
//     flex: 1,
//     marginHorizontal: spacing.sm,
//   },
//   itemName: {
//     fontSize: 15,
//     fontWeight: "700",
//   },
//   itemSubtitle: {
//     fontSize: 12,
//     marginTop: 4,
//   },
//   itemPrice: {
//     fontSize: 15,
//     fontWeight: "800",
//     marginTop: spacing.sm,
//   },
//   qtyWrap: {
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   qtyBtn: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     borderWidth: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   qtyText: {
//     fontSize: 15,
//     fontWeight: "700",
//     marginVertical: 8,
//   },
//   summaryWrap: {
//     position: "absolute",
//     left: 0,
//     right: 0,
//     bottom: 0,
//     borderTopWidth: 1,
//     paddingHorizontal: spacing.md,
//     paddingTop: spacing.sm,
//   },
//   summaryCard: {
//     borderRadius: radius.xl,
//     borderWidth: 1,
//     padding: spacing.md,
//   },
//   summaryRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: spacing.sm,
//   },
//   summaryLabel: {
//     fontSize: 14,
//   },
//   summaryValue: {
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   totalRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     borderTopWidth: 1,
//     marginTop: spacing.xs,
//     paddingTop: spacing.sm,
//   },
//   totalLabel: {
//     fontSize: 16,
//     fontWeight: "700",
//   },
//   totalValue: {
//     fontSize: 18,
//     fontWeight: "800",
//   },
//   checkoutBtn: {
//     height: 50,
//     borderRadius: radius.lg,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: spacing.md,
//   },
//   checkoutText: {
//     fontSize: 15,
//     fontWeight: "800",
//   },
//   emptyWrap: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: spacing.xl,
//   },
//   emptyIconWrap: {
//     width: 96,
//     height: 96,
//     borderRadius: 48,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: spacing.md,
//   },
//   emptyTitle: {
//     fontSize: 20,
//     fontWeight: "800",
//   },
//   emptySub: {
//     fontSize: 14,
//     textAlign: "center",
//     marginTop: spacing.xs,
//     marginBottom: spacing.lg,
//   },
//   shopBtn: {
//     height: 48,
//     paddingHorizontal: spacing.xl,
//     borderRadius: radius.lg,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   shopBtnText: {
//     fontSize: 15,
//     fontWeight: "800",
//   },
// });

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCartStore } from "@/features/cart/store/cart.store";
import { radius, shadows, spacing, useTheme } from "@/theme";

const SHIPPING_FEE = 40;
// TODO: replace with real promo validation from your API.
const DEMO_PROMO = "HDK7854SUNDAY";
const DEMO_DISCOUNT = 20;

export default function CartTab() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const items = useCartStore((s) => s.items);
  const increaseQty = useCartStore((s) => s.increaseQty);
  const decreaseQty = useCartStore((s) => s.decreaseQty);
  const removeItem = useCartStore((s) => s.removeItem);

  const [promo, setPromo] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.qty, 0),
    [items],
  );
  const shipping = items.length > 0 ? SHIPPING_FEE : 0;
  const discount = appliedPromo ? DEMO_DISCOUNT : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const applyPromo = () => {
    const code = promo.trim().toUpperCase();
    if (!code) return;
    if (code === DEMO_PROMO) {
      setAppliedPromo(code);
    } else {
      setAppliedPromo(null);
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
          My cart
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: colors.surface, ...shadows.sm },
            ]}
          >
            <Ionicons name="cart-outline" size={42} color={colors.textMuted} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Your cart is empty
          </Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            Add some items to get started.
          </Text>
          <Pressable
            style={[styles.shopBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)/home")}
          >
            <Text style={[styles.shopBtnText, { color: colors.white }]}>
              Start shopping
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.productId)}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: spacing.md },
            ]}
            ItemSeparatorComponent={() => (
              <View style={{ height: spacing.sm }} />
            )}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <View>
                {/* Promocode */}
                <Text style={[styles.blockLabel, { color: colors.text }]}>
                  Enter promocode
                </Text>
                <View
                  style={[
                    styles.promoRow,
                    {
                      backgroundColor: colors.surface,
                      borderColor: appliedPromo
                        ? colors.success
                        : colors.border,
                    },
                  ]}
                >
                  <TextInput
                    value={promo}
                    onChangeText={(t) => {
                      setPromo(t);
                      if (appliedPromo) setAppliedPromo(null);
                    }}
                    placeholder="Promocode"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="characters"
                    style={[styles.promoInput, { color: colors.text }]}
                  />
                  <Pressable onPress={applyPromo} hitSlop={8}>
                    <Ionicons
                      name={
                        appliedPromo
                          ? "checkmark-circle"
                          : "arrow-forward-circle"
                      }
                      size={26}
                      color={appliedPromo ? colors.success : colors.primary}
                    />
                  </Pressable>
                </View>

                {/* Summary */}
                <View style={styles.summary}>
                  <SummaryRow
                    label="Subtotal"
                    value={subtotal}
                    colors={colors}
                  />
                  <SummaryRow
                    label="Shipping"
                    value={shipping}
                    prefix="+"
                    colors={colors}
                  />
                  <SummaryRow
                    label="Discount"
                    value={discount}
                    prefix="-"
                    colors={colors}
                  />
                  <View
                    style={[styles.dashed, { borderColor: colors.border }]}
                  />
                  <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { color: colors.text }]}>
                      Total
                    </Text>
                    <Text style={[styles.totalValue, { color: colors.text }]}>
                      ₹{total.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            }
            renderItem={({ item }) => (
              <View
                style={[
                  styles.itemCard,
                  { backgroundColor: colors.surface, ...shadows.sm },
                ]}
              >
                <Image
                  source={
                    item.imageUrl
                      ? { uri: item.imageUrl }
                      : require("../../assets/images/logo.png")
                  }
                  style={styles.itemImage}
                  contentFit="cover"
                  transition={200}
                />
                <View style={styles.itemInfo}>
                  <Text
                    numberOfLines={1}
                    style={[styles.itemName, { color: colors.text }]}
                  >
                    {item.name}
                  </Text>
                  <Text style={[styles.itemPrice, { color: colors.primary }]}>
                    ₹{item.price.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.itemActions}>
                  <View
                    style={[
                      styles.stepper,
                      { backgroundColor: colors.surfaceSecondary },
                    ]}
                  >
                    <Pressable
                      onPress={() => increaseQty(item.productId)}
                      hitSlop={6}
                      style={styles.stepBtn}
                    >
                      <Ionicons
                        name="chevron-up"
                        size={16}
                        color={colors.text}
                      />
                    </Pressable>
                    <Text style={[styles.qty, { color: colors.primary }]}>
                      {item.qty}
                    </Text>
                    <Pressable
                      onPress={() => decreaseQty(item.productId)}
                      hitSlop={6}
                      style={styles.stepBtn}
                    >
                      <Ionicons
                        name="chevron-down"
                        size={16}
                        color={colors.text}
                      />
                    </Pressable>
                  </View>
                  <Pressable
                    onPress={() => removeItem(item.productId)}
                    style={[
                      styles.trashBtn,
                      { backgroundColor: colors.surfaceSecondary },
                    ]}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={colors.error}
                    />
                  </Pressable>
                </View>
              </View>
            )}
          />

          <View
            style={[
              styles.checkoutBar,
              {
                paddingBottom: insets.bottom + spacing.sm,
                backgroundColor: colors.background,
              },
            ]}
          >
            <Pressable
              style={({ pressed }) => [
                styles.checkoutBtn,
                {
                  backgroundColor: pressed
                    ? colors.primaryPressed
                    : colors.primary,
                },
              ]}
              // TODO: build checkout flow; routes to a screen we make next.
              onPress={() => router.push("/checkout")}
            >
              <Text style={[styles.checkoutText, { color: colors.white }]}>
                Checkout
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

function SummaryRow({
  label,
  value,
  prefix = "",
  colors,
}: {
  label: string;
  value: number;
  prefix?: string;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.summaryValue, { color: colors.text }]}>
        {prefix}₹{value.toFixed(2)}
      </Text>
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
  listContent: { paddingHorizontal: spacing.md, paddingTop: spacing.xs },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.xl,
    padding: spacing.sm,
    columnGap: spacing.sm,
  },
  itemImage: { width: 72, height: 72, borderRadius: radius.lg },
  itemInfo: { flex: 1, gap: 6 },
  itemName: { fontSize: 15, fontWeight: "700" },
  itemPrice: { fontSize: 15, fontWeight: "800" },
  itemActions: { alignItems: "center", gap: spacing.xs },
  stepper: {
    borderRadius: radius.md,
    alignItems: "center",
    paddingVertical: 4,
    width: 38,
  },
  stepBtn: { paddingVertical: 3, alignItems: "center", width: "100%" },
  qty: { fontSize: 14, fontWeight: "700", paddingVertical: 2 },
  trashBtn: {
    width: 38,
    height: 32,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  blockLabel: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  promoRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
  },
  promoInput: { flex: 1, fontSize: 15 },
  summary: { marginTop: spacing.lg, gap: spacing.sm },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: "600" },
  dashed: {
    borderTopWidth: 1,
    borderStyle: "dashed",
    marginVertical: spacing.xs,
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { fontSize: 16, fontWeight: "800" },
  totalValue: { fontSize: 18, fontWeight: "800" },
  checkoutBar: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 0,
  },
  checkoutBtn: {
    height: 54,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutText: { fontSize: 16, fontWeight: "700" },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyTitle: { fontSize: 20, fontWeight: "800" },
  emptySub: {
    fontSize: 14,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  shopBtn: {
    height: 48,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  shopBtnText: { fontSize: 15, fontWeight: "800" },
});
