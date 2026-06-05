import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "@/components/ui/primary-button";
import { Screen } from "@/components/ui/screen";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { colors, radius, spacing } from "@/theme";

type OtpParams = {
  phone?: string;
  mode?: "login" | "register" | string;
  fullName?: string;
  email?: string;
};

export default function OtpRoute() {
  const params = useLocalSearchParams<OtpParams>();
  const phone = (params.phone as string) ?? "";
  const mode = (params.mode as OtpParams["mode"]) ?? "login";
  const fullName = (params.fullName as string) ?? "";
  const email = (params.email as string) ?? "";

  const fakeLoginWithPhone = useAuthStore((s) => s.fakeLoginWithPhone);
  const fakeRegister = useAuthStore((s) => s.fakeRegister);

  const [otp, setOtp] = useState("");

  const handleVerify = () => {
    if (otp.length < 4) return;

    if (mode === "register") {
      fakeRegister({
        fullName: fullName || "New User",
        email,
        phone,
      });
    } else {
      fakeLoginWithPhone(phone);
    }

    router.replace("/(tabs)/home");
  };

  return (
    <Screen withHorizontalPadding>
      <View style={styles.card}>
        <Text style={styles.heading}>OTP Verification</Text>
        <Text style={styles.subheading}>
          Enter 4 digit OTP sent to your mobile number +91{" "}
          {phone || "XXXXXXXXXX"}
        </Text>

        <TextInput
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={4}
          style={styles.otpInput}
        />

        <PrimaryButton title="Verify" onPress={handleVerify} />

        <Text style={styles.footerText}>
          Didn’t receive OTP? <Text style={styles.resend}>Resend</Text>
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing["2xl"],
    backgroundColor: colors.light.surface,
    gap: spacing.lg,
    marginTop: spacing["2xl"],
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
  otpInput: {
    height: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.light.border,
    paddingHorizontal: spacing.md,
    fontSize: 20,
    letterSpacing: 8,
    textAlign: "center",
    backgroundColor: colors.light.surface,
    color: colors.light.text,
  },
  footerText: {
    textAlign: "center",
    fontSize: 13,
    color: colors.light.textSecondary,
  },
  resend: {
    color: colors.light.primary,
    fontWeight: "600",
  },
});
