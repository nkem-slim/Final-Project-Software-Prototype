import { Wifi, WifiOff } from "lucide-react-native";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = { isOnline: boolean; queueLength?: number };

export const StatusBanner: React.FC<Props> = ({
  isOnline,
  queueLength = 0,
}) => (
  <View style={[styles.banner, isOnline ? styles.online : styles.offline]}>
    <Text style={styles.icon}>
      {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
    </Text>
    <Text style={styles.text}>
      {isOnline ? "Online mode" : "Offline mode"}
      {!isOnline && queueLength > 0
        ? ` - ${queueLength} request(s) will sync when you are back online`
        : ""}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 20,
    borderRadius: 999,
    // flex: 1,
    // width: "40%",
    // height: 32,
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  online: { backgroundColor: "#5ced73" },
  offline: {
    backgroundColor: "#FF7F7F",
    borderWidth: 1,
    borderColor: "#FF7F7F",
  },
  text: { color: "#fff", fontSize: 14, fontWeight: "500", textAlign: "center" },
  icon: { color: "#fff", fontSize: 14, fontWeight: "500", textAlign: "center" },
  iconOnline: { color: "#5ced73" },
  iconOffline: { color: "#FF7F7F" },
});
