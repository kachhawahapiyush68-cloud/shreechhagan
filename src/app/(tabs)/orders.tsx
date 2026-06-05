import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme";

export default function OrdersRoute() {
  return (
    <View style={styles.root}>
      <Text style={styles.text}>Orders screen (dummy)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.light.background,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: colors.light.text,
  },
});
