import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  useAddAddressMutation,
  useUpdateAddressMutation,
} from "@/features/address/hooks/use-address";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { radius, spacing, useTheme } from "@/theme";
import type { AddressDto } from "@/types/api";

const ADDRESS_TYPES = ["Home", "Work", "Other"] as const;
type AddressType = (typeof ADDRESS_TYPES)[number];

type Props = {
  editAddress?: AddressDto | null;
  onSuccess: () => void;
  onCancel: () => void;
};

export function AddressFormScreen({ editAddress, onSuccess, onCancel }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.user?.id);
  const customerId = userId ? Number(userId) : 0;

  const addMutation = useAddAddressMutation();
  const updateMutation = useUpdateAddressMutation();

  const isEditing = !!editAddress;
  const isPending = addMutation.isPending || updateMutation.isPending;

  const [addressType, setAddressType] = useState<AddressType>(
    (editAddress?.AddressType as AddressType) ?? "Home",
  );
  const [fullAddress, setFullAddress] = useState(
    editAddress?.FullAddress ?? "",
  );
  const [city, setCity] = useState(editAddress?.City ?? "");
  const [state, setState] = useState(editAddress?.State ?? "");
  const [pinCode, setPinCode] = useState(editAddress?.PinCode ?? "");
  const [landmark, setLandmark] = useState(editAddress?.Landmark ?? "");
  const [isDefault, setIsDefault] = useState(editAddress?.IsDefault ?? false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (addMutation.isSuccess || updateMutation.isSuccess) {
      onSuccess();
    }
  }, [addMutation.isSuccess, updateMutation.isSuccess, onSuccess]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullAddress.trim()) errs.fullAddress = "Address is required";
    if (!city.trim()) errs.city = "City is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (isEditing && editAddress) {
      updateMutation.mutate({
        customerId,
        addressId: editAddress.AddressId,
        addressType,
        fullAddress: fullAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        pinCode: pinCode.trim(),
        landmark: landmark.trim(),
        isDefault,
      });
    } else {
      addMutation.mutate({
        customerId,
        addressType,
        fullAddress: fullAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        pinCode: pinCode.trim(),
        landmark: landmark.trim(),
        isDefault,
      });
    }
  };

  const apiError =
    (addMutation.error as Error)?.message ||
    (updateMutation.error as Error)?.message;

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: colors.background, paddingBottom: insets.bottom },
      ]}
    >
      <View
        style={[
          styles.header,
          { borderBottomColor: colors.border, backgroundColor: colors.surface },
        ]}
      >
        <Pressable onPress={onCancel} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isEditing ? "Edit Address" : "Add Address"}
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          Address Type
        </Text>
        <View style={styles.typeRow}>
          {ADDRESS_TYPES.map((type) => {
            const isActive = addressType === type;
            return (
              <Pressable
                key={type}
                onPress={() => setAddressType(type)}
                style={[
                  styles.typePill,
                  {
                    backgroundColor: isActive ? colors.primary : colors.surface,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.typePillText,
                    {
                      color: isActive ? colors.white : colors.textSecondary,
                      fontWeight: isActive ? "700" : "500",
                    },
                  ]}
                >
                  {type}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <FieldInput
          label="Full Address *"
          value={fullAddress}
          onChangeText={(t) => {
            setFullAddress(t);
            setErrors((e) => ({ ...e, fullAddress: "" }));
          }}
          placeholder="Street, building, flat no."
          error={errors.fullAddress}
          multiline
          colors={colors}
        />

        <FieldInput
          label="City *"
          value={city}
          onChangeText={(t) => {
            setCity(t);
            setErrors((e) => ({ ...e, city: "" }));
          }}
          placeholder="City"
          error={errors.city}
          colors={colors}
        />

        <FieldInput
          label="State"
          value={state}
          onChangeText={setState}
          placeholder="State"
          colors={colors}
        />

        <FieldInput
          label="PIN Code"
          value={pinCode}
          onChangeText={setPinCode}
          placeholder="6-digit PIN code"
          keyboardType="number-pad"
          maxLength={6}
          colors={colors}
        />

        <FieldInput
          label="Landmark"
          value={landmark}
          onChangeText={setLandmark}
          placeholder="Near landmark (optional)"
          colors={colors}
        />

        <View
          style={[
            styles.switchRow,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View>
            <Text style={[styles.switchLabel, { color: colors.text }]}>
              Set as Default
            </Text>
            <Text style={[styles.switchSub, { color: colors.textSecondary }]}>
              Use this address by default at checkout
            </Text>
          </View>
          <Switch
            value={isDefault}
            onValueChange={setIsDefault}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        {apiError ? (
          <View
            style={[
              styles.apiErrorBox,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.error,
              },
            ]}
          >
            <Text style={[styles.apiErrorText, { color: colors.error }]}>
              {apiError}
            </Text>
          </View>
        ) : null}

        <Pressable
          onPress={handleSubmit}
          disabled={isPending}
          style={[
            styles.submitBtn,
            {
              backgroundColor: isPending ? colors.border : colors.primary,
            },
          ]}
        >
          {isPending ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={[styles.submitText, { color: colors.white }]}>
              {isEditing ? "Update Address" : "Save Address"}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

type FieldInputProps = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  error?: string;
  multiline?: boolean;
  keyboardType?: "default" | "number-pad";
  maxLength?: number;
  colors: ReturnType<typeof useTheme>["colors"];
};

function FieldInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  multiline,
  keyboardType = "default",
  maxLength,
  colors,
}: FieldInputProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        keyboardType={keyboardType}
        maxLength={maxLength}
        style={[
          styles.fieldInput,
          {
            borderColor: error ? colors.error : colors.border,
            color: colors.text,
            backgroundColor: colors.surface,
            minHeight: multiline ? 80 : 52,
            textAlignVertical: multiline ? "top" : "center",
          },
        ]}
      />
      {error ? (
        <Text style={[styles.fieldError, { color: colors.error }]}>
          {error}
        </Text>
      ) : null}
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
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  scrollContent: { padding: spacing.md, gap: spacing.lg },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  typeRow: { flexDirection: "row", gap: spacing.sm },
  typePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  typePillText: { fontSize: 13 },
  fieldGroup: { gap: spacing.xxs },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  fieldInput: {
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
  },
  fieldError: { fontSize: 12 },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  switchLabel: { fontSize: 15, fontWeight: "600" },
  switchSub: { fontSize: 12, marginTop: 2 },
  apiErrorBox: {
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  apiErrorText: { fontSize: 13 },
  submitBtn: {
    height: 54,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  submitText: { fontSize: 16, fontWeight: "700" },
});
