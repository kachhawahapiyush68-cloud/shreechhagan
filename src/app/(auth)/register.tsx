import { registerCustomer, sendOtp } from "@/features/auth/api/auth.api";
import { radius, spacing, useTheme } from "@/theme";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_H } = Dimensions.get("window");
const HERO_H = Math.round(SCREEN_H * 0.3);
const MOBILE_LENGTH = 10;

type FieldKey = "name" | "email" | "phone";

function sanitizePhone(value: string) {
  return value.replace(/\D/g, "").slice(0, MOBILE_LENGTH);
}

export default function RegisterRoute() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ phone?: string }>();
  const initialPhone = sanitizePhone((params.phone as string) ?? "");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [apiError, setApiError] = useState("");

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<FieldKey, string>> = {};
    if (!name.trim()) nextErrors.name = "Full name is required";
    if (!email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address";
    }
    if (sanitizePhone(phone).length < MOBILE_LENGTH) {
      nextErrors.phone = "Enter a valid 10-digit mobile number";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) {
      shake();
      return;
    }

    setApiError("");
    setLoading(true);
    const cleanedPhone = sanitizePhone(phone);

    try {
      const res = await registerCustomer(
        name.trim(),
        cleanedPhone,
        email.trim(),
      );

      if (res.Status === 200) {
        await sendOtp(cleanedPhone);
        router.push({
          pathname: "/(auth)/otp",
          params: {
            phone: cleanedPhone,
            mode: "register",
            fullName: name.trim(),
            email: email.trim(),
          },
        });
        return;
      }

      setApiError(res.Message || "Registration failed. Please try again.");
      shake();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Network error. Check your connection.";
      setApiError(message);
      shake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.surface }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="light" />
      <View style={{ height: insets.top, backgroundColor: colors.primary }} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { height: HERO_H }]}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={styles.back}
          >
            <Feather name="arrow-left" size={24} color={colors.text} />
          </Pressable>

          {/* TODO: swap logo.png for the donut hero photo from the design */}
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.heroImage}
            contentFit="contain"
          />
        </View>

        <Animated.View
          style={[
            styles.panel,
            {
              backgroundColor: colors.surfaceSecondary,
              paddingBottom: insets.bottom + spacing.xl,
              transform: [{ translateX: shakeAnim }],
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>Register</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Welcome to ShreeChhagan, please create your account
          </Text>

          {apiError ? (
            <View
              style={[
                styles.banner,
                { borderColor: colors.error, backgroundColor: colors.surface },
              ]}
            >
              <Feather name="alert-circle" size={16} color={colors.error} />
              <Text style={[styles.bannerText, { color: colors.error }]}>
                {apiError}
              </Text>
            </View>
          ) : null}

          {/* Full name */}
          <View style={styles.fieldWrap}>
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: colors.surface,
                  borderColor: errors.name ? colors.error : "transparent",
                  shadowColor: colors.black,
                },
              ]}
            >
              <TextInput
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Enter user name"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, { color: colors.text }]}
                autoCapitalize="words"
                textContentType="name"
              />
              <Feather name="user" size={20} color={colors.textMuted} />
            </View>
            {errors.name ? (
              <Text style={[styles.fieldError, { color: colors.error }]}>
                {errors.name}
              </Text>
            ) : null}
          </View>

          {/* Email */}
          <View style={styles.fieldWrap}>
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: colors.surface,
                  borderColor: errors.email ? colors.error : "transparent",
                  shadowColor: colors.black,
                },
              ]}
            >
              <TextInput
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="Enter email address"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, { color: colors.text }]}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
              />
              <Feather name="mail" size={20} color={colors.textMuted} />
            </View>
            {errors.email ? (
              <Text style={[styles.fieldError, { color: colors.error }]}>
                {errors.email}
              </Text>
            ) : null}
          </View>

          {/* Mobile */}
          <View style={styles.fieldWrap}>
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: colors.surface,
                  borderColor: errors.phone ? colors.error : "transparent",
                  shadowColor: colors.black,
                },
              ]}
            >
              <TextInput
                value={phone}
                onChangeText={(text) => {
                  setPhone(sanitizePhone(text));
                  setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                placeholder="Enter mobile number"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, { color: colors.text }]}
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                maxLength={10}
              />
              <Feather name="phone" size={20} color={colors.textMuted} />
            </View>
            {errors.phone ? (
              <Text style={[styles.fieldError, { color: colors.error }]}>
                {errors.phone}
              </Text>
            ) : null}
          </View>

          <Pressable
            onPress={handleRegister}
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor:
                  pressed && !loading ? colors.primaryPressed : colors.primary,
              },
              loading && styles.buttonDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.white }]}>
                Register
              </Text>
            )}
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1 },
  hero: {
    alignItems: "center",
    justifyContent: "center",
  },
  back: {
    position: "absolute",
    top: spacing.xs,
    left: spacing.lg,
    zIndex: 2,
  },
  heroImage: { width: "60%", height: "80%" },
  panel: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  bannerText: { flex: 1, fontSize: 13, fontWeight: "500" },
  fieldWrap: { marginBottom: spacing.md },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    columnGap: spacing.sm,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  input: { flex: 1, fontSize: 16 },
  fieldError: { fontSize: 12, marginTop: spacing.xxs, fontWeight: "500" },
  button: {
    height: 56,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 16, fontWeight: "700" },
});
