import {
  mapAuthSession,
  sendOtp,
  verifyOtp,
} from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { radius, spacing, useTheme } from "@/theme";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const OTP_LENGTH = 4; // mockup text says "6" but draws 4 dots; backend verifies 4
const RESEND_COOLDOWN = 30;

export default function OtpRoute() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ phone?: string }>();
  const phone = (params.phone as string) ?? "";

  const loginWithToken = useAuthStore((state) => state.loginWithToken);

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const focusInput = () => inputRef.current?.focus();

  useEffect(() => {
    const timer = setTimeout(focusInput, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (canResend) return;
    const id = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [canResend]);

  const shake = () => {
    setOtp("");
    focusInput();
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 12,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -12,
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

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, OTP_LENGTH);
    setOtp(digits);
    if (error) setError("");
    if (digits.length === OTP_LENGTH) void handleVerify(digits);
  };

  const handleVerify = async (code?: string) => {
    const finalOtp = code ?? otp;
    if (finalOtp.length < OTP_LENGTH) {
      setError(`Please enter the complete ${OTP_LENGTH}-digit OTP`);
      shake();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await verifyOtp(phone, finalOtp);

      if (
        res.Status === 200 &&
        Array.isArray(res.Data) &&
        res.Data.length > 0
      ) {
        const session = mapAuthSession(res.Data[0]);
        if (!session) {
          setError("Unable to complete sign in. Please try again.");
          shake();
          return;
        }
        await loginWithToken(session.user, session.accessToken);
        router.replace("/(tabs)/home");
        return;
      }

      setError(res.Message || "Invalid or expired OTP. Please try again.");
      shake();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Network error. Check your connection.";
      setError(message);
      shake();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resendLoading) return;
    setResendLoading(true);
    setError("");
    try {
      await sendOtp(phone);
      setOtp("");
      focusInput();
      setResendTimer(RESEND_COOLDOWN);
      setCanResend(false);
    } catch {
      setError("Could not resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const isComplete = otp.length === OTP_LENGTH;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="light" />
      <View style={{ height: insets.top, backgroundColor: colors.primary }} />

      <View style={styles.body}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.back}
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
        </Pressable>

        <Text style={[styles.title, { color: colors.text }]}>
          OTP Verification
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enter the {OTP_LENGTH}-digit OTP sent to your mobile number{"\n"}+91{" "}
          {phone}
        </Text>

        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
          <Pressable
            onPress={focusInput}
            style={[
              styles.otpBar,
              {
                backgroundColor: colors.surface,
                borderColor: error ? colors.error : "transparent",
                shadowColor: colors.black,
              },
            ]}
          >
            <View style={styles.dotsRow}>
              {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        i < otp.length ? colors.primary : colors.border,
                    },
                  ]}
                />
              ))}
            </View>

            <TextInput
              ref={inputRef}
              value={otp}
              onChangeText={handleChange}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              maxLength={OTP_LENGTH}
              caretHidden
              style={styles.hiddenInput}
            />
          </Pressable>
        </Animated.View>

        {error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        ) : null}

        <Pressable
          onPress={() => handleVerify()}
          disabled={loading || !isComplete}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor:
                !isComplete || loading
                  ? colors.border
                  : pressed
                    ? colors.primaryPressed
                    : colors.primary,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text
              style={[
                styles.buttonText,
                { color: isComplete ? colors.white : colors.textSecondary },
              ]}
            >
              Verify
            </Text>
          )}
        </Pressable>

        <View style={styles.resendRow}>
          <Text style={[styles.resendText, { color: colors.textSecondary }]}>
            Didn&apos;t receive OTP?{" "}
          </Text>
          {canResend ? (
            resendLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Pressable onPress={handleResend} hitSlop={8}>
                <Text style={[styles.resendLink, { color: colors.primary }]}>
                  Resend
                </Text>
              </Pressable>
            )
          ) : (
            <Text style={[styles.resendLink, { color: colors.primary }]}>
              Resend in {resendTimer}s
            </Text>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  back: { alignSelf: "flex-start", marginBottom: spacing.xl },
  title: { fontSize: 24, fontWeight: "800", textAlign: "center" },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing["2xl"],
  },
  otpBar: {
    height: 64,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  dotsRow: { flexDirection: "row", columnGap: spacing.lg },
  dot: { width: 14, height: 14, borderRadius: 7 },
  hiddenInput: {
    position: "absolute",
    width: "100%",
    height: "100%",
    color: "transparent",
    textAlign: "center",
  },
  errorText: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: spacing.md,
    fontWeight: "500",
  },
  button: {
    height: 56,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontSize: 16, fontWeight: "700" },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.lg,
  },
  resendText: { fontSize: 14 },
  resendLink: { fontSize: 14, fontWeight: "700" },
});
