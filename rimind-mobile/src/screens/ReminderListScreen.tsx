import React, { useEffect, useMemo, useState } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  View,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Trash2, X } from "lucide-react-native";
import { useRemindersStore, type Reminder } from "../store/remindersStore";
import { useAuthStore } from "../store/authStore";
import { StatusBanner } from "../components/StatusBanner";
import { Card } from "../components/Card";
import { useConnectivity } from "../hooks/useConnectivity";
import { formatDateTime } from "../utils/dateUtils";
import api from "../services/api";

type AdminUser = {
  id: string;
  name: string;
  role: "MOTHER" | "HEALTH_WORKER" | "ADMIN";
};

type RecipientFilter = "ALL" | "CHW" | "MOTHER";

export function ReminderListScreen() {
  const {
    reminders,
    loading,
    fetchMyReminders,
    sendReminder,
    markAsDone,
    deleteReminder,
  } = useRemindersStore();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN";
  const isOnline = useConnectivity();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [actioningReminderId, setActioningReminderId] = useState<string | null>(null);
  const [recipientFilter, setRecipientFilter] = useState<RecipientFilter>("ALL");
  const [refreshing, setRefreshing] = useState(false);

  const targetUsers = useMemo(
    () => users.filter((u) => u.role === "HEALTH_WORKER" || u.role === "MOTHER"),
    [users],
  );

  const filteredTargetUsers = useMemo(() => {
    if (recipientFilter === "ALL") return targetUsers;
    if (recipientFilter === "CHW") return targetUsers.filter((u) => u.role === "HEALTH_WORKER");
    return targetUsers.filter((u) => u.role === "MOTHER");
  }, [targetUsers, recipientFilter]);

  useEffect(() => {
    if (!isAdmin || !showComposeModal) return;
    if (filteredTargetUsers.length === 0) {
      setSelectedUserId("");
      return;
    }
    const stillValid = filteredTargetUsers.some((u) => u.id === selectedUserId);
    if (!stillValid) {
      setSelectedUserId(filteredTargetUsers[0]!.id);
    }
  }, [isAdmin, showComposeModal, filteredTargetUsers, selectedUserId]);

  useEffect(() => {
    fetchMyReminders();
  }, [fetchMyReminders, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchUsers = async () => {
      try {
        const res = await api.get<{ data: AdminUser[] }>("/admin/users");
        const list = res.data?.data ?? [];
        const nextUsers = Array.isArray(list) ? list : [];
        setUsers(nextUsers);
        const firstTarget = nextUsers.find(
          (u) => u.role === "HEALTH_WORKER" || u.role === "MOTHER",
        );
        setSelectedUserId(firstTarget?.id ?? "");
      } catch {
        setUsers([]);
      }
    };
    fetchUsers();
  }, [isAdmin]);

  const handleSendNotification = async () => {
    if (!selectedUserId || !message.trim()) {
      Alert.alert("Error", "Select a user and enter a notification.");
      return;
    }
    setSending(true);
    try {
      await sendReminder({ userId: selectedUserId, message: message.trim() });
      setMessage("");
      setShowComposeModal(false);
      Alert.alert("Success", "Notification sent.");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error ?? "Could not send notification.");
    } finally {
      setSending(false);
    }
  };

  const handleMarkAsDone = async () => {
    if (!selectedReminder) return;
    setActioningReminderId(selectedReminder.id);
    try {
      await markAsDone(selectedReminder.id);
      setSelectedReminder({ ...selectedReminder, status: "SENT" });
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error ?? "Could not mark as done.");
    } finally {
      setActioningReminderId(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedReminder) return;
    setActioningReminderId(selectedReminder.id);
    try {
      await deleteReminder(selectedReminder.id);
      setSelectedReminder(null);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error ?? "Could not delete notification.");
    } finally {
      setActioningReminderId(null);
    }
  };

  const handleRecipientFilterPress = (next: RecipientFilter) => {
    setRecipientFilter(next);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMyReminders();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#50a5e8"]} />
      }
    >
      <StatusBanner isOnline={isOnline} />
      <Text style={s.title}>{isAdmin ? "Send notifications" : "Notifications"}</Text>
      {isAdmin && (
        <View style={s.adminActions}>
          <TouchableOpacity style={s.primaryBtn} onPress={() => setShowComposeModal(true)}>
            <Text style={s.primaryBtnText}>Send notification</Text>
          </TouchableOpacity>
          <Text style={s.helper}>You can send notifications directly to CHW and Mother users.</Text>
        </View>
      )}
      {loading && <ActivityIndicator size="large" color="#50a5e8" />}
      {reminders.length === 0 && !loading && (
        <Text style={s.empty}>No notifications available.</Text>
      )}
      {reminders.map((r) => (
        <TouchableOpacity key={r.id} onPress={() => setSelectedReminder(r)}>
          <Card>
            <Text style={s.date}>{formatDateTime(r.scheduledDate)}</Text>
            <Text numberOfLines={2}>{r.message}</Text>
            <Text style={s.status}>
              {r.status === "SENT" ? "Done" : r.status === "PENDING" ? "Pending" : r.status}
            </Text>
          </Card>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        onPress={() =>
          Alert.alert(
            "Help",
            isAdmin
              ? "Tap Send notification to compose a new admin notification for CHW or Mother."
              : "Tap a notification to read details, mark as done, or delete.",
          )
        }
      >
        <Text style={s.help}>Help</Text>
      </TouchableOpacity>

      <Modal visible={showComposeModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Send notification</Text>
            <Text style={s.filterLabel}>Recipient</Text>
            <View style={s.filterRow}>
              {(
                [
                  { key: "ALL" as const, label: "All" },
                  { key: "CHW" as const, label: "CHW" },
                  { key: "MOTHER" as const, label: "Mother" },
                ] as const
              ).map(({ key, label }) => {
                const isActive = recipientFilter === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[s.filterChip, isActive && s.filterChipActive]}
                    onPress={() => handleRecipientFilterPress(key)}
                    accessibilityRole="button"
                    accessibilityLabel={`Filter recipients: ${label}`}
                    accessibilityState={{ selected: isActive }}
                  >
                    <Text style={[s.filterChipText, isActive && s.filterChipTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {filteredTargetUsers.length === 0 && (
              <Text style={s.empty}>
                {targetUsers.length === 0
                  ? "No CHW or Mother account found yet."
                  : "No users match this filter."}
              </Text>
            )}
            {filteredTargetUsers.map((u) => (
              <TouchableOpacity
                key={u.id}
                style={[s.userOption, selectedUserId === u.id && s.userOptionSelected]}
                onPress={() => setSelectedUserId(u.id)}
                accessibilityRole="button"
                accessibilityLabel={`Select ${u.name}, ${u.role === "HEALTH_WORKER" ? "CHW" : u.role === "MOTHER" ? "Mother" : u.role}`}
                accessibilityState={{ selected: selectedUserId === u.id }}
              >
                <Text style={selectedUserId === u.id ? s.userOptionSelectedText : undefined}>
                  {u.name} (
                  {u.role === "HEALTH_WORKER" ? "CHW" : u.role === "MOTHER" ? "MOTHER" : u.role})
                </Text>
              </TouchableOpacity>
            ))}
            <TextInput
              style={s.textArea}
              placeholder="Notification details"
              multiline
              value={message}
              onChangeText={setMessage}
            />
            <View style={s.modalActions}>
              <TouchableOpacity style={s.ghostBtn} onPress={() => setShowComposeModal(false)}>
                <Text style={s.ghostBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.primaryBtn, sending && s.primaryBtnDisabled]}
                onPress={handleSendNotification}
                disabled={sending}
              >
                <Text style={s.primaryBtnText}>{sending ? "Sending..." : "Send"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={Boolean(selectedReminder)} transparent animationType="slide">
        <View style={s.sheetOverlay}>
          <View style={s.sheet}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Notification details</Text>
              <TouchableOpacity onPress={() => setSelectedReminder(null)}>
                <X size={20} color="#2d4150" />
              </TouchableOpacity>
            </View>
            <Text style={s.date}>
              {selectedReminder ? formatDateTime(selectedReminder.scheduledDate) : ""}
            </Text>
            <Text style={s.sheetMessage}>{selectedReminder?.message}</Text>
            <Text style={s.status}>
              Status:{" "}
              {selectedReminder?.status === "SENT"
                ? "Done"
                : selectedReminder?.status === "PENDING"
                  ? "Pending"
                  : selectedReminder?.status}
            </Text>
            <View style={s.modalActions}>
              <TouchableOpacity
                style={s.doneBtn}
                onPress={handleMarkAsDone}
                disabled={!selectedReminder || actioningReminderId === selectedReminder.id}
              >
                <Text style={s.doneBtnText}>
                  {selectedReminder?.status === "SENT" ? "Already done" : "Mark as done"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.iconDeleteBtn}
                onPress={handleDelete}
                disabled={!selectedReminder || actioningReminderId === selectedReminder.id}
              >
                <Trash2 size={18} color="#b3261e" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f0" },
  content: { padding: 24 },
  title: { fontSize: 22, fontWeight: "700", color: "#50a5e8", marginBottom: 16 },
  empty: { color: "#666", marginBottom: 16 },
  date: { fontWeight: "600", marginBottom: 4 },
  status: { fontSize: 13, color: "#666", marginTop: 4 },
  help: { marginTop: 24, alignSelf: "center", color: "#666" },
  adminActions: { marginBottom: 12 },
  helper: { color: "#666", marginTop: 8 },
  primaryBtn: {
    backgroundColor: "#50a5e8",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: "flex-start",
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2d4150",
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#d6dde2",
    backgroundColor: "#fff",
  },
  filterChipActive: {
    borderColor: "#50a5e8",
    backgroundColor: "#eaf4fd",
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2d4150",
  },
  filterChipTextActive: {
    color: "#50a5e8",
  },
  userOption: {
    borderWidth: 1,
    borderColor: "#d6dde2",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  userOptionSelected: { borderColor: "#50a5e8", backgroundColor: "#eaf4fd" },
  userOptionSelectedText: { color: "#50a5e8", fontWeight: "600" },
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#d6dde2",
    borderRadius: 8,
    padding: 12,
    textAlignVertical: "top",
    marginTop: 8,
  },
  modalActions: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  ghostBtn: { paddingHorizontal: 10, paddingVertical: 8 },
  ghostBtnText: { color: "#2d4150" },
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sheetTitle: { fontSize: 17, fontWeight: "700", color: "#2d4150" },
  sheetMessage: { color: "#2d4150", marginTop: 8, lineHeight: 20 },
  doneBtn: {
    backgroundColor: "#2d9d78",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  doneBtnText: { color: "#fff", fontWeight: "700" },
  iconDeleteBtn: {
    borderWidth: 1,
    borderColor: "#f1c5c0",
    borderRadius: 8,
    padding: 10,
  },
});
