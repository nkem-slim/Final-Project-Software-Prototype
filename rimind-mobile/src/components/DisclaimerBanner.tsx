import React from "react";
import { Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DISCLAIMER =
  "This guidance is not a medical diagnosis. Please consult a qualified health professional.";

export const DisclaimerBanner: React.FC = () => {
  return (
    <SafeAreaView edges={["top"]} style={styles.banner}>
      <Text style={styles.text}>{DISCLAIMER}</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#b8860b",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  text: {
    color: "#000",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});
