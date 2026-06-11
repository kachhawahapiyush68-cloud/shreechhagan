import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddressFormScreen } from "@/features/address/screens/address-form-screen";
import { AddressListScreen } from "@/features/address/screens/address-list-screen";
import { updateCustomerProfile } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { radius, spacing, useTheme } from "@/theme";
import type { AddressDto } from "@/types/api";

/* ─────────────────────────── types ─────────────────────────── */
type ProfileSection = "main" | "addresses";

/* ─────────────────────────── helpers ─────────────────────────── */
function sanitizePhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

function toDataUri(base64: string, mimeType = "image/jpeg") {
  return `data:${mimeType};base64,${base64}`;
}

/* ═══════════════════════════════════════════════════════════════
   ProfileTab
═══════════════════════════════════════════════════════════════ */
export default function ProfileTab() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const updateUser = useAuthStore((s) => s.updateUser);

  /* ── local state ── */
  const [section, setSection] = useState<ProfileSection>("main");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editAddress, setEditAddress] = useState<AddressDto | null>(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);

  const displayPhoto = user?.photoLocalUri || user?.photoUrl || null;

  const initial = useMemo(
    () => user?.fullName?.charAt(0)?.toUpperCase() ?? "U",
    [user?.fullName],
  );

  /* ─── logout ─── */
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => void logout(),
      },
    ]);
  };

  /* ─── address helpers ─── */
  const handleOpenAddressForm = (address?: AddressDto) => {
    setEditAddress(address ?? null);
    setShowAddressForm(true);
  };

  const handleAddressFormSuccess = () => {
    setShowAddressForm(false);
    setEditAddress(null);
  };

  /* ─── profile edit ─── */
  const resetProfileForm = () => {
    setFullName(user?.fullName ?? "");
    setPhone(user?.phone ?? "");
    setIsEditingProfile(false);
  };

  const handleSaveProfile = async (imagePayload?: {
    customerImageBase64?: string | null;
    customerPhotoName?: string | null;
    previewUri?: string | null;
  }) => {
    if (!user?.id) {
      Alert.alert("Error", "User session not found.");
      return;
    }

    const trimmedName = fullName.trim();
    const cleanedPhone = sanitizePhone(phone);

    if (!trimmedName) {
      Alert.alert("Validation", "Please enter your full name.");
      return;
    }
    if (cleanedPhone.length !== 10) {
      Alert.alert("Validation", "Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setSavingProfile(true);

      const res = await updateCustomerProfile({
        customerId: Number(user.id),
        customerName: trimmedName,
        customerMobile: cleanedPhone,
        customerImageBase64: imagePayload?.customerImageBase64 ?? undefined,
        customerPhotoName: imagePayload?.customerPhotoName ?? undefined,
      });

      const item = Array.isArray(res.Data) ? res.Data[0] : undefined;

      if (res.Status !== 200 || !item?.Success) {
        throw new Error(
          item?.Message || res.Message || "Profile update failed",
        );
      }

      updateUser({
        fullName: item.CustomerName,
        phone: item.CustomerMobile,
        photoUrl: item.CustomerPhotoUrl || user.photoUrl,
        photoName: item.CustomerPhotoName || user.photoName,
        ...(imagePayload?.previewUri
          ? { photoLocalUri: imagePayload.previewUri }
          : {}),
      });

      setIsEditingProfile(false);
      Alert.alert("Success", "Profile updated successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update profile.";
      Alert.alert("Update failed", message);
    } finally {
      setSavingProfile(false);
    }
  };

  /* ─── photo picker ─── */
  const pickAndUploadPhoto = async (fromCamera: boolean) => {
    try {
      setPhotoBusy(true);

      const permission = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          fromCamera
            ? "Camera permission is required."
            : "Photo library permission is required.",
        );
        return;
      }

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true,
          });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      if (!asset.base64) throw new Error("Image base64 data not available.");

      const mimeType = asset.mimeType || "image/jpeg";
      const fileName =
        asset.fileName ||
        `profile-${Date.now()}.${mimeType.split("/")[1] || "jpg"}`;

      await handleSaveProfile({
        customerImageBase64: toDataUri(asset.base64, mimeType),
        customerPhotoName: fileName,
        previewUri: asset.uri,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update photo.";
      Alert.alert("Photo update failed", message);
    } finally {
      setPhotoBusy(false);
    }
  };

  const handlePhotoOptions = () => {
    Alert.alert("Profile photo", "Choose an option", [
      {
        text: "Take photo",
        onPress: () => void pickAndUploadPhoto(true),
      },
      {
        text: "Choose from gallery",
        onPress: () => void pickAndUploadPhoto(false),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  /* ─── content page navigation ─── */
  const openContent = (slug: "privacy" | "help" | "terms") => {
    router.push(`/content/${slug}` as any);
  };

  /* ═══════════════════════════ render ═══════════════════════════ */
  return (
    <View
      style={[
        styles.root,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      {section === "main" ? (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 32 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* ── heading ── */}
          <View style={styles.headerRow}>
            <Text style={[styles.heading, { color: colors.text }]}>
              Profile
            </Text>
          </View>

          {/* ── avatar card ── */}
          <View
            style={[
              styles.avatarCard,
              {
                backgroundColor: colors.surface,
                shadowColor: colors.black,
                borderColor: colors.border,
              },
            ]}
          >
            <Pressable
              onPress={handlePhotoOptions}
              style={styles.avatarWrap}
              disabled={photoBusy || savingProfile}
            >
              <View
                style={[
                  styles.avatarCircle,
                  { backgroundColor: colors.surfaceSecondary },
                ]}
              >
                {displayPhoto ? (
                  <Image
                    source={{ uri: displayPhoto }}
                    style={styles.avatarImage}
                    contentFit="cover"
                  />
                ) : (
                  <Text
                    style={[styles.avatarInitial, { color: colors.primary }]}
                  >
                    {initial}
                  </Text>
                )}

                <View
                  style={[
                    styles.cameraBadge,
                    {
                      backgroundColor: colors.primary,
                      borderColor: colors.surface,
                    },
                  ]}
                >
                  {photoBusy ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Ionicons name="camera" size={14} color={colors.white} />
                  )}
                </View>
              </View>
            </Pressable>

            <View style={styles.avatarInfo}>
              <Text style={[styles.avatarName, { color: colors.text }]}>
                {user?.fullName ?? "User"}
              </Text>
              <Text
                style={[styles.avatarPhone, { color: colors.textSecondary }]}
              >
                +91 {user?.phone ?? ""}
              </Text>
              {user?.email ? (
                <Text style={[styles.avatarEmail, { color: colors.textMuted }]}>
                  {user.email}
                </Text>
              ) : null}

              <Pressable onPress={() => setIsEditingProfile(true)}>
                <Text style={[styles.editLink, { color: colors.primary }]}>
                  Edit profile
                </Text>
              </Pressable>
            </View>
          </View>

          {/* ── inline edit form ── */}
          {isEditingProfile ? (
            <View
              style={[
                styles.editCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.formLabel, { color: colors.text }]}>
                Full name
              </Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter full name"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
              />

              <Text style={[styles.formLabel, { color: colors.text }]}>
                Mobile number
              </Text>
              <TextInput
                value={phone}
                onChangeText={(text) => setPhone(sanitizePhone(text))}
                placeholder="Enter mobile number"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
              />

              <View style={styles.editActions}>
                <Pressable
                  onPress={resetProfileForm}
                  style={[
                    styles.secondaryBtn,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    },
                  ]}
                  disabled={savingProfile}
                >
                  <Text
                    style={[styles.secondaryBtnText, { color: colors.text }]}
                  >
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => void handleSaveProfile()}
                  style={[
                    styles.primaryBtn,
                    { backgroundColor: colors.primary },
                    savingProfile && styles.btnDisabled,
                  ]}
                  disabled={savingProfile}
                >
                  {savingProfile ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text
                      style={[styles.primaryBtnText, { color: colors.white }]}
                    >
                      Save
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          ) : null}

          {/* ═══════════ ACCOUNT section ═══════════ */}
          <View style={styles.menuSection}>
            <Text
              style={[styles.menuSectionLabel, { color: colors.textMuted }]}
            >
              Account
            </Text>

            <ProfileMenuItem
              icon="location-outline"
              label="Saved Addresses"
              colors={colors}
              onPress={() => setSection("addresses")}
              showChevron
            />

            <ProfileMenuItem
              icon="receipt-outline"
              label="My Orders"
              colors={colors}
              onPress={() => router.push("/(tabs)/orders")}
              showChevron
            />

            <ProfileMenuItem
              icon="heart-outline"
              label="Favourites"
              colors={colors}
              onPress={() => router.push("/favourites")}
              showChevron
            />

            <ProfileMenuItem
              icon="notifications-outline"
              label="Notifications"
              colors={colors}
              onPress={() => router.push("/notifications" as any)}
              showChevron
            />
          </View>

          {/* ═══════════ SUPPORT section ═══════════ */}
          <View style={styles.menuSection}>
            <Text
              style={[styles.menuSectionLabel, { color: colors.textMuted }]}
            >
              Support
            </Text>

            <ProfileMenuItem
              icon="help-circle-outline"
              label="Help & Support"
              colors={colors}
              onPress={() => openContent("help")}
              showChevron
            />

            <ProfileMenuItem
              icon="shield-checkmark-outline"
              label="Privacy Policy"
              colors={colors}
              onPress={() => openContent("privacy")}
              showChevron
            />

            <ProfileMenuItem
              icon="document-text-outline"
              label="Terms & Conditions"
              colors={colors}
              onPress={() => openContent("terms")}
              showChevron
            />
          </View>

          {/* ═══════════ DANGER section ═══════════ */}
          <View style={styles.menuSection}>
            <Text
              style={[styles.menuSectionLabel, { color: colors.textMuted }]}
            >
              Account actions
            </Text>

            <ProfileMenuItem
              icon="log-out-outline"
              label="Sign Out"
              colors={colors}
              onPress={handleLogout}
              destructive
            />
          </View>
        </ScrollView>
      ) : (
        /* ─── Addresses sub-screen ─── */
        <View style={styles.subScreenRoot}>
          <View
            style={[
              styles.subHeader,
              {
                borderBottomColor: colors.border,
                backgroundColor: colors.surface,
              },
            ]}
          >
            <Pressable
              onPress={() => setSection("main")}
              hitSlop={12}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </Pressable>
            <Text style={[styles.subHeaderTitle, { color: colors.text }]}>
              Saved Addresses
            </Text>
            <View style={{ width: 22 }} />
          </View>

          <AddressListScreen
            onAddNew={() => handleOpenAddressForm()}
            onEdit={handleOpenAddressForm}
          />
        </View>
      )}

      {/* ─── Address form modal ─── */}
      <Modal
        visible={showAddressForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddressForm(false)}
      >
        <AddressFormScreen
          editAddress={editAddress}
          onSuccess={handleAddressFormSuccess}
          onCancel={() => setShowAddressForm(false)}
        />
      </Modal>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ProfileMenuItem
═══════════════════════════════════════════════════════════════ */
type MenuItemProps = {
  icon: string;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
  destructive?: boolean;
  colors: ReturnType<typeof useTheme>["colors"];
};

function ProfileMenuItem({
  icon,
  label,
  onPress,
  showChevron,
  destructive,
  colors,
}: MenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        {
          backgroundColor: pressed ? colors.surfaceSecondary : colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {/* tinted icon badge — matches Swiggy/Zomato settings row feel */}
      <View
        style={[
          styles.menuIconWrap,
          {
            backgroundColor: destructive
              ? colors.error + "18"
              : colors.primary + "18",
          },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={18}
          color={destructive ? colors.error : colors.primary}
        />
      </View>

      <Text
        style={[
          styles.menuItemLabel,
          { color: destructive ? colors.error : colors.text },
        ]}
      >
        {label}
      </Text>

      {showChevron ? (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.textMuted}
          style={styles.menuChevron}
        />
      ) : null}
    </Pressable>
  );
}

/* ═══════════════════════════════════════════════════════════════
   styles
═══════════════════════════════════════════════════════════════ */
const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.md, gap: spacing.xl },
  headerRow: { paddingVertical: spacing.md },
  heading: { fontSize: 22, fontWeight: "800" },

  /* ── avatar card ── */
  avatarCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.xl,
    gap: spacing.md,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
  },
  avatarWrap: { position: "relative" },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarInitial: { fontSize: 28, fontWeight: "800" },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  avatarInfo: { flex: 1, gap: 2 },
  avatarName: { fontSize: 17, fontWeight: "700" },
  avatarPhone: { fontSize: 14 },
  avatarEmail: { fontSize: 12 },
  editLink: { fontSize: 13, fontWeight: "700", marginTop: 6 },

  /* ── edit form ── */
  editCard: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.sm,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    fontSize: 15,
  },
  editActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  secondaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: "700" },
  primaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { fontSize: 15, fontWeight: "700" },
  btnDisabled: { opacity: 0.7 },

  /* ── menu ── */
  menuSection: { gap: spacing.xs },
  menuSectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: spacing.xs,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  /* NEW — tinted icon container, replaces bare icon */
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemLabel: { flex: 1, fontSize: 15, fontWeight: "600" },
  menuChevron: { marginLeft: "auto" },

  /* ── address sub-screen ── */
  subScreenRoot: { flex: 1 },
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  subHeaderTitle: { fontSize: 17, fontWeight: "700" },
});
