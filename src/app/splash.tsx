// import { getSplashBanners } from "@/features/auth/api/auth.api";
// import { useTheme } from "@/theme";
// import type { SplashBannerDto } from "@/types/api";
// import { Image } from "expo-image";
// import { router } from "expo-router";
// import { useEffect, useRef, useState } from "react";
// import {
//   ActivityIndicator,
//   Dimensions,
//   FlatList,
//   StyleSheet,
//   View,
//   type ViewToken,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
// const SLIDE_DURATION = 3000;

// export default function SplashRoute() {
//   const insets = useSafeAreaInsets();
//   const { colors } = useTheme();

//   const [banners, setBanners] = useState<SplashBannerDto[]>([]);
//   const [ready, setReady] = useState(false);
//   const [activeIndex, setActiveIndex] = useState(0);

//   const flatListRef = useRef<FlatList<SplashBannerDto>>(null);
//   const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   useEffect(() => {
//     let mounted = true;

//     getSplashBanners()
//       .then((data) => {
//         if (!mounted) return;
//         setBanners(Array.isArray(data) ? data : []);
//       })
//       .catch(() => {
//         if (!mounted) return;
//         setBanners([]);
//       })
//       .finally(() => {
//         if (!mounted) return;
//         setReady(true);
//       });

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   useEffect(() => {
//     if (!ready || banners.length > 0) return;

//     const fallbackTimer = setTimeout(() => {
//       router.replace("/(auth)/login");
//     }, 800);

//     return () => clearTimeout(fallbackTimer);
//   }, [ready, banners.length]);

//   useEffect(() => {
//     if (!ready || banners.length === 0) return;

//     if (timerRef.current) {
//       clearTimeout(timerRef.current);
//     }

//     timerRef.current = setTimeout(() => {
//       if (activeIndex >= banners.length - 1) {
//         router.replace("/(auth)/login");
//         return;
//       }

//       const nextIndex = activeIndex + 1;
//       flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
//       setActiveIndex(nextIndex);
//     }, SLIDE_DURATION);

//     return () => {
//       if (timerRef.current) {
//         clearTimeout(timerRef.current);
//       }
//     };
//   }, [ready, activeIndex, banners.length]);

//   const onViewableItemsChanged = useRef(
//     ({ viewableItems }: { viewableItems: ViewToken[] }) => {
//       const currentItem = viewableItems[0];
//       if (currentItem?.index != null) {
//         setActiveIndex(currentItem.index);
//       }
//     },
//   ).current;

//   if (!ready || banners.length === 0) {
//     return (
//       <View
//         style={[
//           styles.container,
//           styles.center,
//           { backgroundColor: colors.background },
//         ]}
//       >
//         <ActivityIndicator color={colors.primary} />
//       </View>
//     );
//   }

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <FlatList
//         ref={flatListRef}
//         style={StyleSheet.absoluteFill}
//         data={banners}
//         horizontal
//         pagingEnabled
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item) => String(item.BannerId)}
//         onViewableItemsChanged={onViewableItemsChanged}
//         viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
//         getItemLayout={(_, index) => ({
//           length: SCREEN_W,
//           offset: SCREEN_W * index,
//           index,
//         })}
//         renderItem={({ item }) => (
//           <Image
//             source={{ uri: item.BannerImageUrl }}
//             style={styles.bannerImage}
//             contentFit="cover"
//             transition={250}
//           />
//         )}
//       />

//       {banners.length > 1 ? (
//         <View
//           style={[styles.dotsContainer, { paddingBottom: insets.bottom + 28 }]}
//         >
//           {banners.map((_, index) => (
//             <View
//               key={index}
//               style={[
//                 styles.dot,
//                 {
//                   backgroundColor:
//                     index === activeIndex ? colors.primary : colors.overlay,
//                 },
//                 index === activeIndex ? styles.dotActive : styles.dotInactive,
//               ]}
//             />
//           ))}
//         </View>
//       ) : null}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   center: {
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   bannerImage: {
//     width: SCREEN_W,
//     height: SCREEN_H,
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
//     width: 26,
//   },
//   dotInactive: {
//     width: 8,
//   },
// });
import { getSplashBanners } from "@/features/auth/api/auth.api";
import { useTheme } from "@/theme";
import type { SplashBannerDto } from "@/types/api";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const SLIDE_DURATION = 3000;

export default function SplashRoute() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [banners, setBanners] = useState<SplashBannerDto[]>([]);
  const [ready, setReady] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const flatListRef = useRef<FlatList<SplashBannerDto>>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadBanners() {
      try {
        const data = await getSplashBanners();
        if (!mounted) return;
        setBanners(Array.isArray(data) ? data : []);
      } catch {
        if (!mounted) return;
        setBanners([]);
      } finally {
        if (!mounted) return;
        setReady(true);
      }
    }

    void loadBanners();

    return () => {
      mounted = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const goToLogin = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    router.replace("/(auth)/login");
  };

  const goToNext = () => {
    if (banners.length === 0) return;

    const isLast = activeIndex === banners.length - 1;

    if (isLast) {
      goToLogin();
      return;
    }

    const nextIndex = activeIndex + 1;
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setActiveIndex(nextIndex);
  };

  useEffect(() => {
    if (!ready) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (banners.length === 0) {
      timerRef.current = setTimeout(() => {
        router.replace("/(auth)/login");
      }, 800);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }

    timerRef.current = setTimeout(() => {
      const isLast = activeIndex >= banners.length - 1;

      if (isLast) {
        router.replace("/(auth)/login");
        return;
      }

      const nextIndex = activeIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
    }, SLIDE_DURATION);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [ready, banners.length, activeIndex]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const currentItem = viewableItems[0];
      if (currentItem?.index != null) {
        setActiveIndex(currentItem.index);
      }
    },
  ).current;

  if (!ready) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (banners.length === 0) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const isLastSlide = activeIndex === banners.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={flatListRef}
        style={StyleSheet.absoluteFill}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) =>
          String(item.BannerId ?? item.BannerImageUrl ?? index)
        }
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

      <Pressable
        accessibilityRole="button"
        hitSlop={12}
        onPress={goToLogin}
        style={[
          styles.skipButton,
          {
            top: insets.top + 10,
            backgroundColor: "rgba(0,0,0,0.25)",
          },
        ]}
      >
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      {banners.length > 1 ? (
        <View style={[styles.dotsContainer, { bottom: insets.bottom + 82 }]}>
          {banners.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === activeIndex
                      ? colors.primary
                      : "rgba(255,255,255,0.5)",
                },
                index === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      ) : null}

      <View
        style={[styles.bottomActionWrap, { paddingBottom: insets.bottom + 24 }]}
      >
        <Pressable
          accessibilityRole="button"
          onPress={goToNext}
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.actionButtonText}>
            {isLastSlide ? "Login" : "Next"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  bannerImage: {
    width: SCREEN_W,
    height: SCREEN_H,
  },
  skipButton: {
    position: "absolute",
    right: 16,
    zIndex: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  dotsContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 26,
  },
  dotInactive: {
    width: 8,
  },
  bottomActionWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 0,
  },
  actionButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
