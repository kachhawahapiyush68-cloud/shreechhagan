// import { sendOtp, verifyOtp } from "@/features/auth/api/auth.api";
// import { useAuthStore } from "@/features/auth/store/auth.store";
// import type { AuthUser } from "@/features/auth/store/auth.store";
// import { colors, radius, spacing } from "@/theme";
// import { router, useLocalSearchParams } from "expo-router";
// import { useEffect, useRef, useState } from "react";
// import {
//   ActivityIndicator,
//   Animated,
//   KeyboardAvoidingView,
//   Platform,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   View,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// const OTP_LENGTH = 4;
// const RESEND_COOLDOWN = 30; // seconds

// type OtpParams = {
//   phone?: string;
//   mode?: "login" | "register" | string;
//   fullName?: string;
//   email?: string;
// };

// export default function OtpRoute() {
//   const insets = useSafeAreaInsets();
//   const params = useLocalSearchParams<OtpParams>();
//   const phone = (params.phone as string) ?? "";
//   const mode = (params.mode as string) ?? "login";
//   const fullName = (params.fullName as string) ?? "";
//   const email = (params.email as string) ?? "";

//   const loginWithToken = useAuthStore((s) => s.loginWithToken);

//   // OTP boxes
//   const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
//   const inputRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));

//   // UI state
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [resendLoading, setResendLoading] = useState(false);
//   const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
//   const [canResend, setCanResend] = useState(false);

//   // Animations
//   const shakeAnim = useRef(new Animated.Value(0)).current;
//   const successScale = useRef(new Animated.Value(1)).current;
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   // Fade in on mount
//   useEffect(() => {
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 500,
//       useNativeDriver: true,
//     }).start();
//     // Auto-focus first box
//     setTimeout(() => inputRefs.current[0]?.focus(), 300);
//   }, []);

//   // Resend countdown
//   useEffect(() => {
//     if (canResend) return;
//     const id = setInterval(() => {
//       setResendTimer((prev) => {
//         if (prev <= 1) {
//           clearInterval(id);
//           setCanResend(true);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//     return () => clearInterval(id);
//   }, [canResend]);

//   const shake = () => {
//     setOtp(Array(OTP_LENGTH).fill(""));
//     inputRefs.current[0]?.focus();
//     Animated.sequence([
//       Animated.timing(shakeAnim, { toValue: 12, duration: 60, useNativeDriver: true }),
//       Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
//       Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
//       Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
//       Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
//     ]).start();
//   };

//   const handleOtpChange = (text: string, index: number) => {
//     const digit = text.replace(/\D/g, "").slice(-1);
//     const newOtp = [...otp];
//     newOtp[index] = digit;
//     setOtp(newOtp);
//     if (error) setError("");

//     if (digit && index < OTP_LENGTH - 1) {
//       // Advance to next box
//       inputRefs.current[index + 1]?.focus();
//     }

//     // Auto-verify when all filled
//     if (digit && index === OTP_LENGTH - 1) {
//       const full = newOtp.join("");
//       if (full.length === OTP_LENGTH) {
//         handleVerify(full);
//       }
//     }
//   };

//   const handleKeyPress = (key: string, index: number) => {
//     if (key === "Backspace" && !otp[index] && index > 0) {
//       // Move back to previous box
//       const newOtp = [...otp];
//       newOtp[index - 1] = "";
//       setOtp(newOtp);
//       inputRefs.current[index - 1]?.focus();
//     }
//   };

//   const handleVerify = async (otpString?: string) => {
//     const finalOtp = otpString ?? otp.join("");
//     if (finalOtp.length < OTP_LENGTH) {
//       setError("Please enter the complete 4-digit OTP");
//       shake();
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {
//       const res = await verifyOtp(phone, finalOtp);

//       if (res.Status === 200 && res.Data.length > 0) {
//         const userData = res.Data[0];
//         const token = userData.Token || userData.token;

//         // Success animation
//         Animated.spring(successScale, {
//           toValue: 1.05,
//           useNativeDriver: true,
//           damping: 10,
//           stiffness: 200,
//         }).start(() => {
//           Animated.spring(successScale, {
//             toValue: 1,
//             useNativeDriver: true,
//             damping: 10,
//           }).start();
//         });

//         const user: AuthUser = {
//           id: String(userData.CustomerId),
//           fullName: userData.CustomerName,
//           phone: userData.CustomerMobile,
//           email: userData.customeremail,
//           clientCode: userData.ClientCode,
//         };

//         await loginWithToken(user, token);
//         router.replace("/(tabs)/home");
//       } else {
//         setError(res.Message || "Invalid or expired OTP. Please try again.");
//         shake();
//       }
//     } catch (err: any) {
//       setError(err?.message || "Network error. Check your connection.");
//       shake();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResend = async () => {
//     if (!canResend || resendLoading) return;
//     setResendLoading(true);
//     setError("");
//     try {
//       await sendOtp(phone);
//       setOtp(Array(OTP_LENGTH).fill(""));
//       inputRefs.current[0]?.focus();
//       setResendTimer(RESEND_COOLDOWN);
//       setCanResend(false);
//     } catch {
//       // silently fail resend — OTP service may not be configured
//     } finally {
//       setResendLoading(false);
//     }
//   };

//   const filledCount = otp.filter(Boolean).length;
//   const isComplete = filledCount === OTP_LENGTH;

//   return (
//     <KeyboardAvoidingView
//       style={styles.root}
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//     >
//       <ScrollView
//         contentContainerStyle={[
//           styles.scroll,
//           { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
//         ]}
//         keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Back */}
//         <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
//           <Text style={styles.backText}>← Back</Text>
//         </Pressable>

//         <Animated.View style={{ opacity: fadeAnim }}>
//           {/* Header */}
//           <View style={styles.header}>
//             <View style={styles.iconBadge}>
//               <Text style={styles.iconEmoji}>🔐</Text>
//             </View>
//             <Text style={styles.title}>OTP Verification</Text>
//             <Text style={styles.subtitle}>
//               We sent a 4-digit code to
//             </Text>
//             <Text style={styles.phoneDisplay}>+91 {phone}</Text>
//           </View>

//           {/* OTP Card */}
//           <Animated.View
//             style={[
//               styles.card,
//               { transform: [{ translateX: shakeAnim }, { scale: successScale }] },
//             ]}
//           >
//             {/* 4-box OTP Input */}
//             <View style={styles.otpRow}>
//               {otp.map((digit, index) => (
//                 <Pressable
//                   key={index}
//                   onPress={() => inputRefs.current[index]?.focus()}
//                   style={[
//                     styles.otpBox,
//                     digit ? styles.otpBoxFilled : null,
//                     error ? styles.otpBoxError : null,
//                     index === filledCount && !digit ? styles.otpBoxActive : null,
//                   ]}
//                 >
//                   <TextInput
//                     ref={(ref) => { inputRefs.current[index] = ref; }}
//                     value={digit}
//                     onChangeText={(t) => handleOtpChange(t, index)}
//                     onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
//                     keyboardType="number-pad"
//                     maxLength={1}
//                     style={styles.otpInput}
//                     caretHidden
//                     selectTextOnFocus
//                   />
//                   {!digit && index === filledCount ? (
//                     <View style={styles.cursor} />
//                   ) : null}
//                 </Pressable>
//               ))}
//             </View>

//             {/* Error */}
//             {error ? (
//               <View style={styles.errorRow}>
//                 <Text style={styles.errorIcon}>⚠️</Text>
//                 <Text style={styles.errorText}>{error}</Text>
//               </View>
//             ) : (
//               <Text style={styles.hintText}>Enter 4-digit code sent to your mobile</Text>
//             )}

//             {/* Progress dots */}
//             <View style={styles.progressRow}>
//               {Array(OTP_LENGTH).fill(null).map((_, i) => (
//                 <View
//                   key={i}
//                   style={[
//                     styles.progressDot,
//                     i < filledCount ? styles.progressDotFilled : null,
//                   ]}
//                 />
//               ))}
//             </View>

//             {/* Verify Button */}
//             <Pressable
//               onPress={() => handleVerify()}
//               disabled={loading || !isComplete}
//               style={({ pressed }) => [
//                 styles.button,
//                 pressed && styles.buttonPressed,
//                 (loading || !isComplete) && styles.buttonDisabled,
//               ]}
//             >
//               {loading ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <Text style={styles.buttonText}>
//                   {isComplete ? "Verify & Continue ✓" : `Enter ${OTP_LENGTH - filledCount} more digit${OTP_LENGTH - filledCount > 1 ? "s" : ""}`}
//                 </Text>
//               )}
//             </Pressable>
//           </Animated.View>

//           {/* Resend */}
//           <View style={styles.resendRow}>
//             {canResend ? (
//               <Pressable onPress={handleResend} disabled={resendLoading}>
//                 {resendLoading ? (
//                   <ActivityIndicator size="small" color={colors.light.primary} />
//                 ) : (
//                   <Text style={styles.resendActive}>Resend OTP</Text>
//                 )}
//               </Pressable>
//             ) : (
//               <Text style={styles.resendTimer}>
//                 Resend OTP in{" "}
//                 <Text style={styles.resendTimerBold}>{resendTimer}s</Text>
//               </Text>
//             )}
//           </View>

//           {/* Mode info */}
//           <View style={styles.modeInfo}>
//             <Text style={styles.modeText}>
//               {mode === "register"
//                 ? `Creating account for ${fullName || "you"}`
//                 : "Signing into your account"}
//             </Text>
//           </View>
//         </Animated.View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   root: {
//     flex: 1,
//     backgroundColor: colors.light.background,
//   },
//   scroll: {
//     flexGrow: 1,
//     paddingHorizontal: spacing.lg,
//   },
//   backBtn: {
//     marginBottom: spacing.lg,
//     alignSelf: "flex-start",
//   },
//   backText: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: colors.light.primary,
//   },
//   header: {
//     alignItems: "center",
//     marginBottom: spacing["2xl"],
//   },
//   iconBadge: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: colors.light.surfaceSecondary,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: spacing.md,
//     borderWidth: 2,
//     borderColor: colors.light.primary,
//   },
//   iconEmoji: {
//     fontSize: 38,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "800",
//     color: colors.light.text,
//     marginBottom: spacing.xs,
//   },
//   subtitle: {
//     fontSize: 15,
//     color: colors.light.textSecondary,
//   },
//   phoneDisplay: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: colors.light.primary,
//     marginTop: 4,
//     letterSpacing: 0.5,
//   },
//   card: {
//     backgroundColor: colors.light.surface,
//     borderRadius: radius.xl,
//     padding: spacing["2xl"],
//     gap: spacing.lg,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.06,
//     shadowRadius: 16,
//     elevation: 4,
//   },
//   otpRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     gap: spacing.sm,
//   },
//   otpBox: {
//     flex: 1,
//     height: 64,
//     borderRadius: radius.lg,
//     borderWidth: 2,
//     borderColor: colors.light.border,
//     backgroundColor: colors.light.background,
//     alignItems: "center",
//     justifyContent: "center",
//     position: "relative",
//   },
//   otpBoxFilled: {
//     borderColor: colors.light.primary,
//     backgroundColor: colors.light.surfaceSecondary,
//   },
//   otpBoxActive: {
//     borderColor: colors.light.primary,
//     shadowColor: colors.light.primary,
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   otpBoxError: {
//     borderColor: colors.light.error,
//     backgroundColor: "#FFF8F8",
//   },
//   otpInput: {
//     fontSize: 28,
//     fontWeight: "800",
//     color: colors.light.primary,
//     textAlign: "center",
//     width: "100%",
//     height: "100%",
//   },
//   cursor: {
//     position: "absolute",
//     bottom: 14,
//     width: 2,
//     height: 22,
//     backgroundColor: colors.light.primary,
//     borderRadius: 1,
//   },
//   errorRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: spacing.xs,
//   },
//   errorIcon: {
//     fontSize: 14,
//   },
//   errorText: {
//     flex: 1,
//     fontSize: 13,
//     color: colors.light.error,
//     fontWeight: "500",
//   },
//   hintText: {
//     fontSize: 13,
//     color: colors.light.textMuted,
//     textAlign: "center",
//   },
//   progressRow: {
//     flexDirection: "row",
//     justifyContent: "center",
//     gap: spacing.xs,
//   },
//   progressDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: colors.light.border,
//   },
//   progressDotFilled: {
//     backgroundColor: colors.light.primary,
//     width: 24,
//   },
//   button: {
//     height: 54,
//     borderRadius: radius.lg,
//     backgroundColor: colors.light.primary,
//     alignItems: "center",
//     justifyContent: "center",
//     shadowColor: colors.light.primary,
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.35,
//     shadowRadius: 12,
//     elevation: 6,
//   },
//   buttonPressed: {
//     backgroundColor: colors.light.primaryPressed,
//     shadowOpacity: 0.15,
//   },
//   buttonDisabled: {
//     backgroundColor: colors.light.border,
//     shadowOpacity: 0,
//     elevation: 0,
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 15,
//     fontWeight: "700",
//     letterSpacing: 0.3,
//   },
//   resendRow: {
//     alignItems: "center",
//     marginTop: spacing.md,
//   },
//   resendActive: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: colors.light.primary,
//     textDecorationLine: "underline",
//   },
//   resendTimer: {
//     fontSize: 14,
//     color: colors.light.textSecondary,
//   },
//   resendTimerBold: {
//     fontWeight: "700",
//     color: colors.light.primary,
//   },
//   modeInfo: {
//     alignItems: "center",
//     marginTop: spacing.md,
//     paddingHorizontal: spacing.lg,
//     paddingVertical: spacing.sm,
//     backgroundColor: colors.light.surface,
//     borderRadius: radius.lg,
//     borderWidth: 1,
//     borderColor: colors.light.border,
//   },
//   modeText: {
//     fontSize: 13,
//     color: colors.light.textSecondary,
//     textAlign: "center",
//   },
// });
import { sendOtp, verifyOtp } from "@/features/auth/api/auth.api";
import type { AuthUser } from "@/features/auth/store/auth.store";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { colors, radius, spacing } from "@/theme";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
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

const OTP_LENGTH = 4;
const RESEND_COOLDOWN = 30;

type OtpParams = {
  phone?: string;
  mode?: "login" | "register" | string;
  fullName?: string;
  email?: string;
};

export default function OtpRoute() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<OtpParams>();
  const phone = (params.phone as string) ?? "";
  const mode = (params.mode as string) ?? "login";
  const fullName = (params.fullName as string) ?? "";

  const loginWithToken = useAuthStore((s) => s.loginWithToken);

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const inputRefs = useRef<Array<TextInput | null>>(
    Array(OTP_LENGTH).fill(null),
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    setTimeout(() => inputRefs.current[0]?.focus(), 300);
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
    setOtp(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
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

  const handleOtpChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (error) setError("");

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (digit && index === OTP_LENGTH - 1) {
      const full = newOtp.join("");
      if (full.length === OTP_LENGTH) handleVerify(full);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpString?: string) => {
    const finalOtp = otpString ?? otp.join("");
    if (finalOtp.length < OTP_LENGTH) {
      setError("Please enter the complete 4-digit OTP");
      shake();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await verifyOtp(phone, finalOtp);

      if (res.Status === 200 && res.Data.length > 0) {
        const userData = res.Data[0];
        const token = userData.Token || userData.token;

        Animated.spring(successScale, {
          toValue: 1.05,
          useNativeDriver: true,
          damping: 10,
          stiffness: 200,
        }).start(() => {
          Animated.spring(successScale, {
            toValue: 1,
            useNativeDriver: true,
            damping: 10,
          }).start();
        });

        const user: AuthUser = {
          id: String(userData.CustomerId),
          fullName: userData.CustomerName,
          phone: userData.CustomerMobile,
          email: userData.customeremail,
          clientCode: userData.ClientCode,
        };

        await loginWithToken(user, token);
        router.replace("/(tabs)/home");
      } else {
        setError(res.Message || "Invalid or expired OTP. Please try again.");
        shake();
      }
    } catch (err: any) {
      setError(err?.message || "Network error. Check your connection.");
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
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      setResendTimer(RESEND_COOLDOWN);
      setCanResend(false);
    } catch {
      // silently ignore
    } finally {
      setResendLoading(false);
    }
  };

  const filledCount = otp.filter(Boolean).length;
  const isComplete = filledCount === OTP_LENGTH;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={12}
        >
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.logoImg}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.title}>OTP Verification</Text>
            <Text style={styles.subtitle}>We sent a 4-digit code to</Text>
            <Text style={styles.phoneDisplay}>+91 {phone}</Text>
          </View>

          <Animated.View
            style={[
              styles.card,
              {
                transform: [{ translateX: shakeAnim }, { scale: successScale }],
              },
            ]}
          >
            <View style={styles.otpRow}>
              {otp.map((digit, index) => (
                <Pressable
                  key={index}
                  onPress={() => inputRefs.current[index]?.focus()}
                  style={[
                    styles.otpBox,
                    digit ? styles.otpBoxFilled : null,
                    error ? styles.otpBoxError : null,
                    index === filledCount && !digit
                      ? styles.otpBoxActive
                      : null,
                  ]}
                >
                  <TextInput
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    value={digit}
                    onChangeText={(t) => handleOtpChange(t, index)}
                    onKeyPress={({ nativeEvent }) =>
                      handleKeyPress(nativeEvent.key, index)
                    }
                    keyboardType="number-pad"
                    maxLength={1}
                    style={styles.otpInput}
                    caretHidden
                    selectTextOnFocus
                  />
                  {!digit && index === filledCount ? (
                    <View style={styles.cursor} />
                  ) : null}
                </Pressable>
              ))}
            </View>

            {error ? (
              <View style={styles.errorRow}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : (
              <Text style={styles.hintText}>
                Enter 4-digit code sent to your mobile
              </Text>
            )}

            <View style={styles.progressRow}>
              {Array(OTP_LENGTH)
                .fill(null)
                .map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.progressDot,
                      i < filledCount ? styles.progressDotFilled : null,
                    ]}
                  />
                ))}
            </View>

            <Pressable
              onPress={() => handleVerify()}
              disabled={loading || !isComplete}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                (loading || !isComplete) && styles.buttonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isComplete
                    ? "Verify & Continue ✓"
                    : `Enter ${OTP_LENGTH - filledCount} more digit${OTP_LENGTH - filledCount > 1 ? "s" : ""}`}
                </Text>
              )}
            </Pressable>
          </Animated.View>

          <View style={styles.resendRow}>
            {canResend ? (
              <Pressable onPress={handleResend} disabled={resendLoading}>
                {resendLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.light.primary}
                  />
                ) : (
                  <Text style={styles.resendActive}>Resend OTP</Text>
                )}
              </Pressable>
            ) : (
              <Text style={styles.resendTimer}>
                Resend OTP in{" "}
                <Text style={styles.resendTimerBold}>{resendTimer}s</Text>
              </Text>
            )}
          </View>

          <View style={styles.modeInfo}>
            <Text style={styles.modeText}>
              {mode === "register"
                ? `Creating account for ${fullName || "you"}`
                : "Signing into your account"}
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.light.background },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.lg },
  backBtn: { marginBottom: spacing.lg, alignSelf: "flex-start" },
  backText: { fontSize: 15, fontWeight: "600", color: colors.light.primary },
  header: { alignItems: "center", marginBottom: spacing["2xl"] },
  logoWrap: {
    width: 96,
    height: 96,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: spacing.md,
    backgroundColor: colors.light.surfaceSecondary,
  },
  logoImg: { width: "100%", height: "100%" },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.light.text,
    marginBottom: spacing.xs,
  },
  subtitle: { fontSize: 15, color: colors.light.textSecondary },
  phoneDisplay: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.light.primary,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.light.surface,
    borderRadius: radius.xl,
    padding: spacing["2xl"],
    gap: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  otpBox: {
    flex: 1,
    height: 64,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.light.border,
    backgroundColor: colors.light.background,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  otpBoxFilled: {
    borderColor: colors.light.primary,
    backgroundColor: colors.light.surfaceSecondary,
  },
  otpBoxActive: {
    borderColor: colors.light.primary,
    shadowColor: colors.light.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  otpBoxError: { borderColor: colors.light.error, backgroundColor: "#FFF8F8" },
  otpInput: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.light.primary,
    textAlign: "center",
    width: "100%",
    height: "100%",
  },
  cursor: {
    position: "absolute",
    bottom: 14,
    width: 2,
    height: 22,
    backgroundColor: colors.light.primary,
    borderRadius: 1,
  },
  errorRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  errorIcon: { fontSize: 14 },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: colors.light.error,
    fontWeight: "500",
  },
  hintText: {
    fontSize: 13,
    color: colors.light.textMuted,
    textAlign: "center",
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xs,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.light.border,
  },
  progressDotFilled: { backgroundColor: colors.light.primary, width: 24 },
  button: {
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.light.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonPressed: {
    backgroundColor: colors.light.primaryPressed,
    shadowOpacity: 0.15,
  },
  buttonDisabled: {
    backgroundColor: colors.light.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  resendRow: { alignItems: "center", marginTop: spacing.md },
  resendActive: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.light.primary,
    textDecorationLine: "underline",
  },
  resendTimer: { fontSize: 14, color: colors.light.textSecondary },
  resendTimerBold: { fontWeight: "700", color: colors.light.primary },
  modeInfo: {
    alignItems: "center",
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.light.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  modeText: {
    fontSize: 13,
    color: colors.light.textSecondary,
    textAlign: "center",
  },
});
