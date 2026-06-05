import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme";

export default function CartRoute() {
  return (
    <View style={styles.root}>
      <Text style={styles.text}>Cart screen (dummy)</Text>
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
