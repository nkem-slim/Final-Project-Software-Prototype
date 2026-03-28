import React, { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  View,
  Linking,
} from "react-native";
import { Phone, ChevronRight } from "lucide-react-native";
import api from "../services/api";
import { useAuthStore } from "../store/authStore";
import { StatusBanner } from "../components/StatusBanner";
import { Card } from "../components/Card";
import { useConnectivity } from "../hooks/useConnectivity";
import { formatDateTime } from "../utils/dateUtils";

type Patient = {
  id: string;
  name: string;
  phoneNumber: string;
  createdAt: string;
  country?: string | null;
  regionLevel1?: string | null;
  regionLevel2?: string | null;
};

export function CHWDashboardScreen(props: { navigation: any }) {
  const { navigation } = props;
  const chw = useAuthStore((s) => s.user);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const isOnline = useConnectivity();

  useEffect(() => {
    api
      .get("/chw/patients")
      .then((res) => {
        const list: Patient[] = Array.isArray(res.data?.data ?? res.data)
          ? res.data?.data ?? res.data
          : [];
        const filtered = list.filter(
          (p) =>
            p.country === chw?.country &&
            p.regionLevel1 === chw?.regionLevel1 &&
            p.regionLevel2 === chw?.regionLevel2,
        );
        setPatients(filtered);
      })
      .catch(() => setPatients([]))
      .finally(() => setLoading(false));
  }, [chw?.country, chw?.regionLevel1, chw?.regionLevel2]);

  const handleCallPatient = async (phoneNumber: string) => {
    const callUrl = `tel:${phoneNumber}`;
    const supported = await Linking.canOpenURL(callUrl);
    if (!supported) {
      Alert.alert("Cannot call", "Calling is not supported on this device.");
      return;
    }
    await Linking.openURL(callUrl);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <StatusBanner isOnline={isOnline} />
      <Text style={s.title}>CHW Dashboard</Text>
      {loading && <ActivityIndicator size="large" color="#50a5e8" />}
      {!loading && patients.length === 0 && (
        <Text style={s.empty}>No patients.</Text>
      )}
      {patients.map((p) => (
        <Card key={p.id}>
          <Text style={s.name}>{p.name}</Text>
          <Text style={s.phone}>{p.phoneNumber}</Text>
          <Text style={s.meta}>Joined: {formatDateTime(p.createdAt)}</Text>

          <View style={s.actionsRow}>
            <TouchableOpacity
              style={s.callBtn}
              onPress={() => handleCallPatient(p.phoneNumber)}
              accessibilityRole="button"
              accessibilityLabel={`Call ${p.name}`}
            >
              <Phone size={16} color="#50a5e8" />
              <Text style={s.callText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.openBtn}
              onPress={() =>
                navigation.navigate("PregnancyRecord", { userId: p.id })
              }
              accessibilityRole="button"
              accessibilityLabel={`Open ${p.name} details`}
            >
              <Text style={s.openText}>See record</Text>
              <ChevronRight size={16} color="#50a5e8" />
            </TouchableOpacity>
          </View>
        </Card>
      ))}
      <TouchableOpacity onPress={() => Alert.alert("Help", "Select patient.")}>
        <Text style={s.help}>Help</Text>
      </TouchableOpacity>
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
    marginBottom: 16,
  },
  empty: { color: "#666" },
  name: { fontWeight: "600", fontSize: 17 },
  phone: { fontSize: 14, color: "#666", marginTop: 4 },
  meta: { fontSize: 12, color: "#7a8794", marginTop: 4 },
  actionsRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  callBtn: { flexDirection: "row", alignItems: "center" },
  callText: { marginLeft: 6, color: "#50a5e8", fontWeight: "600" },
  openBtn: { flexDirection: "row", alignItems: "center" },
  openText: { color: "#50a5e8", fontWeight: "600", marginRight: 4 },
  help: { marginTop: 24, alignSelf: "center", color: "#666" },
});
