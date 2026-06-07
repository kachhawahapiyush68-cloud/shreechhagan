// import { registerCustomer, sendOtp } from "@/features/auth/api/auth.api";
// import { colors, radius, spacing } from "@/theme";
// import { router, useLocalSearchParams } from "expo-router";
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

// type FieldKey = "name" | "email" | "phone";

// export default function RegisterRoute() {
//   const insets = useSafeAreaInsets();
//   const params = useLocalSearchParams<{ phone?: string }>();
//   const initialPhone = (params.phone as string) ?? "";

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState(initialPhone);
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
//   const [apiError, setApiError] = useState("");

//   const shakeAnim = useRef(new Animated.Value(0)).current;

//   const shake = () => {
//     Animated.sequence([
//       Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
//       Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
//       Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
//       Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
//       Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
//     ]).start();
//   };

//   const validate = (): boolean => {
//     const newErrors: Partial<Record<FieldKey, string>> = {};
//     if (!name.trim()) newErrors.name = "Full name is required";
//     if (!email.trim()) {
//       newErrors.email = "Email is required";
//     } else if (!/\S+@\S+\.\S+/.test(email)) {
//       newErrors.email = "Enter a valid email address";
//     }
//     const cleaned = phone.replace(/\D/g, "");
//     if (cleaned.length < 10) newErrors.phone = "Enter a valid 10-digit mobile number";
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleRegister = async () => {
//     if (!validate()) {
//       shake();
//       return;
//     }
//     setApiError("");
//     setLoading(true);

//     const cleaned = phone.replace(/\D/g, "");

//     try {
//       const res = await registerCustomer(name.trim(), cleaned, email.trim());

//       if (res.Status === 200) {
//         // Registration success → send OTP → navigate to OTP
//         await sendOtp(cleaned);
//         router.push({
//           pathname: "/(auth)/otp",
//           params: {
//             phone: cleaned,
//             mode: "register",
//             fullName: name.trim(),
//             email: email.trim(),
//           },
//         });
//       } else {
//         // API error (e.g. email already exists)
//         setApiError(res.Message || "Registration failed. Please try again.");
//         shake();
//       }
//     } catch (err: any) {
//       setApiError(err?.message || "Network error. Check your connection.");
//       shake();
//     } finally {
//       setLoading(false);
//     }
//   };

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
//         {/* Back button */}
//         <Pressable
//           onPress={() => router.back()}
//           style={styles.backBtn}
//           hitSlop={12}
//         >
//           <Text style={styles.backIcon}>← Back</Text>
//         </Pressable>

//         {/* Header */}
//         <View style={styles.header}>
//           <View style={styles.iconBadge}>
//             <Text style={styles.iconEmoji}>👤</Text>
//           </View>
//           <Text style={styles.title}>Create Account</Text>
//           <Text style={styles.subtitle}>
//             Welcome to ShreeChhagan! Fill in your details to get started.
//           </Text>
//         </View>

//         {/* API Error Banner */}
//         {apiError ? (
//           <Animated.View style={[styles.errorBanner, { transform: [{ translateX: shakeAnim }] }]}>
//             <Text style={styles.errorBannerIcon}>⚠️</Text>
//             <Text style={styles.errorBannerText}>{apiError}</Text>
//           </Animated.View>
//         ) : null}

//         {/* Form card */}
//         <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>

//           {/* Full Name */}
//           <View style={styles.fieldGroup}>
//             <Text style={styles.label}>Full Name</Text>
//             <View style={[styles.inputRow, errors.name ? styles.inputRowError : null]}>
//               <Text style={styles.fieldIcon}>👤</Text>
//               <TextInput
//                 value={name}
//                 onChangeText={(t) => { setName(t); setErrors((e) => ({ ...e, name: undefined })); }}
//                 placeholder="Enter your full name"
//                 placeholderTextColor={colors.light.textMuted}
//                 style={styles.input}
//                 autoCapitalize="words"
//               />
//             </View>
//             {errors.name ? <Text style={styles.fieldError}>{errors.name}</Text> : null}
//           </View>

//           {/* Email */}
//           <View style={styles.fieldGroup}>
//             <Text style={styles.label}>Email Address</Text>
//             <View style={[styles.inputRow, errors.email ? styles.inputRowError : null]}>
//               <Text style={styles.fieldIcon}>✉️</Text>
//               <TextInput
//                 value={email}
//                 onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: undefined })); }}
//                 placeholder="Enter your email"
//                 placeholderTextColor={colors.light.textMuted}
//                 style={styles.input}
//                 keyboardType="email-address"
//                 autoCapitalize="none"
//               />
//             </View>
//             {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}
//           </View>

//           {/* Mobile */}
//           <View style={styles.fieldGroup}>
//             <Text style={styles.label}>Mobile Number</Text>
//             <View style={[styles.inputRow, errors.phone ? styles.inputRowError : null]}>
//               <Text style={styles.prefixText}>🇮🇳 +91</Text>
//               <View style={styles.divider} />
//               <TextInput
//                 value={phone}
//                 onChangeText={(t) => { setPhone(t); setErrors((e) => ({ ...e, phone: undefined })); }}
//                 placeholder="10-digit number"
//                 placeholderTextColor={colors.light.textMuted}
//                 style={styles.input}
//                 keyboardType="phone-pad"
//                 maxLength={10}
//               />
//             </View>
//             {errors.phone ? <Text style={styles.fieldError}>{errors.phone}</Text> : null}
//           </View>

//           {/* Submit */}
//           <Pressable
//             onPress={handleRegister}
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
//               <Text style={styles.buttonText}>Create Account →</Text>
//             )}
//           </Pressable>
//         </Animated.View>

//         {/* Already have account */}
//         <Pressable onPress={() => router.replace("/(auth)/login")} style={styles.loginRow}>
//           <Text style={styles.loginText}>
//             Already have an account?{" "}
//             <Text style={styles.loginLink}>Sign In</Text>
//           </Text>
//         </Pressable>
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
//   backIcon: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: colors.light.primary,
//   },
//   header: {
//     alignItems: "center",
//     marginBottom: spacing.xl,
//   },
//   iconBadge: {
//     width: 72,
//     height: 72,
//     borderRadius: 36,
//     backgroundColor: colors.light.surfaceSecondary,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: spacing.md,
//   },
//   iconEmoji: {
//     fontSize: 34,
//   },
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
//   errorBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#FEF2F2",
//     borderWidth: 1,
//     borderColor: "#FECACA",
//     borderRadius: radius.lg,
//     paddingHorizontal: spacing.md,
//     paddingVertical: spacing.sm,
//     marginBottom: spacing.md,
//     gap: spacing.xs,
//   },
//   errorBannerIcon: {
//     fontSize: 16,
//   },
//   errorBannerText: {
//     flex: 1,
//     fontSize: 13,
//     color: colors.light.error,
//     fontWeight: "500",
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
//   fieldGroup: {
//     gap: spacing.xs,
//   },
//   label: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: colors.light.textSecondary,
//     textTransform: "uppercase",
//     letterSpacing: 0.8,
//   },
//   inputRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1.5,
//     borderColor: colors.light.border,
//     borderRadius: radius.lg,
//     backgroundColor: colors.light.background,
//     height: 54,
//     paddingHorizontal: spacing.md,
//     gap: spacing.sm,
//   },
//   inputRowError: {
//     borderColor: colors.light.error,
//     backgroundColor: "#FFF8F8",
//   },
//   fieldIcon: {
//     fontSize: 18,
//   },
//   prefixText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: colors.light.text,
//   },
//   divider: {
//     width: 1,
//     height: 22,
//     backgroundColor: colors.light.border,
//   },
//   input: {
//     flex: 1,
//     fontSize: 16,
//     color: colors.light.text,
//     height: 54,
//   },
//   fieldError: {
//     fontSize: 12,
//     color: colors.light.error,
//     fontWeight: "500",
//   },
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
//   buttonDisabled: {
//     opacity: 0.6,
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "700",
//     letterSpacing: 0.3,
//   },
//   loginRow: {
//     marginTop: spacing.xl,
//     alignItems: "center",
//   },
//   loginText: {
//     fontSize: 14,
//     color: colors.light.textSecondary,
//   },
//   loginLink: {
//     color: colors.light.primary,
//     fontWeight: "700",
//   },
// });
import { registerCustomer, sendOtp } from "@/features/auth/api/auth.api";
import { colors, radius, spacing } from "@/theme";
import { router, useLocalSearchParams } from "expo-router";
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

type FieldKey = "name" | "email" | "phone";

export default function RegisterRoute() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ phone?: string }>();
  const initialPhone = (params.phone as string) ?? "";

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
    const newErrors: Partial<Record<FieldKey, string>> = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 10)
      newErrors.phone = "Enter a valid 10-digit mobile number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) {
      shake();
      return;
    }
    setApiError("");
    setLoading(true);

    const cleaned = phone.replace(/\D/g, "");

    try {
      const res = await registerCustomer(name.trim(), cleaned, email.trim());

      if (res.Status === 200) {
        await sendOtp(cleaned);
        router.push({
          pathname: "/(auth)/otp",
          params: {
            phone: cleaned,
            mode: "register",
            fullName: name.trim(),
            email: email.trim(),
          },
        });
      } else {
        setApiError(res.Message || "Registration failed. Please try again.");
        shake();
      }
    } catch (err: any) {
      setApiError(err?.message || "Network error. Check your connection.");
      shake();
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.backIcon}>← Back</Text>
        </Pressable>

        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logoImg}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Welcome to ShreeChhagan! Fill in your details to get started.
          </Text>
        </View>

        {apiError ? (
          <Animated.View
            style={[
              styles.errorBanner,
              { transform: [{ translateX: shakeAnim }] },
            ]}
          >
            <Text style={styles.errorBannerIcon}>⚠️</Text>
            <Text style={styles.errorBannerText}>{apiError}</Text>
          </Animated.View>
        ) : null}

        <Animated.View
          style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}
        >
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View
              style={[
                styles.inputRow,
                errors.name ? styles.inputRowError : null,
              ]}
            >
              <Text style={styles.fieldIcon}>👤</Text>
              <TextInput
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  setErrors((e) => ({ ...e, name: undefined }));
                }}
                placeholder="Enter your full name"
                placeholderTextColor={colors.light.textMuted}
                style={styles.input}
                autoCapitalize="words"
              />
            </View>
            {errors.name ? (
              <Text style={styles.fieldError}>{errors.name}</Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View
              style={[
                styles.inputRow,
                errors.email ? styles.inputRowError : null,
              ]}
            >
              <Text style={styles.fieldIcon}>✉️</Text>
              <TextInput
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setErrors((e) => ({ ...e, email: undefined }));
                }}
                placeholder="Enter your email"
                placeholderTextColor={colors.light.textMuted}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email ? (
              <Text style={styles.fieldError}>{errors.email}</Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Mobile Number</Text>
            <View
              style={[
                styles.inputRow,
                errors.phone ? styles.inputRowError : null,
              ]}
            >
              <Text style={styles.prefixText}>🇮🇳 +91</Text>
              <View style={styles.divider} />
              <TextInput
                value={phone}
                onChangeText={(t) => {
                  setPhone(t);
                  setErrors((e) => ({ ...e, phone: undefined }));
                }}
                placeholder="10-digit number"
                placeholderTextColor={colors.light.textMuted}
                style={styles.input}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
            {errors.phone ? (
              <Text style={styles.fieldError}>{errors.phone}</Text>
            ) : null}
          </View>

          <Pressable
            onPress={handleRegister}
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
              <Text style={styles.buttonText}>Create Account →</Text>
            )}
          </Pressable>
        </Animated.View>

        <Pressable
          onPress={() => router.replace("/(auth)/login")}
          style={styles.loginRow}
        >
          <Text style={styles.loginText}>
            Already have an account?{" "}
            <Text style={styles.loginLink}>Sign In</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.light.background },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.lg },
  backBtn: { marginBottom: spacing.lg, alignSelf: "flex-start" },
  backIcon: { fontSize: 15, fontWeight: "600", color: colors.light.primary },
  header: { alignItems: "center", marginBottom: spacing.xl },
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
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  errorBannerIcon: { fontSize: 16 },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: colors.light.error,
    fontWeight: "500",
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
  fieldGroup: { gap: spacing.xs },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.light.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.light.border,
    borderRadius: radius.lg,
    backgroundColor: colors.light.background,
    height: 54,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  inputRowError: {
    borderColor: colors.light.error,
    backgroundColor: "#FFF8F8",
  },
  fieldIcon: { fontSize: 18 },
  prefixText: { fontSize: 14, fontWeight: "600", color: colors.light.text },
  divider: { width: 1, height: 22, backgroundColor: colors.light.border },
  input: { flex: 1, fontSize: 16, color: colors.light.text, height: 54 },
  fieldError: { fontSize: 12, color: colors.light.error, fontWeight: "500" },
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
  loginRow: { marginTop: spacing.xl, alignItems: "center" },
  loginText: { fontSize: 14, color: colors.light.textSecondary },
  loginLink: { color: colors.light.primary, fontWeight: "700" },
});
