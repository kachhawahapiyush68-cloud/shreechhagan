// import { router } from "expo-router";
// import { StyleSheet, Text, View } from "react-native";

// import { PrimaryButton } from "@/components/ui/primary-button";
// import { useAuthStore } from "@/features/auth/store/auth.store";
// import { colors, spacing } from "@/theme";

// export default function ProfileRoute() {
//   const user = useAuthStore((s) => s.user);
//   const logout = useAuthStore((s) => s.logout);

//   const handleLogout = async () => {
//     await logout();
//     router.replace("/splash");
//   };

//   return (
//     <View style={styles.root}>
//       <View style={styles.card}>
//         <Text style={styles.title}>Profile</Text>
//         <Text style={styles.label}>Name</Text>
//         <Text style={styles.value}>{user?.fullName ?? "Guest"}</Text>

//         <Text style={styles.label}>Phone</Text>
//         <Text style={styles.value}>{user?.phone ?? "-"}</Text>

//         {user?.email ? (
//           <>
//             <Text style={styles.label}>Email</Text>
//             <Text style={styles.value}>{user.email}</Text>
//           </>
//         ) : null}

//         <View style={styles.buttonWrap}>
//           <PrimaryButton title="Logout" onPress={handleLogout} />
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   root: {
//     flex: 1,
//     backgroundColor: colors.light.background,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: spacing.lg,
//   },
//   card: {
//     width: "100%",
//     borderRadius: 16,
//     backgroundColor: colors.light.surface,
//     padding: spacing["2xl"],
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "800",
//     marginBottom: spacing.lg,
//     color: colors.light.text,
//   },
//   label: {
//     marginTop: spacing.sm,
//     fontSize: 13,
//     color: colors.light.textSecondary,
//   },
//   value: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: colors.light.text,
//   },
//   buttonWrap: {
//     marginTop: spacing["2xl"],
//   },
// });
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddressFormScreen } from "@/features/address/screens/address-form-screen";
import { AddressListScreen } from "@/features/address/screens/address-list-screen";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { radius, spacing, useTheme } from "@/theme";
import type { AddressDto } from "@/types/api";

type ProfileSection = "main" | "addresses";

export default function ProfileTab() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [section, setSection] = useState<ProfileSection>("main");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editAddress, setEditAddress] = useState<AddressDto | null>(null);

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

  const handleOpenAddressForm = (address?: AddressDto) => {
    setEditAddress(address ?? null);
    setShowAddressForm(true);
  };

  const handleAddressFormSuccess = () => {
    setShowAddressForm(false);
    setEditAddress(null);
  };

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
          <View style={styles.headerRow}>
            <Text style={[styles.heading, { color: colors.text }]}>
              Profile
            </Text>
          </View>

          <View
            style={[
              styles.avatarCard,
              { backgroundColor: colors.surface, shadowColor: colors.black },
            ]}
          >
            <View
              style={[
                styles.avatarCircle,
                { backgroundColor: colors.surfaceSecondary },
              ]}
            >
              <Text style={[styles.avatarInitial, { color: colors.primary }]}>
                {user?.fullName?.charAt(0)?.toUpperCase() ?? "U"}
              </Text>
            </View>
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
            </View>
          </View>

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
              onPress={() => {}}
              showChevron
            />

            <ProfileMenuItem
              icon="heart-outline"
              label="Favourites"
              colors={colors}
              onPress={() => {}}
              showChevron
            />
          </View>

          <View style={styles.menuSection}>
            <Text
              style={[styles.menuSectionLabel, { color: colors.textMuted }]}
            >
              More
            </Text>

            <ProfileMenuItem
              icon="notifications-outline"
              label="Notifications"
              colors={colors}
              onPress={() => {}}
              showChevron
            />

            <ProfileMenuItem
              icon="help-circle-outline"
              label="Help & Support"
              colors={colors}
              onPress={() => {}}
              showChevron
            />

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
      <Ionicons
        name={icon as any}
        size={20}
        color={destructive ? colors.error : colors.primary}
      />
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

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.md, gap: spacing.xl },
  headerRow: { paddingVertical: spacing.md },
  heading: { fontSize: 22, fontWeight: "800" },
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
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { fontSize: 24, fontWeight: "800" },
  avatarInfo: { flex: 1, gap: 2 },
  avatarName: { fontSize: 17, fontWeight: "700" },
  avatarPhone: { fontSize: 14 },
  avatarEmail: { fontSize: 12 },
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
  menuItemLabel: { flex: 1, fontSize: 15, fontWeight: "600" },
  menuChevron: { marginLeft: "auto" },
  subScreenRoot: { flex: 1 },
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: { padding: spacing.xxs },
  subHeaderTitle: { fontSize: 17, fontWeight: "700" },
});
