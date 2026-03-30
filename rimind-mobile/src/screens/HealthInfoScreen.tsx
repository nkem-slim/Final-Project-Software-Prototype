import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  View,
  RefreshControl,
} from "react-native";
import { StatusBanner } from "../components/StatusBanner";
import { Card } from "../components/Card";
import { useConnectivity } from "../hooks/useConnectivity";
import { useAuthStore } from "../store/authStore";
import { useExerciseStore } from "../store/exerciseStore";
import Markdown from "react-native-markdown-display";
import { RefreshCcw } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";

export function HealthInfoScreen({ navigation }: { navigation: any }) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.accessToken);
  const {
    prenatal,
    postnatal,
    loadingPrenatal,
    loadingPostnatal,
    hydrate,
    refreshPrenatal,
    refreshPostnatal,
  } = useExerciseStore();
  const isOnline = useConnectivity();
  const [refreshing, setRefreshing] = useState(false);
  const [showUpdatesBanner, setShowUpdatesBanner] = useState(false);
  const previousOnline = useRef<boolean>(isOnline);

  useEffect(() => {
    hydrate(user?.id ?? null);
  }, [user?.id, hydrate]);

  useEffect(() => {
    if (previousOnline.current === false && isOnline) {
      setShowUpdatesBanner(true);
    }
    previousOnline.current = isOnline;
  }, [isOnline]);

  const handleRefreshPrenatal = async () => {
    if (!user) return;
    await refreshPrenatal({
      userId: user.id,
      userName: user.name,
      token: token ?? null,
    });
  };

  const handleRefreshPostnatal = async () => {
    if (!user) return;
    await refreshPostnatal({
      userId: user.id,
      userName: user.name,
      token: token ?? null,
    });
  };

  const handlePullRefresh = async () => {
    if (!user || !isOnline) return;
    setRefreshing(true);
    try {
      await Promise.all([handleRefreshPrenatal(), handleRefreshPostnatal()]);
      setShowUpdatesBanner(false);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handlePullRefresh}
          tintColor="#50a5e8"
          colors={["#50a5e8"]}
        />
      }
    >
      <StatusBar style="dark" />
      <StatusBanner isOnline={isOnline} />
      {showUpdatesBanner && isOnline && (
        <View style={s.updateBanner}>
          <Text style={s.updateBannerText}>
            New updates are available. Pull down to refresh.
          </Text>
          <TouchableOpacity
            onPress={() => setShowUpdatesBanner(false)}
            accessibilityRole="button"
            accessibilityLabel="Dismiss update banner"
          >
            <Text style={s.updateBannerDismiss}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}
      <Text style={s.title}>Health information</Text>
      <View style={s.sectionHeader}>
        <Text style={s.section}>Prenatal exercise</Text>
        <TouchableOpacity
          onPress={handleRefreshPrenatal}
          disabled={!isOnline || loadingPrenatal}
          accessibilityLabel="Refresh prenatal exercises"
          accessibilityRole="button"
        >
          <RefreshCcw
            size={18}
            color={isOnline ? "#50a5e8" : "#999"}
            style={{ opacity: loadingPrenatal ? 0.5 : 1 }}
          />
        </TouchableOpacity>
      </View>
      {loadingPrenatal && <ActivityIndicator size="small" color="#50a5e8" />}
      {!loadingPrenatal && prenatal && (
        <Card>
          <Markdown style={markdownStylesFull}>{prenatal}</Markdown>
        </Card>
      )}

      <View style={s.sectionHeader}>
        <Text style={s.section}>Postnatal exercise</Text>
        <TouchableOpacity
          onPress={handleRefreshPostnatal}
          disabled={!isOnline || loadingPostnatal}
          accessibilityLabel="Refresh postnatal exercises"
          accessibilityRole="button"
        >
          <RefreshCcw
            size={18}
            color={isOnline ? "#50a5e8" : "#999"}
            style={{ opacity: loadingPostnatal ? 0.5 : 1 }}
          />
        </TouchableOpacity>
      </View>
      {loadingPostnatal && <ActivityIndicator size="small" color="#50a5e8" />}
      {!loadingPostnatal && postnatal && (
        <Card>
          <Markdown style={markdownStylesFull}>{postnatal}</Markdown>
        </Card>
      )}
      <TouchableOpacity
        onPress={() =>
          Alert.alert("Help", "Ask your health worker for advice.")
        }
      >
        <Text style={s.help}>Help</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f0" },
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32 },
  updateBanner: {
    backgroundColor: "#e6f3ff",
    borderWidth: 1,
    borderColor: "#b7dbff",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  updateBannerText: {
    color: "#1f4d73",
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  updateBannerDismiss: {
    color: "#50a5e8",
    fontSize: 13,
    fontWeight: "600",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#50a5e8",
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 8,
  },
  section: { fontSize: 18, fontWeight: "600" },
  help: { marginTop: 24, alignSelf: "center", color: "#666" },
});

const markdownStylesFull = StyleSheet.create({
  body: { fontSize: 14, color: "#333", lineHeight: 20 },
  heading1: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
    color: "#2d4150",
  },
  heading2: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
    color: "#2d4150",
  },
  strong: { fontWeight: "700", color: "#2d4150" },
  paragraph: { marginBottom: 4 },
  bullet_list: { marginVertical: 2 },
  list_item: { marginVertical: 2 },
});
