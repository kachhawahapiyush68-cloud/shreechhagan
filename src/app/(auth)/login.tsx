// import { loginCustomer, sendOtp } from "@/features/auth/api/auth.api";
// import { colors, radius, spacing } from "@/theme";
// import { router } from "expo-router";
// import { useRef, useState } from "react";
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

// export default function LoginRoute() {
//   const insets = useSafeAreaInsets();
//   const [phone, setPhone] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const shakeAnim = useRef(new Animated.Value(0)).current;
//   const inputScale = useRef(new Animated.Value(1)).current;

//   const shake = () => {
//     Animated.sequence([
//       Animated.timing(shakeAnim, {
//         toValue: 10,
//         duration: 60,
//         useNativeDriver: true,
//       }),
//       Animated.timing(shakeAnim, {
//         toValue: -10,
//         duration: 60,
//         useNativeDriver: true,
//       }),
//       Animated.timing(shakeAnim, {
//         toValue: 8,
//         duration: 60,
//         useNativeDriver: true,
//       }),
//       Animated.timing(shakeAnim, {
//         toValue: -8,
//         duration: 60,
//         useNativeDriver: true,
//       }),
//       Animated.timing(shakeAnim, {
//         toValue: 0,
//         duration: 60,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   };

//   const handleFocus = () => {
//     Animated.spring(inputScale, {
//       toValue: 1.02,
//       useNativeDriver: true,
//       damping: 15,
//       stiffness: 200,
//     }).start();
//   };

//   const handleBlur = () => {
//     Animated.spring(inputScale, {
//       toValue: 1,
//       useNativeDriver: true,
//       damping: 15,
//       stiffness: 200,
//     }).start();
//   };

//   const handleContinue = async () => {
//     const cleaned = phone.replace(/\D/g, "");
//     if (cleaned.length < 10) {
//       setError("Please enter a valid 10-digit mobile number");
//       shake();
//       return;
//     }
//     setError("");
//     setLoading(true);

//     try {
//       const res = await loginCustomer(cleaned);

//       // See exactly what the backend returns so you know which branch fires.
//       if (__DEV__) console.log("LOGIN RES →", JSON.stringify(res));

//       if (res.Status === 200) {
//         // Existing user. Send OTP, but DON'T let a send failure block
//         // navigation — the OTP screen has its own "Resend OTP" button.
//         try {
//           await sendOtp(cleaned);
//         } catch (e) {
//           if (__DEV__) console.warn("sendOtp failed (continuing to OTP):", e);
//         }
//         router.push({
//           pathname: "/(auth)/otp",
//           params: { phone: cleaned, mode: "login" },
//         });
//       } else if (res.Status === 401) {
//         // Not registered → registration screen
//         router.push({
//           pathname: "/(auth)/register",
//           params: { phone: cleaned },
//         });
//       } else {
//         setError(res.Message || "Something went wrong. Please try again.");
//         shake();
//       }
//     } catch (err: any) {
//       setError(err?.message || "Network error. Check your connection.");
//       shake();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const isPhoneComplete = phone.replace(/\D/g, "").length === 10;

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
//         <View style={styles.header}>
//           <View style={styles.iconBadge}>
//             <Text style={styles.iconEmoji}>📱</Text>
//           </View>
//           <Text style={styles.title}>Welcome back!</Text>
//           <Text style={styles.subtitle}>
//             Enter your mobile number to sign in or create your account.
//           </Text>
//         </View>

//         <View style={styles.card}>
//           <Text style={styles.label}>Mobile Number</Text>

//           <Animated.View
//             style={[
//               styles.inputWrap,
//               { transform: [{ translateX: shakeAnim }, { scale: inputScale }] },
//               error ? styles.inputWrapError : null,
//             ]}
//           >
//             <View style={styles.prefixBox}>
//               <Text style={styles.prefix}>🇮🇳 +91</Text>
//             </View>
//             <TextInput
//               value={phone}
//               onChangeText={(t) => {
//                 setPhone(t);
//                 if (error) setError("");
//               }}
//               onFocus={handleFocus}
//               onBlur={handleBlur}
//               keyboardType="phone-pad"
//               maxLength={10}
//               placeholder="Enter 10-digit number"
//               placeholderTextColor={colors.light.textMuted}
//               style={styles.input}
//             />
//             {isPhoneComplete && (
//               <View style={styles.checkBadge}>
//                 <Text style={styles.checkIcon}>✓</Text>
//               </View>
//             )}
//           </Animated.View>

//           {error ? (
//             <Animated.Text style={styles.errorText}>{error}</Animated.Text>
//           ) : (
//             <Text style={styles.hintText}>We will send you a 4-digit OTP</Text>
//           )}

//           <Pressable
//             onPress={handleContinue}
//             disabled={loading}
//             style={({ pressed }) => [
//               styles.button,
//               pressed && styles.buttonPressed,
//               loading && styles.buttonDisabled,
//             ]}
//           >
//             {loading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.buttonText}>Continue →</Text>
//             )}
//           </Pressable>
//         </View>

//         <Text style={styles.footerText}>
//           By continuing, you agree to our{" "}
//           <Text style={styles.footerLink}>Terms of Service</Text> and{" "}
//           <Text style={styles.footerLink}>Privacy Policy</Text>.
//         </Text>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   root: { flex: 1, backgroundColor: colors.light.background },
//   scroll: { flexGrow: 1, paddingHorizontal: spacing.lg },
//   header: { alignItems: "center", marginBottom: spacing["2xl"] },
//   iconBadge: {
//     width: 72,
//     height: 72,
//     borderRadius: 36,
//     backgroundColor: colors.light.surfaceSecondary,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: spacing.md,
//   },
//   iconEmoji: { fontSize: 34 },
//   title: {
//     fontSize: 28,
//     fontWeight: "800",
//     color: colors.light.text,
//     marginBottom: spacing.xs,
//     textAlign: "center",
//   },
//   subtitle: {
//     fontSize: 15,
//     color: colors.light.textSecondary,
//     textAlign: "center",
//     lineHeight: 22,
//   },
//   card: {
//     backgroundColor: colors.light.surface,
//     borderRadius: radius.xl,
//     padding: spacing["2xl"],
//     gap: spacing.md,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.06,
//     shadowRadius: 16,
//     elevation: 4,
//   },
//   label: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: colors.light.textSecondary,
//     textTransform: "uppercase",
//     letterSpacing: 0.8,
//   },
//   inputWrap: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1.5,
//     borderColor: colors.light.border,
//     borderRadius: radius.lg,
//     backgroundColor: colors.light.background,
//     overflow: "hidden",
//   },
//   inputWrapError: { borderColor: colors.light.error },
//   prefixBox: {
//     paddingHorizontal: spacing.sm,
//     paddingVertical: spacing.md,
//     borderRightWidth: 1,
//     borderRightColor: colors.light.border,
//     backgroundColor: colors.light.surface,
//   },
//   prefix: { fontSize: 15, fontWeight: "600", color: colors.light.text },
//   input: {
//     flex: 1,
//     height: 52,
//     paddingHorizontal: spacing.md,
//     fontSize: 17,
//     fontWeight: "600",
//     color: colors.light.text,
//     letterSpacing: 1,
//   },
//   checkBadge: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: colors.light.success,
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: spacing.sm,
//   },
//   checkIcon: { color: "#fff", fontSize: 14, fontWeight: "700" },
//   hintText: { fontSize: 12, color: colors.light.textMuted },
//   errorText: { fontSize: 12, color: colors.light.error, fontWeight: "500" },
//   button: {
//     height: 54,
//     borderRadius: radius.lg,
//     backgroundColor: colors.light.primary,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: spacing.xs,
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
//   buttonDisabled: { opacity: 0.6 },
//   buttonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "700",
//     letterSpacing: 0.3,
//   },
//   footerText: {
//     marginTop: spacing.xl,
//     fontSize: 12,
//     color: colors.light.textMuted,
//     textAlign: "center",
//     lineHeight: 18,
//   },
//   footerLink: { color: colors.light.primary, fontWeight: "600" },
// });
import { loginCustomer, sendOtp } from "@/features/auth/api/auth.api";
import { colors, radius, spacing } from "@/theme";
import { router } from "expo-router";
import { useRef, useState } from "react";
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

export default function LoginRoute() {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const inputScale = useRef(new Animated.Value(1)).current;

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

  const handleFocus = () => {
    Animated.spring(inputScale, {
      toValue: 1.02,
      useNativeDriver: true,
      damping: 15,
      stiffness: 200,
    }).start();
  };

  const handleBlur = () => {
    Animated.spring(inputScale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 15,
      stiffness: 200,
    }).start();
  };

  const handleContinue = async () => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      shake();
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await loginCustomer(cleaned);
      if (__DEV__) console.log("LOGIN RES →", JSON.stringify(res));

      if (res.Status === 200) {
        try {
          await sendOtp(cleaned);
        } catch (e) {
          if (__DEV__) console.warn("sendOtp failed (continuing to OTP):", e);
        }
        router.push({
          pathname: "/(auth)/otp",
          params: { phone: cleaned, mode: "login" },
        });
      } else if (res.Status === 401) {
        router.push({
          pathname: "/(auth)/register",
          params: { phone: cleaned },
        });
      } else {
        setError(res.Message || "Something went wrong. Please try again.");
        shake();
      }
    } catch (err: any) {
      setError(err?.message || "Network error. Check your connection.");
      shake();
    } finally {
      setLoading(false);
    }
  };

  const isPhoneComplete = phone.replace(/\D/g, "").length === 10;

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
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logoImg}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.title}>Welcome back!</Text>
          <Text style={styles.subtitle}>
            Enter your mobile number to sign in or create your account.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Mobile Number</Text>

          <Animated.View
            style={[
              styles.inputWrap,
              { transform: [{ translateX: shakeAnim }, { scale: inputScale }] },
              error ? styles.inputWrapError : null,
            ]}
          >
            <View style={styles.prefixBox}>
              <Text style={styles.prefix}>🇮🇳 +91</Text>
            </View>
            <TextInput
              value={phone}
              onChangeText={(t) => {
                setPhone(t);
                if (error) setError("");
              }}
              onFocus={handleFocus}
              onBlur={handleBlur}
              keyboardType="phone-pad"
              maxLength={10}
              placeholder="Enter 10-digit number"
              placeholderTextColor={colors.light.textMuted}
              style={styles.input}
            />
            {isPhoneComplete && (
              <View style={styles.checkBadge}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
            )}
          </Animated.View>

          {error ? (
            <Animated.Text style={styles.errorText}>{error}</Animated.Text>
          ) : (
            <Text style={styles.hintText}>We will send you a 4-digit OTP</Text>
          )}

          <Pressable
            onPress={handleContinue}
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              loading && styles.buttonDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Continue →</Text>
            )}
          </Pressable>
        </View>

        <Text style={styles.footerText}>
          By continuing, you agree to our{" "}
          <Text style={styles.footerLink}>Terms of Service</Text> and{" "}
          <Text style={styles.footerLink}>Privacy Policy</Text>.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.light.background },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.lg },
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
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.light.surface,
    borderRadius: radius.xl,
    padding: spacing["2xl"],
    gap: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.light.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.light.border,
    borderRadius: radius.lg,
    backgroundColor: colors.light.background,
    overflow: "hidden",
  },
  inputWrapError: { borderColor: colors.light.error },
  prefixBox: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.light.border,
    backgroundColor: colors.light.surface,
  },
  prefix: { fontSize: 15, fontWeight: "600", color: colors.light.text },
  input: {
    flex: 1,
    height: 52,
    paddingHorizontal: spacing.md,
    fontSize: 17,
    fontWeight: "600",
    color: colors.light.text,
    letterSpacing: 1,
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.light.success,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  checkIcon: { color: "#fff", fontSize: 14, fontWeight: "700" },
  hintText: { fontSize: 12, color: colors.light.textMuted },
  errorText: { fontSize: 12, color: colors.light.error, fontWeight: "500" },
  button: {
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xs,
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
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  footerText: {
    marginTop: spacing.xl,
    fontSize: 12,
    color: colors.light.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
  footerLink: { color: colors.light.primary, fontWeight: "600" },
});
