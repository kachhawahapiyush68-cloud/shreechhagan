import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { useCartStore } from "@/features/cart/store/cart.store";
import { validateCoupon } from "@/features/coupons/api/coupons.api";
import { radius, shadows, spacing, useTheme } from "@/theme";
import type { CouponValidationDto } from "@/types/api";

export default function CartTab() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const customerId = Number(useAuthStore((s) => s.user?.id) ?? 0);

  const items = useCartStore((s) => s.items);
  const increaseQty = useCartStore((s) => s.increaseQty);
  const decreaseQty = useCartStore((s) => s.decreaseQty);
  const removeItem = useCartStore((s) => s.removeItem);

  const [promo, setPromo] = useState("");
  const [coupon, setCoupon] = useState<CouponValidationDto | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [items],
  );

  const discount = coupon?.DiscountAmount ?? 0;
  const payableNow = Math.max(0, subtotal - discount);
  const effectiveCouponCode = (
    coupon?.CouponCode ?? promo.trim()
  ).toUpperCase();

  useEffect(() => {
    if (items.length === 0) {
      setCoupon(null);
      setPromoError(null);
      setPromo("");
    }
  }, [items.length]);

  const applyPromo = async () => {
    const code = promo.trim().toUpperCase();
    if (!code) return;

    if (subtotal <= 0) {
      setPromoError("Add items to your cart before applying a coupon.");
      return;
    }

    if (!customerId) {
      setPromoError("Please log in to apply a coupon.");
      return;
    }

    try {
      setValidating(true);
      setPromoError(null);

      const result = await validateCoupon({
        couponCode: code,
        orderAmount: subtotal,
        customerId,
      });

      if (result.ok) {
        setCoupon(result.coupon);
        setPromo(code);
      } else {
        setCoupon(null);
        setPromoError(result.message || "Invalid or inactive coupon.");
      }
    } catch {
      setCoupon(null);
      setPromoError("Couldn't validate coupon. Try again.");
    } finally {
      setValidating(false);
    }
  };

  const clearPromo = () => {
    setCoupon(null);
    setPromoError(null);
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
            keyExtractor={(item) => `${item.productId}-${item.productPriceId}`}
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
                <Text style={[styles.blockLabel, { color: colors.text }]}>
                  Enter promocode
                </Text>

                <View
                  style={[
                    styles.promoRow,
                    {
                      backgroundColor: colors.surface,
                      borderColor: coupon ? colors.success : colors.border,
                    },
                  ]}
                >
                  <TextInput
                    value={promo}
                    onChangeText={(text) => {
                      const next = text.toUpperCase();
                      setPromo(next);
                      if (coupon || promoError) clearPromo();
                    }}
                    placeholder="Promocode"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    editable={!validating}
                    style={[styles.promoInput, { color: colors.text }]}
                  />
                  {validating ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Pressable onPress={applyPromo} hitSlop={8}>
                      <Ionicons
                        name={
                          coupon ? "checkmark-circle" : "arrow-forward-circle"
                        }
                        size={26}
                        color={coupon ? colors.success : colors.primary}
                      />
                    </Pressable>
                  )}
                </View>

                {promoError ? (
                  <Text style={[styles.promoError, { color: colors.error }]}>
                    {promoError}
                  </Text>
                ) : coupon ? (
                  <Text style={[styles.promoOk, { color: colors.success }]}>
                    {effectiveCouponCode} applied — you save ₹
                    {coupon.DiscountAmount.toFixed(2)}
                  </Text>
                ) : null}

                <View style={styles.summary}>
                  <SummaryRow
                    label="Items subtotal"
                    value={subtotal}
                    colors={colors}
                  />

                  {discount > 0 ? (
                    <SummaryRow
                      label="Coupon discount"
                      value={discount}
                      prefix="-"
                      colors={colors}
                    />
                  ) : null}

                  <View
                    style={[styles.dashed, { borderColor: colors.border }]}
                  />

                  <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { color: colors.text }]}>
                      Current total
                    </Text>
                    <Text style={[styles.totalValue, { color: colors.text }]}>
                      ₹{payableNow.toFixed(2)}
                    </Text>
                  </View>

                  <Text
                    style={[styles.summaryNote, { color: colors.textMuted }]}
                  >
                    Delivery charges and final total will be confirmed by the
                    server during checkout.
                  </Text>
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
                      : require("../../assets/images/sweet1.png")
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
                    {item.productName}
                  </Text>
                  <Text
                    style={[styles.itemUnit, { color: colors.textSecondary }]}
                  >
                    Size : {item.unitName}
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
                      onPress={() =>
                        increaseQty(item.productId, item.productPriceId)
                      }
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
                      onPress={() =>
                        decreaseQty(item.productId, item.productPriceId)
                      }
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
                    onPress={() =>
                      removeItem(item.productId, item.productPriceId)
                    }
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
              onPress={() =>
                router.push({
                  pathname: "/checkout",
                  params: {
                    coupon: effectiveCouponCode || undefined,
                    discount: discount > 0 ? String(discount) : undefined,
                  },
                })
              }
            >
              <Text style={[styles.checkoutText, { color: colors.white }]}>
                Proceed to checkout
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
  itemInfo: { flex: 1, gap: 3 },
  itemName: { fontSize: 15, fontWeight: "700" },
  itemUnit: { fontSize: 12 },
  itemPrice: { fontSize: 15, fontWeight: "800", marginTop: 2 },
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
  promoError: { fontSize: 12, marginTop: 6, fontWeight: "600" },
  promoOk: { fontSize: 12, marginTop: 6, fontWeight: "700" },
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
  summaryNote: { fontSize: 12, lineHeight: 18 },
  checkoutBar: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
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
// import { Ionicons } from "@expo/vector-icons";
// import { Image } from "expo-image";
// import { router } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import { useMemo, useState } from "react";
// import {
//   ActivityIndicator,
//   FlatList,
//   Pressable,
//   StyleSheet,
//   Text,
//   TextInput,
//   View,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// import { useAuthStore } from "@/features/auth/store/auth.store";
// import { useCartStore } from "@/features/cart/store/cart.store";
// import { validateCoupon } from "@/features/coupons/api/coupons.api";
// import { radius, shadows, spacing, useTheme } from "@/theme";
// import type { CouponValidationDto } from "@/types/api";

// const SHIPPING_FEE = 40;

// export default function CartTab() {
//   const { colors } = useTheme();
//   const insets = useSafeAreaInsets();

//   const customerId = Number(useAuthStore((s) => s.user?.id) ?? 0);

//   const items = useCartStore((s) => s.items);
//   const increaseQty = useCartStore((s) => s.increaseQty);
//   const decreaseQty = useCartStore((s) => s.decreaseQty);
//   const removeItem = useCartStore((s) => s.removeItem);

//   const [promo, setPromo] = useState("");
//   const [coupon, setCoupon] = useState<CouponValidationDto | null>(null);
//   const [promoError, setPromoError] = useState<string | null>(null);
//   const [validating, setValidating] = useState(false);

//   const subtotal = useMemo(
//     () => items.reduce((s, i) => s + i.price * i.qty, 0),
//     [items],
//   );
//   const shipping = items.length > 0 ? SHIPPING_FEE : 0;
//   const discount = coupon?.DiscountAmount ?? 0;
//   const total = Math.max(0, subtotal + shipping - discount);

//   const applyPromo = async () => {
//     const code = promo.trim();
//     if (!code) return;
//     if (!customerId) {
//       setPromoError("Please log in to apply a coupon.");
//       return;
//     }

//     try {
//       setValidating(true);
//       setPromoError(null);
//       const result = await validateCoupon({
//         couponCode: code,
//         orderAmount: subtotal,
//         customerId,
//       });

//       if (result.ok) {
//         setCoupon(result.coupon);
//       } else {
//         setCoupon(null);
//         setPromoError(result.message); // the server's real reason
//       }
//     } catch {
//       setCoupon(null);
//       setPromoError("Couldn't validate coupon. Try again.");
//     } finally {
//       setValidating(false);
//     }
//   };

//   const clearPromo = () => {
//     setCoupon(null);
//     setPromoError(null);
//   };

//   return (
//     <View style={[styles.root, { backgroundColor: colors.background }]}>
//       <StatusBar style="light" />
//       <View style={{ height: insets.top, backgroundColor: colors.primary }} />

//       <View style={styles.header}>
//         <Pressable
//           onPress={() => router.back()}
//           hitSlop={12}
//           style={styles.back}
//         >
//           <Ionicons name="arrow-back" size={24} color={colors.text} />
//         </Pressable>
//         <Text style={[styles.headerTitle, { color: colors.text }]}>
//           My cart
//         </Text>
//         <View style={{ width: 24 }} />
//       </View>

//       {items.length === 0 ? (
//         <View style={styles.emptyWrap}>
//           <View
//             style={[
//               styles.emptyIcon,
//               { backgroundColor: colors.surface, ...shadows.sm },
//             ]}
//           >
//             <Ionicons name="cart-outline" size={42} color={colors.textMuted} />
//           </View>
//           <Text style={[styles.emptyTitle, { color: colors.text }]}>
//             Your cart is empty
//           </Text>
//           <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
//             Add some items to get started.
//           </Text>
//           <Pressable
//             style={[styles.shopBtn, { backgroundColor: colors.primary }]}
//             onPress={() => router.push("/(tabs)/home")}
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
//             keyExtractor={(item) => `${item.productId}-${item.productPriceId}`}
//             contentContainerStyle={[
//               styles.listContent,
//               { paddingBottom: spacing.md },
//             ]}
//             ItemSeparatorComponent={() => (
//               <View style={{ height: spacing.sm }} />
//             )}
//             showsVerticalScrollIndicator={false}
//             ListFooterComponent={
//               <View>
//                 <Text style={[styles.blockLabel, { color: colors.text }]}>
//                   Enter promocode
//                 </Text>
//                 <View
//                   style={[
//                     styles.promoRow,
//                     {
//                       backgroundColor: colors.surface,
//                       borderColor: coupon ? colors.success : colors.border,
//                     },
//                   ]}
//                 >
//                   <TextInput
//                     value={promo}
//                     onChangeText={(t) => {
//                       setPromo(t);
//                       if (coupon || promoError) clearPromo();
//                     }}
//                     placeholder="Promocode"
//                     placeholderTextColor={colors.textMuted}
//                     autoCapitalize="characters"
//                     editable={!validating}
//                     style={[styles.promoInput, { color: colors.text }]}
//                   />
//                   {validating ? (
//                     <ActivityIndicator size="small" color={colors.primary} />
//                   ) : (
//                     <Pressable onPress={applyPromo} hitSlop={8}>
//                       <Ionicons
//                         name={
//                           coupon ? "checkmark-circle" : "arrow-forward-circle"
//                         }
//                         size={26}
//                         color={coupon ? colors.success : colors.primary}
//                       />
//                     </Pressable>
//                   )}
//                 </View>
//                 {promoError ? (
//                   <Text style={[styles.promoError, { color: colors.error }]}>
//                     {promoError}
//                   </Text>
//                 ) : coupon ? (
//                   <Text style={[styles.promoOk, { color: colors.success }]}>
//                     {coupon.CouponCode} applied — you save ₹
//                     {coupon.DiscountAmount.toFixed(2)}
//                   </Text>
//                 ) : null}

//                 <View style={styles.summary}>
//                   <SummaryRow
//                     label="Subtotal"
//                     value={subtotal}
//                     colors={colors}
//                   />
//                   <SummaryRow
//                     label="Shipping"
//                     value={shipping}
//                     prefix="+"
//                     colors={colors}
//                   />
//                   <SummaryRow
//                     label="Discount"
//                     value={discount}
//                     prefix="-"
//                     colors={colors}
//                   />
//                   <View
//                     style={[styles.dashed, { borderColor: colors.border }]}
//                   />
//                   <View style={styles.totalRow}>
//                     <Text style={[styles.totalLabel, { color: colors.text }]}>
//                       Total
//                     </Text>
//                     <Text style={[styles.totalValue, { color: colors.text }]}>
//                       ₹{total.toFixed(2)}
//                     </Text>
//                   </View>
//                 </View>
//               </View>
//             }
//             renderItem={({ item }) => (
//               <View
//                 style={[
//                   styles.itemCard,
//                   { backgroundColor: colors.surface, ...shadows.sm },
//                 ]}
//               >
//                 <Image
//                   source={
//                     item.imageUrl
//                       ? { uri: item.imageUrl }
//                       : require("../../assets/images/sweet1.png")
//                   }
//                   style={styles.itemImage}
//                   contentFit="cover"
//                   transition={200}
//                 />
//                 <View style={styles.itemInfo}>
//                   <Text
//                     numberOfLines={1}
//                     style={[styles.itemName, { color: colors.text }]}
//                   >
//                     {item.productName}
//                   </Text>
//                   <Text
//                     style={[styles.itemUnit, { color: colors.textSecondary }]}
//                   >
//                     Size : {item.unitName}
//                   </Text>
//                   <Text style={[styles.itemPrice, { color: colors.primary }]}>
//                     ₹{item.price.toFixed(2)}
//                   </Text>
//                 </View>

//                 <View style={styles.itemActions}>
//                   <View
//                     style={[
//                       styles.stepper,
//                       { backgroundColor: colors.surfaceSecondary },
//                     ]}
//                   >
//                     <Pressable
//                       onPress={() =>
//                         increaseQty(item.productId, item.productPriceId)
//                       }
//                       hitSlop={6}
//                       style={styles.stepBtn}
//                     >
//                       <Ionicons
//                         name="chevron-up"
//                         size={16}
//                         color={colors.text}
//                       />
//                     </Pressable>
//                     <Text style={[styles.qty, { color: colors.primary }]}>
//                       {item.qty}
//                     </Text>
//                     <Pressable
//                       onPress={() =>
//                         decreaseQty(item.productId, item.productPriceId)
//                       }
//                       hitSlop={6}
//                       style={styles.stepBtn}
//                     >
//                       <Ionicons
//                         name="chevron-down"
//                         size={16}
//                         color={colors.text}
//                       />
//                     </Pressable>
//                   </View>
//                   <Pressable
//                     onPress={() =>
//                       removeItem(item.productId, item.productPriceId)
//                     }
//                     style={[
//                       styles.trashBtn,
//                       { backgroundColor: colors.surfaceSecondary },
//                     ]}
//                   >
//                     <Ionicons
//                       name="trash-outline"
//                       size={18}
//                       color={colors.error}
//                     />
//                   </Pressable>
//                 </View>
//               </View>
//             )}
//           />

//           <View
//             style={[
//               styles.checkoutBar,
//               {
//                 paddingBottom: insets.bottom + spacing.sm,
//                 backgroundColor: colors.background,
//               },
//             ]}
//           >
//             <Pressable
//               style={({ pressed }) => [
//                 styles.checkoutBtn,
//                 {
//                   backgroundColor: pressed
//                     ? colors.primaryPressed
//                     : colors.primary,
//                 },
//               ]}
//               onPress={() =>
//                 router.push({
//                   pathname: "/checkout",
//                   params: { coupon: coupon?.CouponCode ?? "" },
//                 })
//               }
//             >
//               <Text style={[styles.checkoutText, { color: colors.white }]}>
//                 Checkout
//               </Text>
//             </Pressable>
//           </View>
//         </>
//       )}
//     </View>
//   );
// }

// function SummaryRow({
//   label,
//   value,
//   prefix = "",
//   colors,
// }: {
//   label: string;
//   value: number;
//   prefix?: string;
//   colors: ReturnType<typeof useTheme>["colors"];
// }) {
//   return (
//     <View style={styles.summaryRow}>
//       <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
//         {label}
//       </Text>
//       <Text style={[styles.summaryValue, { color: colors.text }]}>
//         {prefix}₹{value.toFixed(2)}
//       </Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   root: { flex: 1 },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: spacing.md,
//     paddingVertical: spacing.md,
//   },
//   back: { padding: 2 },
//   headerTitle: { fontSize: 20, fontWeight: "800" },
//   listContent: { paddingHorizontal: spacing.md, paddingTop: spacing.xs },
//   itemCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderRadius: radius.xl,
//     padding: spacing.sm,
//     columnGap: spacing.sm,
//   },
//   itemImage: { width: 72, height: 72, borderRadius: radius.lg },
//   itemInfo: { flex: 1, gap: 3 },
//   itemName: { fontSize: 15, fontWeight: "700" },
//   itemUnit: { fontSize: 12 },
//   itemPrice: { fontSize: 15, fontWeight: "800", marginTop: 2 },
//   itemActions: { alignItems: "center", gap: spacing.xs },
//   stepper: {
//     borderRadius: radius.md,
//     alignItems: "center",
//     paddingVertical: 4,
//     width: 38,
//   },
//   stepBtn: { paddingVertical: 3, alignItems: "center", width: "100%" },
//   qty: { fontSize: 14, fontWeight: "700", paddingVertical: 2 },
//   trashBtn: {
//     width: 38,
//     height: 32,
//     borderRadius: radius.md,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   blockLabel: {
//     fontSize: 15,
//     fontWeight: "700",
//     marginTop: spacing.lg,
//     marginBottom: spacing.sm,
//   },
//   promoRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     height: 52,
//     borderRadius: radius.md,
//     borderWidth: 1.5,
//     paddingHorizontal: spacing.md,
//   },
//   promoInput: { flex: 1, fontSize: 15 },
//   promoError: { fontSize: 12, marginTop: 6, fontWeight: "600" },
//   promoOk: { fontSize: 12, marginTop: 6, fontWeight: "700" },
//   summary: { marginTop: spacing.lg, gap: spacing.sm },
//   summaryRow: { flexDirection: "row", justifyContent: "space-between" },
//   summaryLabel: { fontSize: 14 },
//   summaryValue: { fontSize: 14, fontWeight: "600" },
//   dashed: {
//     borderTopWidth: 1,
//     borderStyle: "dashed",
//     marginVertical: spacing.xs,
//   },
//   totalRow: { flexDirection: "row", justifyContent: "space-between" },
//   totalLabel: { fontSize: 16, fontWeight: "800" },
//   totalValue: { fontSize: 18, fontWeight: "800" },
//   checkoutBar: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
//   checkoutBtn: {
//     height: 54,
//     borderRadius: radius.lg,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   checkoutText: { fontSize: 16, fontWeight: "700" },
//   emptyWrap: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: spacing.xl,
//   },
//   emptyIcon: {
//     width: 96,
//     height: 96,
//     borderRadius: 48,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: spacing.md,
//   },
//   emptyTitle: { fontSize: 20, fontWeight: "800" },
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
//   shopBtnText: { fontSize: 15, fontWeight: "800" },
// });
