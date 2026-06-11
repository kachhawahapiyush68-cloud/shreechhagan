import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { radius, useTheme } from "@/theme";

type IoniconName = keyof typeof Ionicons.glyphMap;

function TabIcon({
  focused,
  active,
  inactive,
  activeColor,
  inactiveColor,
}: {
  focused: boolean;
  active: IoniconName;
  inactive: IoniconName;
  activeColor: string;
  inactiveColor: string;
}) {
  return (
    <View
      style={[
        styles.iconWrap,
        focused && { backgroundColor: activeColor + "26" },
      ]}
    >
      <Ionicons
        name={focused ? active : inactive}
        size={22}
        color={focused ? activeColor : inactiveColor}
      />
    </View>
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopWidth: 0,
          height: 64 + insets.bottom,
          paddingTop: 10,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              active="home"
              inactive="home-outline"
              activeColor={colors.primary}
              inactiveColor={colors.textMuted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              active="grid"
              inactive="grid-outline"
              activeColor={colors.primary}
              inactiveColor={colors.textMuted}
            />
          ),
        }}
      />
      {/* Cart is accessible from the home header, not shown in tab bar */}
      <Tabs.Screen name="cart" options={{ href: null }} />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              active="bag-handle"
              inactive="bag-handle-outline"
              activeColor={colors.primary}
              inactiveColor={colors.textMuted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              active="person"
              inactive="person-outline"
              activeColor={colors.primary}
              inactiveColor={colors.textMuted}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
});
