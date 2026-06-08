import { useColorScheme } from "react-native";

import { colors, type AppColors } from "./colors";

export * from "./colors";
export * from "./radius";
export * from "./shadows";
export * from "./spacing";
export * from "./typography";

export function getThemeColors(scheme?: "light" | "dark" | null): AppColors {
  return scheme === "dark" ? colors.dark : colors.light;
}

export function useTheme() {
  const colorScheme = useColorScheme();
  const theme = getThemeColors(colorScheme);

  return {
    colors: theme,
    colorScheme: colorScheme ?? "light",
    isDark: colorScheme === "dark",
  };
}
