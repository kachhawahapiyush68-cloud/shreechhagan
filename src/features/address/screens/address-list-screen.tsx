import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  useAddressesQuery,
  useDeleteAddressMutation,
  useUpdateAddressMutation,
} from "@/features/address/hooks/use-address";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { radius, spacing, useTheme } from "@/theme";
import type { AddressDto } from "@/types/api";

type Props = {
  onAddNew: () => void;
  onEdit: (address: AddressDto) => void;
};

export function AddressListScreen({ onAddNew, onEdit }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.user?.id);
  const customerId = userId ? Number(userId) : 0;

  const addressesQuery = useAddressesQuery();
  const deleteMutation = useDeleteAddressMutation();
  const updateMutation = useUpdateAddressMutation();

  const addresses = addressesQuery.data ?? [];

  const handleDelete = (address: AddressDto) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(address.AddressId),
        },
      ],
    );
  };

  const handleSetDefault = (address: AddressDto) => {
    if (address.IsDefault) return;
    updateMutation.mutate({
      customerId,
      addressId: address.AddressId,
      isDefault: true,
    });
  };

  if (addressesQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom + spacing.xl }]}>
      <FlatList
        data={addresses}
        keyExtractor={(item) => String(item.AddressId)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="location-outline"
              size={48}
              color={colors.textMuted}
            />
            <Text style={[styles.emptyHeading, { color: colors.text }]}>
              No saved addresses
            </Text>
            <Text
              style={[styles.emptySubtext, { color: colors.textSecondary }]}
            >
              Add a delivery address to get started.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: item.IsDefault ? colors.primary : colors.border,
                shadowColor: colors.black,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.typeBadge,
                    { backgroundColor: colors.surfaceSecondary },
                  ]}
                >
                  <Text
                    style={[styles.typeBadgeText, { color: colors.primary }]}
                  >
                    {item.AddressType}
                  </Text>
                </View>
                {item.IsDefault ? (
                  <View
                    style={[
                      styles.defaultBadge,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.actions}>
                <Pressable
                  onPress={() => onEdit(item)}
                  hitSlop={8}
                  style={styles.actionBtn}
                >
                  <Ionicons
                    name="create-outline"
                    size={18}
                    color={colors.textSecondary}
                  />
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(item)}
                  hitSlop={8}
                  style={styles.actionBtn}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={colors.error}
                  />
                </Pressable>
              </View>
            </View>

            <Text style={[styles.addressText, { color: colors.text }]}>
              {item.FullAddress}
            </Text>

            <Text style={[styles.cityText, { color: colors.textSecondary }]}>
              {[item.City, item.State, item.PinCode].filter(Boolean).join(", ")}
            </Text>

            {item.Landmark ? (
              <Text style={[styles.landmark, { color: colors.textMuted }]}>
                📍 {item.Landmark}
              </Text>
            ) : null}

            {!item.IsDefault ? (
              <Pressable
                onPress={() => handleSetDefault(item)}
                style={styles.setDefaultBtn}
              >
                <Text
                  style={[styles.setDefaultText, { color: colors.primary }]}
                >
                  Set as default
                </Text>
              </Pressable>
            ) : null}
          </View>
        )}
      />

      <Pressable
        onPress={onAddNew}
        style={[styles.addBtn, { backgroundColor: colors.primary }]}
      >
        <Ionicons name="add" size={20} color={colors.white} />
        <Text style={[styles.addBtnText, { color: colors.white }]}>
          Add New Address
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  empty: {
    alignItems: "center",
    paddingTop: spacing["3xl"],
    gap: spacing.sm,
  },
  emptyHeading: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  card: {
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    gap: spacing.xs,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  badgeRow: {
    flexDirection: "row",
    gap: spacing.xs,
    alignItems: "center",
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  defaultBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionBtn: {
    padding: spacing.xxs,
  },
  addressText: {
    fontSize: 15,
    fontWeight: "600",
  },
  cityText: {
    fontSize: 13,
  },
  landmark: {
    fontSize: 12,
  },
  setDefaultBtn: {
    alignSelf: "flex-start",
    marginTop: spacing.xxs,
  },
  setDefaultText: {
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: spacing.md,
    height: 52,
    borderRadius: radius.lg,
    gap: spacing.xs,
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
