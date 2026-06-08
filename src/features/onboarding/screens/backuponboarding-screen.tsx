// import { Image } from "expo-image";
// import { router } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import { useRef, useState } from "react";
// import {
//   Dimensions,
//   FlatList,
//   Pressable,
//   StyleSheet,
//   Text,
//   View,
//   type ViewToken,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// import { PrimaryButton } from "@/components/ui/primary-button";
// import { useAuthStore } from "@/features/auth/store/auth.store";
// import { radius, spacing, useTheme } from "@/theme";

// const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
// const IMAGE_HEIGHT = Math.round(SCREEN_H * 0.55);

// type Slide = {
//   id: string;
//   image: number;
//   title: string;
//   description: string;
// };

// // NOTE: swap these requires for the actual onboarding hero photos from your
// // design (the muffin / donut shots). These point at your existing assets.
// const slides: Slide[] = [
//   {
//     id: "1",
//     image: require("../../../assets/images/chhagan03.jpg"),
//     title: "Fresh from the oven",
//     description:
//       "Cakes, breads, and bakes prepared every morning and delivered warm to your door.",
//   },
//   {
//     id: "2",
//     image: require("../../../assets/images/chhagan02.jpg"),
//     title: "Order in a few taps",
//     description:
//       "Browse categories, pick your favourites, and check out in seconds with saved details.",
//   },
//   {
//     id: "3",
//     image: require("../../../assets/images/chhagan03.jpg"),
//     title: "Offers you will love",
//     description:
//       "Unlock promo codes and seasonal deals so every order tastes a little sweeter.",
//   },
// ];

// export function OnboardingScreen() {
//   const { colors } = useTheme();
//   const insets = useSafeAreaInsets();
//   const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

//   const listRef = useRef<FlatList<Slide>>(null);
//   const [index, setIndex] = useState(0);
//   const isLast = index === slides.length - 1;

//   const finish = () => {
//     completeOnboarding();
//     router.replace("/(auth)/login");
//   };

//   const handlePrimary = () => {
//     if (isLast) {
//       finish();
//       return;
//     }
//     const next = index + 1;
//     listRef.current?.scrollToIndex({ index: next, animated: true });
//     setIndex(next);
//   };

//   const onViewableItemsChanged = useRef(
//     ({ viewableItems }: { viewableItems: ViewToken[] }) => {
//       const first = viewableItems[0];
//       if (first?.index != null) setIndex(first.index);
//     },
//   ).current;

//   return (
//     <View style={[styles.root, { backgroundColor: colors.background }]}>
//       <StatusBar style="dark" />

//       <FlatList
//         ref={listRef}
//         style={styles.list}
//         data={slides}
//         horizontal
//         pagingEnabled
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item) => item.id}
//         onViewableItemsChanged={onViewableItemsChanged}
//         viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
//         getItemLayout={(_, i) => ({
//           length: SCREEN_W,
//           offset: SCREEN_W * i,
//           index: i,
//         })}
//         renderItem={({ item }) => (
//           <View style={styles.slide}>
//             <Image
//               source={item.image}
//               style={styles.image}
//               contentFit="cover"
//               transition={200}
//             />
//             <View style={styles.textBlock}>
//               <Text style={[styles.title, { color: colors.text }]}>
//                 {item.title}
//               </Text>
//               <Text
//                 style={[styles.description, { color: colors.textSecondary }]}
//               >
//                 {item.description}
//               </Text>
//             </View>
//           </View>
//         )}
//       />

//       <Pressable
//         accessibilityRole="button"
//         hitSlop={12}
//         onPress={finish}
//         style={[styles.skip, { top: insets.top + spacing.xs }]}
//       >
//         <Text style={[styles.skipText, { color: colors.primary }]}>Skip</Text>
//       </Pressable>

//       <View
//         style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}
//       >
//         <View style={styles.dotsRow}>
//           {slides.map((slide, dotIndex) => (
//             <View
//               key={slide.id}
//               style={[
//                 styles.dot,
//                 { backgroundColor: colors.border },
//                 dotIndex === index && [
//                   styles.dotActive,
//                   { backgroundColor: colors.primary },
//                 ],
//               ]}
//             />
//           ))}
//         </View>

//         <PrimaryButton
//           title={isLast ? "Login" : "Next"}
//           onPress={handlePrimary}
//         />
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   root: {
//     flex: 1,
//   },
//   list: {
//     flex: 1,
//   },
//   slide: {
//     width: SCREEN_W,
//   },
//   image: {
//     width: SCREEN_W,
//     height: IMAGE_HEIGHT,
//   },
//   textBlock: {
//     paddingHorizontal: spacing.xl,
//     marginTop: spacing.xl,
//     rowGap: spacing.sm,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "800",
//   },
//   description: {
//     fontSize: 15,
//     lineHeight: 22,
//   },
//   skip: {
//     position: "absolute",
//     right: spacing.lg,
//   },
//   skipText: {
//     fontSize: 15,
//     fontWeight: "700",
//   },
//   footer: {
//     paddingHorizontal: spacing.xl,
//     rowGap: spacing.lg,
//   },
//   dotsRow: {
//     flexDirection: "row",
//     alignSelf: "center",
//     columnGap: spacing.xs,
//   },
//   dot: {
//     width: 8,
//     height: 8,
//     borderRadius: radius.pill,
//   },
//   dotActive: {
//     width: 26,
//   },
// });
