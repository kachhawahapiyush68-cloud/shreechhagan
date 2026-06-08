// import { loginCustomer, sendOtp } from "@/features/auth/api/auth.api";
// import { radius, spacing, useTheme } from "@/theme";
// import { Image } from "expo-image";
// import { router } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import { useRef, useState } from "react";
// import {
//   ActivityIndicator,
//   Animated,
//   Dimensions,
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

// const { height: SCREEN_H } = Dimensions.get("window");
// const HERO_H = Math.round(SCREEN_H * 0.4);
// const MOBILE_LENGTH = 10;

// function sanitizePhone(value: string) {
//   return value.replace(/\D/g, "").slice(0, MOBILE_LENGTH);
// }

// // Pulls an HTTP status out of either a thrown error or a response-like object,
// // no matter how your http client shapes it.
// function extractStatus(source: unknown): number | undefined {
//   if (source && typeof source === "object") {
//     const obj = source as Record<string, any>;
//     const candidates = [
//       obj.status,
//       obj.statusCode,
//       obj.Status,
//       obj.response?.status,
//       obj.response?.Status,
//       obj.data?.Status,
//     ];
//     for (const c of candidates) {
//       if (typeof c === "number") return c;
//     }
//     const msg = typeof obj.message === "string" ? obj.message : "";
//     const match = msg.match(/\b(401|404)\b/);
//     if (match) return Number(match[1]);
//   }
//   return undefined;
// }

// export default function LoginRoute() {
//   const insets = useSafeAreaInsets();
//   const { colors } = useTheme();

//   const [phone, setPhone] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const shakeAnim = useRef(new Animated.Value(0)).current;
//   const cleanedPhone = sanitizePhone(phone);

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

//   const goToRegister = () => {
//     router.push({
//       pathname: "/(auth)/register",
//       params: { phone: cleanedPhone },
//     });
//   };

//   const handleLogin = async () => {
//     if (cleanedPhone.length < MOBILE_LENGTH) {
//       setError("Please enter a valid 10-digit mobile number");
//       shake();
//       return;
//     }

//     setError("");
//     setLoading(true);

//     try {
//       const res = await loginCustomer(cleanedPhone);
//       if (__DEV__) console.log("LOGIN RES →", JSON.stringify(res));

//       // Existing user (account data came back) → send OTP and verify.
//       const isExistingUser =
//         res.Status === 200 && Array.isArray(res.Data) && res.Data.length > 0;

//       if (isExistingUser) {
//         try {
//           await sendOtp(cleanedPhone);
//         } catch {
//           // Continue to OTP even if resend trigger fails.
//         }
//         router.push({
//           pathname: "/(auth)/otp",
//           params: { phone: cleanedPhone, mode: "login" },
//         });
//         return;
//       }

//       const status = extractStatus(res);

//       // Number not registered → register screen.
//       if (status === 401 || status === 404 || res.Status === 200) {
//         goToRegister();
//         return;
//       }

//       // Anything else is a real error.
//       setError(res.Message || "Something went wrong. Please try again.");
//       shake();
//     } catch (err: unknown) {
//       if (__DEV__) console.log("LOGIN ERR →", JSON.stringify(err), err);

//       const status = extractStatus(err);

//       // Thrown 401/404 from the http client → number not registered → register.
//       if (status === 401 || status === 404) {
//         goToRegister();
//         return;
//       }

//       const message =
//         err instanceof Error
//           ? err.message
//           : "Network error. Check your connection.";
//       setError(message);
//       shake();
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       style={[styles.root, { backgroundColor: colors.surface }]}
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//     >
//       <StatusBar style="light" />
//       <View style={{ height: insets.top, backgroundColor: colors.primary }} />

//       <ScrollView
//         contentContainerStyle={styles.scroll}
//         keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={false}
//         bounces={false}
//       >
//         <View style={[styles.hero, { height: HERO_H }]}>
//           {/* TODO: swap logo.png for the donut hero photo from the design */}
//           <Image
//             source={require("../../assets/images/logo.png")}
//             style={styles.heroImage}
//             contentFit="contain"
//           />
//         </View>

//         <View
//           style={[
//             styles.panel,
//             {
//               backgroundColor: colors.surfaceSecondary,
//               paddingBottom: insets.bottom + spacing.xl,
//             },
//           ]}
//         >
//           <Text style={[styles.title, { color: colors.text }]}>Login</Text>

//           <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
//             Welcome to ShreeChhagan, please login to your account using your
//             mobile number
//           </Text>

//           <Animated.View
//             style={[
//               styles.inputWrap,
//               {
//                 backgroundColor: colors.surface,
//                 borderColor: error ? colors.error : "transparent",
//                 shadowColor: colors.black,
//                 transform: [{ translateX: shakeAnim }],
//               },
//             ]}
//           >
//             <Text style={[styles.prefix, { color: colors.text }]}>+91</Text>

//             <TextInput
//               value={phone}
//               onChangeText={(text) => {
//                 setPhone(sanitizePhone(text));
//                 if (error) setError("");
//               }}
//               keyboardType="phone-pad"
//               textContentType="telephoneNumber"
//               autoComplete="tel"
//               maxLength={10}
//               placeholder="Enter mobile number"
//               placeholderTextColor={colors.textMuted}
//               style={[styles.input, { color: colors.text }]}
//             />
//           </Animated.View>

//           {error ? (
//             <Text style={[styles.errorText, { color: colors.error }]}>
//               {error}
//             </Text>
//           ) : null}

//           <Pressable
//             onPress={handleLogin}
//             disabled={loading}
//             style={({ pressed }) => [
//               styles.button,
//               {
//                 backgroundColor:
//                   pressed && !loading ? colors.primaryPressed : colors.primary,
//               },
//               loading && styles.buttonDisabled,
//             ]}
//           >
//             {loading ? (
//               <ActivityIndicator color={colors.white} />
//             ) : (
//               <Text style={[styles.buttonText, { color: colors.white }]}>
//                 Login
//               </Text>
//             )}
//           </Pressable>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   root: { flex: 1 },
//   scroll: { flexGrow: 1 },
//   hero: { alignItems: "center", justifyContent: "center" },
//   heroImage: { width: "100%", height: "100%" },
//   panel: {
//     flexGrow: 1,
//     borderTopLeftRadius: 28,
//     borderTopRightRadius: 28,
//     paddingHorizontal: spacing.lg,
//     paddingTop: spacing.xl,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "800",
//     textAlign: "center",
//     marginBottom: spacing.xs,
//   },
//   subtitle: {
//     fontSize: 14,
//     lineHeight: 20,
//     textAlign: "center",
//     marginBottom: spacing.xl,
//   },
//   inputWrap: {
//     flexDirection: "row",
//     alignItems: "center",
//     height: 56,
//     borderRadius: radius.lg,
//     borderWidth: 1.5,
//     paddingHorizontal: spacing.md,
//     columnGap: spacing.sm,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.06,
//     shadowRadius: 6,
//     elevation: 2,
//   },
//   prefix: { fontSize: 16, fontWeight: "700" },
//   input: { flex: 1, height: "100%", fontSize: 16 },
//   errorText: { fontSize: 12, marginTop: spacing.xs },
//   button: {
//     height: 56,
//     borderRadius: radius.lg,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: spacing.lg,
//   },
//   buttonDisabled: { opacity: 0.6 },
//   buttonText: { fontSize: 16, fontWeight: "700" },
// });
import { loginCustomer, sendOtp } from "@/features/auth/api/auth.api";
import { radius, spacing, useTheme } from "@/theme";
import { Image } from "expo-image";
import { router } from "expo-router";
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
const HERO_H = Math.round(SCREEN_H * 0.4);
const MOBILE_LENGTH = 10;

function sanitizePhone(value: string) {
  return value.replace(/\D/g, "").slice(0, MOBILE_LENGTH);
}

function extractStatus(source: unknown): number | undefined {
  if (source && typeof source === "object") {
    const obj = source as Record<string, any>;
    const candidates = [
      obj.status,
      obj.statusCode,
      obj.Status,
      obj.response?.status,
      obj.response?.Status,
      obj.data?.Status,
    ];

    for (const c of candidates) {
      if (typeof c === "number") return c;
    }

    const msg = typeof obj.message === "string" ? obj.message : "";
    const match = msg.match(/\b(401|404)\b/);
    if (match) return Number(match[1]);
  }

  return undefined;
}

export default function LoginRoute() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const cleanedPhone = sanitizePhone(phone);

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

  const goToRegister = () => {
    router.push({
      pathname: "/(auth)/register",
      params: { phone: cleanedPhone },
    });
  };

  const handleLogin = async () => {
    if (cleanedPhone.length < MOBILE_LENGTH) {
      setError("Please enter a valid 10-digit mobile number");
      shake();
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await loginCustomer(cleanedPhone);
      if (__DEV__) console.log("LOGIN RES →", JSON.stringify(res));

      const isExistingUser =
        res.Status === 200 && Array.isArray(res.Data) && res.Data.length > 0;

      if (isExistingUser) {
        try {
          await sendOtp(cleanedPhone);
        } catch {}

        router.push({
          pathname: "/(auth)/otp",
          params: { phone: cleanedPhone, mode: "login" },
        });
        return;
      }

      const status = extractStatus(res);

      if (status === 401 || status === 404 || res.Status === 200) {
        goToRegister();
        return;
      }

      setError(res.Message || "Something went wrong. Please try again.");
      shake();
    } catch (err: unknown) {
      if (__DEV__) console.log("LOGIN ERR →", JSON.stringify(err), err);

      const status = extractStatus(err);

      if (status === 401 || status === 404) {
        goToRegister();
        return;
      }

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

  const panelBg = isDark ? colors.surfaceSecondary : colors.skeletonBase;
  const inputBlockBg = isDark ? colors.surface : colors.white;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.surface }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <StatusBar style="light" />
      <View style={{ height: insets.top, backgroundColor: colors.primary }} />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={[styles.hero, { height: HERO_H }]}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.heroImage}
            contentFit="contain"
          />
        </View>

        <View
          style={[
            styles.panel,
            {
              backgroundColor: panelBg,
              paddingBottom: insets.bottom + spacing.xl,
              minHeight: SCREEN_H - HERO_H,
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>Login</Text>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Welcome to ShreeChhagan, please login to your account using your
            mobile number
          </Text>

          <Animated.View
            style={[
              styles.inputWrap,
              {
                backgroundColor: inputBlockBg,
                borderColor: error ? colors.error : colors.border,
                shadowColor: colors.black,
                transform: [{ translateX: shakeAnim }],
              },
            ]}
          >
            <Text style={[styles.prefix, { color: colors.text }]}>+91</Text>

            <TextInput
              value={phone}
              onChangeText={(text) => {
                setPhone(sanitizePhone(text));
                if (error) setError("");
              }}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              autoComplete="tel"
              maxLength={10}
              placeholder="Enter mobile number"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { color: colors.text }]}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </Animated.View>

          {error ? (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error}
            </Text>
          ) : null}

          <Pressable
            onPress={handleLogin}
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
                Login
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1 },
  hero: { alignItems: "center", justifyContent: "center" },
  heroImage: { width: "100%", height: "100%" },
  panel: {
    flexGrow: 1,
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
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  prefix: {
    fontSize: 16,
    fontWeight: "700",
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
  button: {
    height: 56,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
