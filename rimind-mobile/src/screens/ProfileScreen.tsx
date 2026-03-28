import React, { useState } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Pencil } from "lucide-react-native";
import { useAuthStore } from "../store/authStore";
import { StatusBanner } from "../components/StatusBanner";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { SignOutConfirmModal } from "../components/SignOutConfirmModal";
import { useConnectivity } from "../hooks/useConnectivity";

export function ProfileScreen(props: { navigation: any }) {
  const { navigation } = props;
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isOnline = useConnectivity();
  const [signOutModalVisible, setSignOutModalVisible] = useState(false);

  const handleSignOutPress = () => {
    setSignOutModalVisible(true);
  };

  const handleDismissSignOut = () => {
    setSignOutModalVisible(false);
  };

  const handleConfirmSignOut = () => {
    setSignOutModalVisible(false);
    void logout();
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* <StatusBanner isOnline={isOnline} /> */}
      <Text style={s.title}>Profile</Text>
      <TouchableOpacity onPress={() => navigation.navigate("EditProfile")}>
        <Card>
          <TouchableOpacity
            style={s.nameRow}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Text style={s.name}>{user?.name}</Text>
            <Pencil size={18} color="#50a5e8" />
          </TouchableOpacity>
          <Text>{user?.phoneNumber}</Text>
          <Text style={s.role}>{user?.role}</Text>
        </Card>
      </TouchableOpacity>
      {user?.role === "HEALTH_WORKER" && (
        <Button
          title="CHW Dashboard"
          onPress={() => navigation.navigate("CHW")}
          variant="secondary"
        />
      )}
      {user?.role === "ADMIN" && (
        <Button
          title="Admin reports"
          onPress={() => navigation.navigate("Admin")}
          variant="secondary"
        />
      )}
      <Button
        title="Sign out"
        onPress={handleSignOutPress}
        variant="secondary"
        style={s.logoutBtn}
      />
      <TouchableOpacity
        onPress={() => Alert.alert("Help", "Contact your clinic.")}
      >
        <Text style={s.help}>Help</Text>
      </TouchableOpacity>
      <SignOutConfirmModal
        visible={signOutModalVisible}
        onDismiss={handleDismissSignOut}
        onConfirmSignOut={handleConfirmSignOut}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f0" },
  content: { padding: 24 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#50a5e8",
    marginBottom: 12,
    marginTop: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: { fontWeight: "600", fontSize: 18 },
  role: { marginTop: 4, color: "#666" },
  logoutBtn: { marginTop: 24 },
  help: { marginTop: 16, color: "#666", alignSelf: "center" },
});
