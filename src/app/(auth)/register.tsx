import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { PrimaryButton } from "@/components/ui/primary-button";
import { colors, radius, spacing } from "@/theme";

export default function RegisterRoute() {
  const params = useLocalSearchParams<{ phone?: string }>();
  const initialPhone = (params.phone as string) ?? "";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(initialPhone);

  const handleRegister = () => {
    const cleanedPhone = phone.replace(/\D/g, "");

    if (!fullName || !email || cleanedPhone.length < 10) return;

    // go to OTP in "register" mode with user details
    router.push({
      pathname: "/(auth)/otp",
      params: {
        phone: cleanedPhone,
        mode: "register",
        fullName,
        email,
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.heading}>Register</Text>
        <Text style={styles.subheading}>
          Welcome to ShreeChhagan, please create your account.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter full name"
            style={styles.input}
            placeholderTextColor={colors.light.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="Enter email address"
            style={styles.input}
            placeholderTextColor={colors.light.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Mobile number</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10}
            placeholder="Enter mobile number"
            style={styles.input}
            placeholderTextColor={colors.light.textMuted}
          />
        </View>

        <PrimaryButton title="Continue" onPress={handleRegister} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.light.background,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  card: {
    borderRadius: radius.xl,
    padding: spacing["2xl"],
    backgroundColor: colors.light.surface,
    gap: spacing.lg,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.light.text,
  },
  subheading: {
    fontSize: 14,
    color: colors.light.textSecondary,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.light.text,
  },
  input: {
    height: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.light.border,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.light.text,
    backgroundColor: colors.light.surface,
  },
});
