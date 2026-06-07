// // src/app/splash.tsx
// import { getSplashBanners } from "@/features/auth/api/auth.api";
// import type { SplashBannerDto } from "@/types/api";
// import { Image } from "expo-image";
// import { router } from "expo-router";
// import { useEffect, useRef, useState } from "react";
// import {
//   Animated,
//   Dimensions,
//   FlatList,
//   StyleSheet,
//   Text,
//   View,
//   ViewToken,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
// const SLIDE_DURATION = 3000; // ms each banner shows
// const NAV_DELAY = 500; // short pause after last banner

// export default function SplashRoute() {
//   const insets = useSafeAreaInsets();
//   const [banners, setBanners] = useState<SplashBannerDto[]>([]);
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [ready, setReady] = useState(false);
//   const flatListRef = useRef<FlatList<SplashBannerDto>>(null);
//   const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   // Logo / brand fade-in
//   const brandOpacity = useRef(new Animated.Value(0)).current;
//   const brandTranslate = useRef(new Animated.Value(24)).current;

//   useEffect(() => {
//     // Animate brand in
//     Animated.parallel([
//       Animated.timing(brandOpacity, {
//         toValue: 1,
//         duration: 700,
//         useNativeDriver: true,
//       }),
//       Animated.spring(brandTranslate, {
//         toValue: 0,
//         useNativeDriver: true,
//         damping: 18,
//         stiffness: 140,
//       }),
//     ]).start();

//     // Fetch banners
//     getSplashBanners().then((data) => {
//       setBanners(data);
//       setReady(true);
//     });
//   }, []);

//   // Auto-slide & navigate
//   useEffect(() => {
//     if (!ready) return;
//     if (banners.length === 0) {
//       // No banners: show branding for 2.5s then navigate
//       timerRef.current = setTimeout(() => {
//         router.replace("/(auth)/login");
//       }, 2500);
//       return;
//     }

//     const totalSlides = banners.length;

//     const advance = (index: number) => {
//       if (index < totalSlides - 1) {
//         const nextIndex = index + 1;
//         flatListRef.current?.scrollToIndex({
//           index: nextIndex,
//           animated: true,
//         });
//         setActiveIndex(nextIndex);
//         timerRef.current = setTimeout(() => advance(nextIndex), SLIDE_DURATION);
//       } else {
//         // Last slide done → navigate
//         timerRef.current = setTimeout(() => {
//           router.replace("/(auth)/login");
//         }, NAV_DELAY);
//       }
//     };

//     timerRef.current = setTimeout(() => advance(0), SLIDE_DURATION);

//     return () => {
//       if (timerRef.current) clearTimeout(timerRef.current);
//     };
//   }, [ready, banners.length]);

//   const onViewableItemsChanged = useRef(
//     ({ viewableItems }: { viewableItems: ViewToken[] }) => {
//       if (viewableItems.length > 0 && viewableItems[0].index !== null) {
//         setActiveIndex(viewableItems[0].index);
//       }
//     },
//   ).current;

//   return (
//     <View style={styles.container}>
//       {/* Banner slides */}
//       {banners.length > 0 ? (
//         <FlatList
//           ref={flatListRef}
//           data={banners}
//           horizontal
//           pagingEnabled
//           scrollEnabled={false}
//           showsHorizontalScrollIndicator={false}
//           keyExtractor={(item) => String(item.BannerId)}
//           onViewableItemsChanged={onViewableItemsChanged}
//           viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
//           renderItem={({ item }) => (
//             <Image
//               source={{ uri: item.BannerImageUrl }}
//               style={styles.bannerImage}
//               contentFit="cover"
//             />
//           )}
//         />
//       ) : (
//         // Fallback gradient background when no banners
//         <View style={styles.fallbackBg} />
//       )}

//       {/* Dark gradient overlay */}
//       <View style={styles.overlay} />

//       {/* Brand text */}
//       <Animated.View
//         style={[
//           styles.brandContainer,
//           {
//             paddingTop: insets.top + 32,
//             opacity: brandOpacity,
//             transform: [{ translateY: brandTranslate }],
//           },
//         ]}
//       >
//         <View style={styles.logoCircle}>
//           <Text style={styles.logoEmoji}>🛵</Text>
//         </View>
//         <Text style={styles.brandName}>ShreeChhagan</Text>
//         <Text style={styles.brandTagline}>
//           Delivering happiness to your door
//         </Text>
//       </Animated.View>

//       {/* Dots indicator */}
//       {banners.length > 1 && (
//         <View
//           style={[styles.dotsContainer, { paddingBottom: insets.bottom + 40 }]}
//         >
//           {banners.map((_, i) => (
//             <Animated.View
//               key={i}
//               style={[
//                 styles.dot,
//                 i === activeIndex ? styles.dotActive : styles.dotInactive,
//               ]}
//             />
//           ))}
//         </View>
//       )}

//       {/* Loading indicator */}
//       {banners.length === 0 && ready && (
//         <View
//           style={[styles.dotsContainer, { paddingBottom: insets.bottom + 40 }]}
//         >
//           <Text style={styles.loadingText}>Loading…</Text>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#0F0F0F",
//   },
//   bannerImage: {
//     width: SCREEN_W,
//     height: SCREEN_H,
//   },
//   fallbackBg: {
//     position: "absolute",
//     width: SCREEN_W,
//     height: SCREEN_H,
//     backgroundColor: "#1A0A00",
//   },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(0,0,0,0.45)",
//   },
//   brandContainer: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     alignItems: "center",
//     paddingHorizontal: 24,
//   },
//   logoCircle: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: "rgba(252,128,25,0.18)",
//     borderWidth: 2,
//     borderColor: "#FC8019",
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 16,
//   },
//   logoEmoji: {
//     fontSize: 40,
//   },
//   brandName: {
//     fontSize: 34,
//     fontWeight: "800",
//     color: "#FFFFFF",
//     letterSpacing: 0.5,
//     textShadowColor: "rgba(0,0,0,0.6)",
//     textShadowOffset: { width: 0, height: 2 },
//     textShadowRadius: 8,
//   },
//   brandTagline: {
//     marginTop: 8,
//     fontSize: 15,
//     color: "rgba(255,255,255,0.75)",
//     textShadowColor: "rgba(0,0,0,0.4)",
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 4,
//   },
//   dotsContainer: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 8,
//   },
//   dot: {
//     height: 8,
//     borderRadius: 4,
//   },
//   dotActive: {
//     width: 28,
//     backgroundColor: "#FC8019",
//   },
//   dotInactive: {
//     width: 8,
//     backgroundColor: "rgba(255,255,255,0.5)",
//   },
//   loadingText: {
//     color: "rgba(255,255,255,0.6)",
//     fontSize: 14,
//   },
// });
// src/app/splash.tsx
import { getSplashBanners } from "@/features/auth/api/auth.api";
import type { SplashBannerDto } from "@/types/api";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  View,
  ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const SLIDE_DURATION = 3000; // ms each banner shows
const BRAND_BG = "#FBF4EA"; // soft cream while loading (matches the art)
const GOLD = "#C8941E";

export default function SplashRoute() {
  const insets = useSafeAreaInsets();
  const [banners, setBanners] = useState<SplashBannerDto[]>([]);
  const [ready, setReady] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const flatListRef = useRef<FlatList<SplashBannerDto>>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch banners once
  useEffect(() => {
    getSplashBanners()
      .then((data) => setBanners(Array.isArray(data) ? data : []))
      .catch(() => setBanners([]))
      .finally(() => setReady(true));
  }, []);

  // No banners (or fetch failed) → straight to login
  useEffect(() => {
    if (ready && banners.length === 0) {
      const t = setTimeout(() => router.replace("/(auth)/login"), 800);
      return () => clearTimeout(t);
    }
  }, [ready, banners.length]);

  // Auto-advance; reschedules when the active slide changes (also covers swipe)
  useEffect(() => {
    if (!ready || banners.length === 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      if (activeIndex >= banners.length - 1) {
        router.replace("/(auth)/login");
      } else {
        const next = activeIndex + 1;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        setActiveIndex(next);
      }
    }, SLIDE_DURATION);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [ready, activeIndex, banners.length]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  ).current;

  // Loading / no-banner state: clean branded background with a small spinner
  if (!ready || banners.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={GOLD} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        style={StyleSheet.absoluteFill}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.BannerId)}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        getItemLayout={(_, index) => ({
          length: SCREEN_W,
          offset: SCREEN_W * index,
          index,
        })}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item.BannerImageUrl }}
            style={styles.bannerImage}
            contentFit="cover"
            transition={250}
          />
        )}
      />

      {banners.length > 1 && (
        <View
          style={[styles.dotsContainer, { paddingBottom: insets.bottom + 28 }]}
        >
          {banners.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND_BG },
  center: { alignItems: "center", justifyContent: "center" },
  bannerImage: { width: SCREEN_W, height: SCREEN_H },
  dotsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { width: 26, backgroundColor: GOLD },
  dotInactive: { width: 8, backgroundColor: "rgba(200,148,30,0.4)" },
});
