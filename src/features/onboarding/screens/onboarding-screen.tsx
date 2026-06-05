import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/ui/primary-button";
import { Screen } from "@/components/ui/screen";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { colors, radius, spacing } from "@/theme";

const slides = [
  {
    id: "1",
    title: "Food delivery that feels instant",
    description:
      "Discover restaurants, repeat favorites, and track every order in real time.",
  },
  {
    id: "2",
    title: "Groceries and essentials in one app",
    description:
      "From fruits to daily needs, manage fast basket building with clean category flows.",
  },
  {
    id: "3",
    title: "Offers, rewards, and wallet savings",
    description:
      "Apply coupons, use wallet balance, and unlock better repeat ordering experiences.",
  },
];

export function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

  const isLast = index === slides.length - 1;
  const slide = slides[index];

  const handleNext = () => {
    if (!isLast) {
      setIndex((prev) => prev + 1);
      return;
    }

    completeOnboarding();
    router.replace("/(auth)/login");
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace("/(auth)/login");
  };

  return (
    <Screen withHorizontalPadding backgroundColor={colors.light.background}>
      <View style={styles.topRow}>
        <Text style={styles.brand}>ShreeChhagan</Text>
        {!isLast ? (
          <Text
            accessibilityRole="button"
            onPress={handleSkip}
            style={styles.skip}
          >
            Skip
          </Text>
        ) : (
          <View style={styles.skipPlaceholder} />
        )}
      </View>

      <View style={styles.illustrationCard}>
        <Text style={styles.illustrationEmoji}>🛵</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>

      <View style={styles.dotsRow}>
        {slides.map((item, dotIndex) => (
          <View
            key={item.id}
            style={[styles.dot, dotIndex === index && styles.dotActive]}
          />
        ))}
      </View>

      <PrimaryButton
        title={isLast ? "Get Started" : "Next"}
        onPress={handleNext}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing["2xl"],
  },
  brand: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.light.primary,
  },
  skip: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.light.textSecondary,
  },
  skipPlaceholder: {
    width: 40,
  },
  illustrationCard: {
    flex: 1,
    minHeight: 320,
    borderRadius: radius.xl,
    backgroundColor: colors.light.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  illustrationEmoji: {
    fontSize: 72,
  },
  content: {
    rowGap: spacing.sm,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.light.text,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.light.textSecondary,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: spacing.xs,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.light.border,
  },
  dotActive: {
    width: 28,
    backgroundColor: colors.light.primary,
  },
});
