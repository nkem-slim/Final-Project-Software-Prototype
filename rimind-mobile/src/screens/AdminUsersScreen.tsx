import React, { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  View,
} from "react-native";
import { Phone, Trash2 } from "lucide-react-native";
import api from "../services/api";
import { StatusBanner } from "../components/StatusBanner";
import { Card } from "../components/Card";
import { useConnectivity } from "../hooks/useConnectivity";

type AdminUser = {
  id: string;
  name: string;
  phoneNumber: string;
  role: "MOTHER" | "HEALTH_WORKER" | "ADMIN";
  createdAt: string;
};

export const AdminUsersScreen: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const isOnline = useConnectivity();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: AdminUser[] }>("/admin/users");
      const list = res.data?.data ?? (res.data as unknown as AdminUser[]) ?? [];
      setUsers(Array.isArray(list) ? list : []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCall = async (phoneNumber: string) => {
    const cleaned = phoneNumber.trim();
    const url = `tel:${cleaned}`;
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert("Cannot call", "Calling is not supported on this device.");
      return;
    }
    await Linking.openURL(url);
  };

  const handleDelete = (user: AdminUser) => {
    Alert.alert(
      "Delete user",
      `Are you sure you want to delete ${user.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setActioningId(user.id);
            try {
              await api.delete(`/admin/users/${user.id}`);
              setUsers((prev) => prev.filter((u) => u.id !== user.id));
            } catch (e: any) {
              const message =
                e?.response?.data?.error ?? "Could not delete user.";
              Alert.alert("Error", message);
            } finally {
              setActioningId(null);
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <StatusBanner isOnline={isOnline} />
      <Text style={s.title}>Users</Text>
      {loading && <ActivityIndicator size="large" color="#50a5e8" />}
      {!loading && users.length === 0 && (
        <Text style={s.empty}>No users found.</Text>
      )}
      {users.map((user) => (
        <Card key={user.id}>
          <Text style={s.name}>{user.name}</Text>
          <Text style={s.meta}>{user.phoneNumber}</Text>
          <Text style={s.meta}>{user.role}</Text>
          <View style={s.actionsRow}>
            <TouchableOpacity
              style={s.actionBtn}
              onPress={() => handleCall(user.phoneNumber)}
              accessibilityRole="button"
              accessibilityLabel={`Call ${user.name}`}
            >
              <Phone size={16} color="#50a5e8" />
              <Text style={s.callText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.actionBtn}
              onPress={() => handleDelete(user)}
              disabled={actioningId === user.id}
              accessibilityRole="button"
              accessibilityLabel={`Delete ${user.name}`}
            >
              <Trash2 size={16} color="#b3261e" />
              <Text style={s.deleteText}>
                {actioningId === user.id ? "Deleting..." : "Delete"}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f0" },
  content: { padding: 24, paddingBottom: 32 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#50a5e8",
    marginBottom: 16,
  },
  empty: { color: "#666" },
  name: { fontSize: 16, fontWeight: "700", color: "#2d4150", marginBottom: 4 },
  meta: { fontSize: 13, color: "#666", marginBottom: 2 },
  actionsRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  actionBtn: { flexDirection: "row", alignItems: "center" },
  callText: { marginLeft: 6, color: "#50a5e8", fontWeight: "600" },
  deleteText: { marginLeft: 6, color: "#b3261e", fontWeight: "600" },
});

