import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";

import { TextField } from "@/components/forms/text-field";
import { Header } from "@/components/ui/header";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Screen } from "@/components/ui/screen";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { colors, spacing } from "@/theme";

type LoginFormValues = {
  phone: string;
};

export default function LoginRoute() {
  const user = useAuthStore((s) => s.user);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      phone: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    const cleanedPhone = values.phone.replace(/\D/g, "");

    if (cleanedPhone.length < 10) {
      return;
    }

    const isExistingUser = !!user && user.phone && user.phone === cleanedPhone;

    if (isExistingUser) {
      // existing user -> OTP for login
      router.push({
        pathname: "/(auth)/otp",
        params: { phone: cleanedPhone, mode: "login" },
      });
    } else {
      // new user -> go to register with phone prefilled
      router.push({
        pathname: "/(auth)/register",
        params: { phone: cleanedPhone },
      });
    }
  };

  return (
    <Screen scrollable withHorizontalPadding>
      <Header
        title="Login to continue"
        subtitle="Order food, groceries, and essentials in minutes."
      />

      <View style={styles.heroBlock}>
        <Text style={styles.heroTitle}>Fast delivery, smarter checkout.</Text>
        <Text style={styles.heroText}>
          Use your mobile number to sign in or create your account.
        </Text>
      </View>

      <Controller
        control={control}
        name="phone"
        rules={{
          required: "Phone number is required",
          minLength: {
            value: 10,
            message: "Enter a valid mobile number",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <TextField
            label="Mobile number"
            value={value}
            onChangeText={onChange}
            keyboardType="phone-pad"
            maxLength={10}
            placeholder="Enter your mobile number"
            error={errors.phone?.message}
            hint="We will send you a 4 digit OTP"
          />
        )}
      />

      <View style={styles.buttonWrap}>
        <PrimaryButton
          title="Continue"
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        />
      </View>

      <Text style={styles.footerText}>
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroBlock: {
    marginBottom: spacing.xl,
    rowGap: spacing.xs,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.light.text,
  },
  heroText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.light.textSecondary,
  },
  buttonWrap: {
    marginTop: spacing.xl,
  },
  footerText: {
    marginTop: spacing.lg,
    fontSize: 12,
    lineHeight: 18,
    color: colors.light.textMuted,
  },
});
