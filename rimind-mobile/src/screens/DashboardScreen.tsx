import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  View,
  RefreshControl,
} from "react-native";
import { useAuthStore } from "../store/authStore";
import { usePregnancyStore } from "../store/pregnancyStore";
import { useExerciseStore } from "../store/exerciseStore";
import { StatusBanner } from "../components/StatusBanner";
import { Card } from "../components/Card";
import { useConnectivity } from "../hooks/useConnectivity";
import { useOfflineQueue } from "../hooks/useOfflineQueue";
import { formatDate } from "../utils/dateUtils";
import Markdown from "react-native-markdown-display";
import {
  ChevronRight,
  RefreshCcw,
  ShieldCheck,
  BellRing,
  UserCircle2,
} from "lucide-react-native";
import { StatusBar } from "expo-status-bar";

const getDaysToDate = (iso: string): number => {
  const target = new Date(iso);
  const today = new Date();
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime();
  const end = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  ).getTime();
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
};

const extractTips = (text: string): string[] => {
  const lines = text.split("\n");
  const rawTips = lines.filter((line) => {
    const t = line.trim();
    return t.startsWith("- ") || t.startsWith("• ");
  });
  if (!rawTips.length) return [text.trim()];
  return rawTips
    .map((line) => line.replace(/^[-•]\s*/, "").trim())
    .filter((t) => t.length > 0);
};

export const DashboardScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.accessToken);
  const { records, fetchMyRecords } = usePregnancyStore();
  const { homeRoutine, loadingHome, hydrate, refreshHome } = useExerciseStore();
  const isOnline = useConnectivity();
  const { queueLength } = useOfflineQueue();
  const [routineTips, setRoutineTips] = useState<string[]>([]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [showFullRoutine, setShowFullRoutine] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showUpdatesBanner, setShowUpdatesBanner] = useState(false);
  const previousOnline = useRef<boolean>(isOnline);
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (user?.role === "MOTHER") {
      fetchMyRecords();
    }
  }, [user?.id, user?.role, fetchMyRecords]);

  useEffect(() => {
    hydrate(user?.id ?? null);
  }, [user?.id, hydrate]);

  useEffect(() => {
    if (previousOnline.current === false && isOnline) {
      setShowUpdatesBanner(true);
    }
    previousOnline.current = isOnline;
  }, [isOnline]);

  const upcoming = useMemo(() => {
    if (!records || records.length === 0) return null;
    // records are ordered by expectedDeliveryDate desc in backend; find the soonest upcoming
    const sorted = [...records].sort(
      (a, b) =>
        new Date(a.expectedDeliveryDate).getTime() -
        new Date(b.expectedDeliveryDate).getTime(),
    );
    return sorted[0];
  }, [records]);

  const daysToEdd = upcoming
    ? getDaysToDate(upcoming.expectedDeliveryDate)
    : null;

  useEffect(() => {
    if (!homeRoutine) return;
    const tips = extractTips(homeRoutine);
    setRoutineTips(tips);
    setCurrentTipIndex(0);
  }, [homeRoutine]);

  const handleRefreshHomeRoutine = async () => {
    if (!user || !upcoming) return;
    const friendlyEdd = formatDate(upcoming.expectedDeliveryDate);
    const todayLabel = formatDate(new Date());
    await refreshHome({
      userId: user.id,
      userName: user.name,
      eddIso: friendlyEdd,
      daysToEdd,
      todayLabel,
      token: token ?? null,
    });
  };

  const handlePullToRefresh = async () => {
    if (!isOnline) return;
    setRefreshing(true);
    try {
      await fetchMyRecords();
      await handleRefreshHomeRoutine();
      setShowUpdatesBanner(false);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handlePullToRefresh}
          tintColor="#50a5e8"
          colors={["#50a5e8"]}
        />
      }
    >
      <StatusBar style="dark" />
      <StatusBanner isOnline={isOnline} queueLength={queueLength} />
      {showUpdatesBanner && isOnline && (
        <View style={styles.updateBanner}>
          <Text style={styles.updateBannerText}>
            New updates are available. Pull down to refresh.
          </Text>
          <TouchableOpacity
            onPress={() => setShowUpdatesBanner(false)}
            accessibilityRole="button"
            accessibilityLabel="Dismiss update banner"
          >
            <Text style={styles.updateBannerDismiss}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}
      <Text style={styles.title}>Hello, {user?.name ?? "User"}</Text>

      {user?.role === "MOTHER" && upcoming && (
        <Card>
          <Text style={styles.eddLabel}>Your expected delivery date is</Text>
          <Text style={styles.eddDate}>
            {formatDate(upcoming.expectedDeliveryDate)}
          </Text>
          {typeof daysToEdd === "number" && (
            <View style={styles.countdownPill}>
              <Text style={styles.countdownNumber}>
                {daysToEdd > 0 ? daysToEdd : 0}
              </Text>
              <View style={styles.countdownTextWrap}>
                <Text style={styles.countdownMain}>
                  {daysToEdd > 0
                    ? "days to delivery"
                    : daysToEdd === 0
                      ? "Baby may arrive today!"
                      : "Past expected delivery"}
                </Text>
                {daysToEdd < 0 && (
                  <Text style={styles.countdownSub}>
                    {`${Math.abs(daysToEdd)} day${Math.abs(daysToEdd) === 1 ? "" : "s"} since expected date`}
                  </Text>
                )}
              </View>
            </View>
          )}
          <Text style={styles.eddSubheading}>
            Are you ready for this amazing experience?
          </Text>
          <View style={styles.eddHeaderRow}>
            <Text style={styles.eddPrompt}>
              Try out this exercise routine to help you during labour:
            </Text>
            <TouchableOpacity
              onPress={handleRefreshHomeRoutine}
              disabled={!isOnline || loadingHome}
              accessibilityLabel="Refresh exercise routine"
              accessibilityRole="button"
            >
              <RefreshCcw
                size={18}
                color={isOnline ? "#50a5e8" : "#999"}
                style={{ opacity: loadingHome ? 0.5 : 1 }}
              />
            </TouchableOpacity>
          </View>

          {!isOnline && (
            <Text style={styles.offlineHint}>
              Showing cached data - connect to refresh
            </Text>
          )}

          {loadingHome && (
            <Text style={styles.routineLoading}>
              Fetching a routine for you…
            </Text>
          )}

          {!loadingHome && routineTips.length > 0 && (
            <View style={styles.tipBox}>
              <Text style={styles.tipLabel}>
                Tip {currentTipIndex + 1} of {routineTips.length}
              </Text>
              <Markdown style={markdownStylesTip}>
                {routineTips[currentTipIndex]}
              </Markdown>
              {routineTips.length > 1 && (
                <TouchableOpacity
                  style={styles.nextTipButton}
                  onPress={() =>
                    setCurrentTipIndex((prev) =>
                      prev + 1 < routineTips.length ? prev + 1 : 0,
                    )
                  }
                  accessibilityLabel="See next exercise tip"
                  accessibilityRole="button"
                >
                  <Text style={styles.nextTipText}>Next tip</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setShowFullRoutine((prev) => !prev)}
                style={styles.viewFullButton}
              >
                <Text style={styles.viewFullText}>
                  {showFullRoutine ? "Hide full routine" : "View full routine"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {!loadingHome && !homeRoutine && (
            <TouchableOpacity onPress={() => navigation.navigate("AIChat")}>
              <Text style={styles.routineLink}>
                Open Virtual Doctor to ask for exercises
              </Text>
            </TouchableOpacity>
          )}

          {showFullRoutine && homeRoutine && (
            <View style={styles.routineBox}>
              <Markdown style={markdownStylesFull}>{homeRoutine}</Markdown>
            </View>
          )}
        </Card>
      )}

      {isAdmin ? (
        <>
          <Text style={styles.adminSubtitle}>Admin control center</Text>
          <View style={styles.quickGrid}>
            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => navigation.navigate("Admin")}
              accessibilityRole="button"
              accessibilityLabel="Open admin reports"
            >
              <ShieldCheck size={22} color="#50a5e8" />
              <View style={styles.quickTextRow}>
                <Text style={styles.quickTitle}>Admin reports</Text>
                {/* <Text style={styles.quickDesc}>View insights</Text> */}
              </View>
              <ChevronRight size={18} color="#50a5e8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => navigation.navigate("Reminders")}
              accessibilityRole="button"
              accessibilityLabel="Open reminders to send updates"
            >
              <BellRing size={22} color="#50a5e8" />
              <View style={styles.quickTextRow}>
                <Text style={styles.quickTitle}>Send reminders</Text>
                {/* <Text style={styles.quickDesc}>Manage reminder updates</Text> */}
              </View>
              <ChevronRight size={18} color="#50a5e8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => navigation.navigate("Profile")}
              accessibilityRole="button"
              accessibilityLabel="Open profile"
            >
              <UserCircle2 size={22} color="#50a5e8" />
              <View style={styles.quickTextRow}>
                <Text style={styles.quickTitle}>Profile</Text>
                {/* <Text style={styles.quickDesc}>Manage account details</Text> */}
              </View>
              <ChevronRight size={18} color="#50a5e8" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Card>
          <TouchableOpacity
            style={styles.action}
            onPress={() => navigation.navigate("HealthInfo")}
          >
            <Text style={styles.actionText}>Health information</Text>
            <ChevronRight size={18} color="#50a5e8" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.action}
            onPress={() => navigation.navigate("AIChat")}
          >
            <Text style={styles.actionText}>Virtual Doctor</Text>
            <ChevronRight size={18} color="#50a5e8" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.action}
            onPress={() => navigation.navigate("PregnancyRecord")}
          >
            <Text style={styles.actionText}>Your pregnancy record</Text>
            <ChevronRight size={18} color="#50a5e8" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.action}
            onPress={() => navigation.navigate("Reminders")}
          >
            <Text style={styles.actionText}>Reminders</Text>
            <ChevronRight size={18} color="#50a5e8" />
          </TouchableOpacity>
          {user?.role === "HEALTH_WORKER" && (
            <TouchableOpacity
              style={styles.action}
              onPress={() => navigation.navigate("CHW")}
            >
              <Text style={styles.actionText}>CHW Dashboard</Text>
              <ChevronRight size={18} color="#50a5e8" />
            </TouchableOpacity>
          )}
        </Card>
      )}

      <TouchableOpacity
        style={styles.help}
        onPress={() => Alert.alert("Help", "Contact your clinic.")}
      >
        <Text style={styles.helpText}>Help</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f0" },
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 48 },
  updateBanner: {
    backgroundColor: "#e6f3ff",
    borderWidth: 1,
    borderColor: "#b7dbff",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    marginTop: 4,
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
    fontSize: 24,
    fontWeight: "700",
    color: "#50a5e8",
    marginBottom: 16,
  },
  eddLabel: { fontSize: 14, color: "#666", marginBottom: 4 },
  eddDate: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d4150",
    marginBottom: 8,
  },
  countdownPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#50a5e8",
    borderRadius: 2,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  countdownNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginRight: 12,
  },
  countdownTextWrap: { flexShrink: 1 },
  countdownMain: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  countdownSub: {
    fontSize: 12,
    color: "#e3f2fd",
    marginTop: 2,
  },
  eddSubheading: { fontSize: 14, color: "#333", marginBottom: 4 },
  eddHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  eddPrompt: { fontSize: 14, color: "#333", marginRight: 8, flex: 1 },
  offlineHint: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
    marginBottom: 6,
  },
  routineLoading: { fontSize: 13, color: "#666", marginBottom: 4 },
  tipBox: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e7ff",
    marginBottom: 8,
  },
  tipLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#50a5e8",
    marginBottom: 4,
  },
  tipText: { fontSize: 14, color: "#333", marginBottom: 8 },
  nextTipButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#50a5e8",
    marginBottom: 6,
  },
  nextTipText: { fontSize: 13, fontWeight: "600", color: "#fff" },
  viewFullButton: { alignSelf: "flex-start", paddingVertical: 4 },
  viewFullText: { fontSize: 13, color: "#50a5e8", fontWeight: "500" },
  routineBox: {
    backgroundColor: "#f7fafc",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#d0e2f2",
    marginBottom: 6,
  },
  routineText: { fontSize: 14, color: "#333" },
  routineLink: { fontSize: 14, color: "#50a5e8", marginTop: 4 },
  adminSubtitle: {
    fontSize: 16,
    color: "#2d4150",
    fontWeight: "600",
    marginBottom: 10,
  },
  quickGrid: {
    gap: 12,
  },
  quickCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e8eef5",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quickTextRow: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quickTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2d4150",
  },
  quickDesc: {
    fontSize: 13,
    color: "#6b7785",
  },
  action: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionText: { fontSize: 17, color: "#50a5e8" },
  help: { marginTop: 24, alignSelf: "center" },
  helpText: { fontSize: 14, color: "#666" },
});

const markdownStylesTip = StyleSheet.create({
  body: { fontSize: 14, color: "#333", lineHeight: 20 },
  strong: { fontWeight: "700", color: "#2d4150" },
  paragraph: { marginBottom: 4 },
  bullet_list: { marginVertical: 0 },
  list_item: { marginVertical: 0 },
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
