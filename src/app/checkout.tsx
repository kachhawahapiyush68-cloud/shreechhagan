// import { Ionicons } from "@expo/vector-icons";
// import { router, useLocalSearchParams } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import { useMemo, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   View,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// import { useCartStore } from "@/features/cart/store/cart.store";
// import { usePlaceOrderMutation } from "@/features/orders/hooks/use-orders";
// import { radius, spacing, useTheme } from "@/theme";
// import type { PlaceOrderItem } from "@/types/api";

// export default function CheckoutRoute() {
//   const { colors } = useTheme();
//   const insets = useSafeAreaInsets();
//   const { coupon } = useLocalSearchParams<{ coupon?: string }>();

//   const items = useCartStore((s) => s.items);
//   const clearCart = useCartStore((s) => s.clearCart);
//   const placeOrder = usePlaceOrderMutation();

//   const [remarks, setRemarks] = useState("");

//   const subtotal = useMemo(
//     () => items.reduce((s, i) => s + i.price * i.qty, 0),
//     [items],
//   );

//   const handlePlace = async () => {
//     if (items.length === 0) return;

//     // NOTE: ItemId here = productPriceId (the priced unit/SKU). If your
//     // backend expects the ProductId instead, switch to i.productId.
//     const payloadItems: PlaceOrderItem[] = items.map((i) => ({
//       ItemId: i.productPriceId,
//       Qty: i.qty,
//       Rate: i.price,
//       Remark: "",
//     }));

//     try {
//       const result = await placeOrder.mutateAsync({
//         items: payloadItems,
//         couponCode: coupon || undefined,
//         remarks: remarks.trim() || undefined,
//       });

//       if (!result || result.Success !== 1) {
//         Alert.alert(
//           "Order failed",
//           "We couldn't place your order. Please try again.",
//         );
//         return;
//       }

//       clearCart();
//       router.replace(`/order/${result.OrderId}` as any);
//     } catch {
//       Alert.alert(
//         "Order failed",
//         "Something went wrong while placing your order.",
//       );
//     }
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
//           Checkout
//         </Text>
//         <View style={{ width: 24 }} />
//       </View>

//       <ScrollView
//         contentContainerStyle={styles.content}
//         showsVerticalScrollIndicator={false}
//       >
//         <Text style={[styles.sectionTitle, { color: colors.text }]}>
//           Order items
//         </Text>
//         {items.map((i) => (
//           <View
//             key={`${i.productId}-${i.productPriceId}`}
//             style={[styles.itemRow, { borderColor: colors.border }]}
//           >
//             <Text
//               numberOfLines={1}
//               style={[styles.itemName, { color: colors.text }]}
//             >
//               {i.productName} ({i.unitName}) × {i.qty}
//             </Text>
//             <Text style={[styles.itemPrice, { color: colors.text }]}>
//               ₹{(i.price * i.qty).toFixed(2)}
//             </Text>
//           </View>
//         ))}

//         {coupon ? (
//           <View
//             style={[
//               styles.couponChip,
//               { backgroundColor: colors.success + "1A" },
//             ]}
//           >
//             <Ionicons name="pricetag" size={14} color={colors.success} />
//             <Text style={[styles.couponText, { color: colors.success }]}>
//               Coupon {coupon} will be applied
//             </Text>
//           </View>
//         ) : null}

//         <Text
//           style={[
//             styles.sectionTitle,
//             { color: colors.text, marginTop: spacing.lg },
//           ]}
//         >
//           Remarks
//         </Text>
//         <TextInput
//           value={remarks}
//           onChangeText={setRemarks}
//           placeholder="Any note for your order (optional)"
//           placeholderTextColor={colors.textMuted}
//           multiline
//           style={[
//             styles.remarks,
//             {
//               color: colors.text,
//               borderColor: colors.border,
//               backgroundColor: colors.surface,
//             },
//           ]}
//         />

//         <View style={[styles.summary, { borderColor: colors.border }]}>
//           <View style={styles.summaryRow}>
//             <Text
//               style={[styles.summaryLabel, { color: colors.textSecondary }]}
//             >
//               Items subtotal
//             </Text>
//             <Text style={[styles.summaryValue, { color: colors.text }]}>
//               ₹{subtotal.toFixed(2)}
//             </Text>
//           </View>
//           <Text style={[styles.note, { color: colors.textMuted }]}>
//             Final total {coupon ? "and coupon discount " : ""}are confirmed by
//             the server after you place the order.
//           </Text>
//         </View>
//       </ScrollView>

//       <View
//         style={[
//           styles.bottomBar,
//           {
//             paddingBottom: insets.bottom + spacing.sm,
//             backgroundColor: colors.background,
//           },
//         ]}
//       >
//         <Pressable
//           style={({ pressed }) => [
//             styles.placeBtn,
//             {
//               backgroundColor: pressed ? colors.primaryPressed : colors.primary,
//               opacity: items.length === 0 ? 0.6 : 1,
//             },
//           ]}
//           onPress={handlePlace}
//           disabled={items.length === 0 || placeOrder.isPending}
//         >
//           {placeOrder.isPending ? (
//             <ActivityIndicator color={colors.white} />
//           ) : (
//             <Text style={[styles.placeText, { color: colors.white }]}>
//               Place order
//             </Text>
//           )}
//         </Pressable>
//       </View>
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
//   content: { paddingHorizontal: spacing.md, paddingBottom: 120 },
//   sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: spacing.sm },
//   itemRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: spacing.sm,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//   },
//   itemName: { fontSize: 14, flex: 1, marginRight: spacing.sm },
//   itemPrice: { fontSize: 14, fontWeight: "700" },
//   couponChip: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     alignSelf: "flex-start",
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: radius.pill,
//     marginTop: spacing.md,
//   },
//   couponText: { fontSize: 12, fontWeight: "700" },
//   remarks: {
//     minHeight: 80,
//     borderWidth: 1,
//     borderRadius: radius.lg,
//     padding: spacing.md,
//     fontSize: 15,
//     textAlignVertical: "top",
//   },
//   summary: {
//     marginTop: spacing.lg,
//     borderWidth: 1,
//     borderRadius: radius.lg,
//     padding: spacing.md,
//     gap: spacing.sm,
//   },
//   summaryRow: { flexDirection: "row", justifyContent: "space-between" },
//   summaryLabel: { fontSize: 14 },
//   summaryValue: { fontSize: 15, fontWeight: "800" },
//   note: { fontSize: 12, lineHeight: 18 },
//   bottomBar: {
//     position: "absolute",
//     left: 0,
//     right: 0,
//     bottom: 0,
//     paddingHorizontal: spacing.md,
//     paddingTop: spacing.sm,
//   },
//   placeBtn: {
//     height: 54,
//     borderRadius: radius.lg,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   placeText: { fontSize: 16, fontWeight: "700" },
// });
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAddressesQuery } from "@/features/address/hooks/use-address";
import { useCartStore } from "@/features/cart/store/cart.store";
import { usePlaceOrderMutation } from "@/features/orders/hooks/use-orders";
import { radius, shadows, spacing, useTheme } from "@/theme";
import type { AddressDto, PlaceOrderItem } from "@/types/api";

export default function CheckoutRoute() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    coupon?: string | string[];
    discount?: string | string[];
  }>();

  const rawCoupon = Array.isArray(params.coupon)
    ? params.coupon[0]
    : params.coupon;
  const couponCode = rawCoupon?.trim() ? rawCoupon.trim() : undefined;

  const rawDiscount = Array.isArray(params.discount)
    ? params.discount[0]
    : params.discount;
  const couponDiscount = rawDiscount ? Number(rawDiscount) || 0 : 0;

  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const placeOrder = usePlaceOrderMutation();

  const {
    data: addresses = [],
    isLoading: addressesLoading,
    refetch: refetchAddresses,
  } = useAddressesQuery();

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [remarks, setRemarks] = useState("");

  const hasCheckedInitialCartRef = useRef(false);
  const hasPlacedOrderRef = useRef(false);

  useEffect(() => {
    if (hasCheckedInitialCartRef.current) return;
    hasCheckedInitialCartRef.current = true;

    if (items.length === 0) {
      Alert.alert("Cart is empty", "Please add items before checkout.", [
        {
          text: "Go to cart",
          onPress: () => router.replace("/(tabs)/cart"),
        },
      ]);
    }
  }, [items.length]);

  useEffect(() => {
    if (selectedAddressId == null && addresses.length > 0) {
      const defaultAddress = addresses.find((a: AddressDto) => a.IsDefault);
      setSelectedAddressId((defaultAddress ?? addresses[0]).AddressId);
    }
  }, [addresses, selectedAddressId]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [items],
  );

  const currentTotal = Math.max(0, subtotal - couponDiscount);

  const handlePlace = async () => {
    if (items.length === 0) {
      Alert.alert("Cart is empty", "Please add items before placing an order.");
      return;
    }

    if (!selectedAddressId) {
      Alert.alert(
        "Address needed",
        "Please select a delivery address. You can add one from Profile → Saved Addresses.",
      );
      return;
    }

    const payloadItems: PlaceOrderItem[] = items.map((item) => ({
      ItemId: item.productPriceId,
      Qty: item.qty,
      Rate: item.price,
      Remark: "",
    }));

    try {
      const result = await placeOrder.mutateAsync({
        items: payloadItems,
        addressId: selectedAddressId,
        couponCode,
        remarks: remarks.trim() || undefined,
      });

      if (!result || result.Success !== 1) {
        Alert.alert(
          "Order failed",
          "We couldn't place your order. Please try again.",
        );
        return;
      }

      hasPlacedOrderRef.current = true;
      clearCart();
      router.replace(`/order/${result.OrderId}` as any);
    } catch {
      Alert.alert(
        "Order failed",
        "Something went wrong while placing your order.",
      );
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
          Checkout
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Delivery address
        </Text>

        {addressesLoading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : addresses.length === 0 ? (
          <View style={styles.addressEmptyWrap}>
            <Pressable
              style={[styles.addAddress, { borderColor: colors.primary }]}
              onPress={() => router.push("/(tabs)/profile")}
            >
              <Ionicons name="add" size={18} color={colors.primary} />
              <Text style={[styles.addAddressText, { color: colors.primary }]}>
                Add a delivery address
              </Text>
            </Pressable>

            <Pressable onPress={() => refetchAddresses()}>
              <Text style={[styles.retryText, { color: colors.textMuted }]}>
                Refresh addresses
              </Text>
            </Pressable>
          </View>
        ) : (
          addresses.map((address: AddressDto) => {
            const active = address.AddressId === selectedAddressId;

            return (
              <Pressable
                key={address.AddressId}
                onPress={() => setSelectedAddressId(address.AddressId)}
                style={[
                  styles.addressCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                    ...shadows.sm,
                  },
                ]}
              >
                <Ionicons
                  name={active ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color={active ? colors.primary : colors.textMuted}
                />

                <View style={styles.addressBody}>
                  <Text style={[styles.addressType, { color: colors.text }]}>
                    {address.AddressType}
                    {address.IsDefault ? "  •  Default" : ""}
                  </Text>

                  <Text
                    numberOfLines={2}
                    style={[
                      styles.addressText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {address.FullAddress}, {address.City}
                    {address.PinCode ? ` - ${address.PinCode}` : ""}
                  </Text>
                </View>
              </Pressable>
            );
          })
        )}

        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text, marginTop: spacing.lg },
          ]}
        >
          Order items
        </Text>

        {items.map((item) => (
          <View
            key={`${item.productId}-${item.productPriceId}`}
            style={[styles.itemRow, { borderColor: colors.border }]}
          >
            <Text
              numberOfLines={1}
              style={[styles.itemName, { color: colors.text }]}
            >
              {item.productName} ({item.unitName}) × {item.qty}
            </Text>

            <Text style={[styles.itemPrice, { color: colors.text }]}>
              ₹{(item.price * item.qty).toFixed(2)}
            </Text>
          </View>
        ))}

        {couponCode ? (
          <View
            style={[
              styles.couponChip,
              { backgroundColor: `${colors.success}1A` },
            ]}
          >
            <Ionicons name="pricetag" size={14} color={colors.success} />
            <Text style={[styles.couponText, { color: colors.success }]}>
              Coupon {couponCode} will be applied
            </Text>
          </View>
        ) : null}

        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text, marginTop: spacing.lg },
          ]}
        >
          Remarks
        </Text>

        <TextInput
          value={remarks}
          onChangeText={setRemarks}
          placeholder="Any note for your order (optional)"
          placeholderTextColor={colors.textMuted}
          multiline
          style={[
            styles.remarks,
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.surface,
            },
          ]}
        />

        <View style={[styles.summary, { borderColor: colors.border }]}>
          <View style={styles.summaryRow}>
            <Text
              style={[styles.summaryLabel, { color: colors.textSecondary }]}
            >
              Items subtotal
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              ₹{subtotal.toFixed(2)}
            </Text>
          </View>

          {couponCode ? (
            <View style={styles.summaryRow}>
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                Coupon discount
              </Text>
              <Text style={[styles.summaryValue, { color: colors.success }]}>
                -₹{couponDiscount.toFixed(2)}
              </Text>
            </View>
          ) : null}

          <View style={[styles.dashed, { borderColor: colors.border }]} />

          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              Current total
            </Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>
              ₹{currentTotal.toFixed(2)}
            </Text>
          </View>

          <Text style={[styles.note, { color: colors.textMuted }]}>
            Delivery charges and final total are confirmed by the server after
            you place the order.
          </Text>
        </View>
      </ScrollView>

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
            styles.placeBtn,
            {
              backgroundColor: pressed ? colors.primaryPressed : colors.primary,
              opacity: items.length === 0 ? 0.6 : 1,
            },
          ]}
          onPress={handlePlace}
          disabled={items.length === 0 || placeOrder.isPending}
        >
          {placeOrder.isPending ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={[styles.placeText, { color: colors.white }]}>
              Place order
            </Text>
          )}
        </Pressable>
      </View>
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
  content: { paddingHorizontal: spacing.md, paddingBottom: 120 },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: spacing.sm },
  loaderWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
  },
  addressEmptyWrap: {
    gap: spacing.sm,
  },
  addAddress: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  addAddressText: { fontSize: 14, fontWeight: "700" },
  retryText: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  addressBody: { flex: 1, gap: 2 },
  addressType: { fontSize: 14, fontWeight: "700" },
  addressText: { fontSize: 13, lineHeight: 18 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemName: { fontSize: 14, flex: 1, marginRight: spacing.sm },
  itemPrice: { fontSize: 14, fontWeight: "700" },
  couponChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginTop: spacing.md,
  },
  couponText: { fontSize: 12, fontWeight: "700" },
  remarks: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    fontSize: 15,
    textAlignVertical: "top",
  },
  summary: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 15, fontWeight: "800" },
  dashed: {
    borderTopWidth: 1,
    borderStyle: "dashed",
    marginVertical: spacing.xs,
  },
  totalLabel: { fontSize: 16, fontWeight: "800" },
  totalValue: { fontSize: 18, fontWeight: "800" },
  note: { fontSize: 12, lineHeight: 18 },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  placeBtn: {
    height: 54,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  placeText: { fontSize: 16, fontWeight: "700" },
});
