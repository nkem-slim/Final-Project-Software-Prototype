import React, { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import api from "../services/api";
import { StatusBanner } from "../components/StatusBanner";
import { Card } from "../components/Card";
import { useConnectivity } from "../hooks/useConnectivity";

type Report = {
  usersByRole: { MOTHER: number; HEALTH_WORKER: number; ADMIN: number };
  reminderCounts: { PENDING: number; SENT: number; FAILED: number };
  recentSyncLogs: Array<{
    id: string;
    deviceId: string;
    syncedAt: string;
    recordCount: number;
    status: string;
  }>;
};

export const AdminReportsScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const isOnline = useConnectivity();

  useEffect(() => {
    api
      .get<{ data: Report }>("/admin/reports")
      .then((res) => setReport(res.data?.data ?? res.data ?? null))
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBanner isOnline={isOnline} />
      <Text style={styles.title}>Admin reports</Text>
      {loading && <ActivityIndicator size="large" color="#50a5e8" />}
      {!loading && report && (
        <>
          <TouchableOpacity onPress={() => navigation.navigate("AdminUsers")}>
            <Card>
              <Text style={styles.cardTitle}>Users by role</Text>
              <Text>Mothers: {report.usersByRole.MOTHER}</Text>
              <Text>Health workers: {report.usersByRole.HEALTH_WORKER}</Text>
              <Text>Admins: {report.usersByRole.ADMIN}</Text>
              <Text style={styles.link}>
                Tap to view users and perform actions
              </Text>
            </Card>
          </TouchableOpacity>
          <Card>
            <Text style={styles.cardTitle}>Reminders</Text>
            <Text>Pending: {report.reminderCounts.PENDING}</Text>
            <Text>Sent: {report.reminderCounts.SENT}</Text>
            <Text>Failed: {report.reminderCounts.FAILED}</Text>
          </Card>
          <Text style={styles.cardTitle}>Recent syncs</Text>
          {report.recentSyncLogs.slice(0, 10).map((s) => (
            <Card key={s.id}>
              <Text>Device: {s.deviceId}</Text>
              <Text>
                Records: {s.recordCount} • {s.status}
              </Text>
              <Text style={styles.small}>
                {new Date(s.syncedAt).toLocaleString()}
              </Text>
            </Card>
          ))}
        </>
      )}
      <TouchableOpacity
        style={styles.help}
        onPress={() => Alert.alert("Help", "System usage report.")}
      >
        <Text style={styles.helpText}>Help</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f0" },
  content: { paddingVertical: 8, paddingHorizontal: 24 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#50a5e8",
    marginBottom: 16,
  },
  cardTitle: { fontWeight: "600", marginBottom: 8 },
  small: { fontSize: 12, color: "#666", marginTop: 4 },
  link: { marginTop: 8, fontSize: 13, color: "#50a5e8", fontWeight: "500" },
  help: { marginTop: 24, alignSelf: "center" },
  helpText: { fontSize: 14, color: "#666" },
});
