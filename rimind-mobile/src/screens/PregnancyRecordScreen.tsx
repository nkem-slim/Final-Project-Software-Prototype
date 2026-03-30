import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Text,
  StyleSheet,
  View,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { Pencil, Trash2 } from "lucide-react-native";
import { Calendar } from "react-native-calendars";
import type { DateData } from "react-native-calendars";
import { usePregnancyStore } from "../store/pregnancyStore";
import type { PregnancyRecord } from "../store/pregnancyStore";
import { useAuthStore } from "../store/authStore";
import { StatusBanner } from "../components/StatusBanner";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useConnectivity } from "../hooks/useConnectivity";
import { formatDate } from "../utils/dateUtils";
import axios from "axios";
import { StatusBar } from "expo-status-bar";

const THEME_COLOR = "#50a5e8";

const CALENDAR_THEME = {
  backgroundColor: "#fff",
  calendarBackground: "#fff",
  textSectionTitleColor: "#666",
  selectedDayBackgroundColor: THEME_COLOR,
  selectedDayTextColor: "#fff",
  todayTextColor: THEME_COLOR,
  dayTextColor: "#2d4150",
  textDisabledColor: "#d9e1e8",
  dotColor: THEME_COLOR,
  selectedDotColor: "#fff",
  arrowColor: THEME_COLOR,
  monthTextColor: "#2d4150",
  textDayFontWeight: "500" as const,
  textMonthFontWeight: "700" as const,
  textDayHeaderFontWeight: "600" as const,
};

const toDateString = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const getSaveErrorMessage = (e: unknown): string => {
  if (axios.isAxiosError(e)) {
    const data = e.response?.data;
    if (data?.error) return String(data.error);
    if (data?.message) return String(data.message);
    if (e.code === "ECONNABORTED" || e.message?.includes("Network")) {
      return "Connection timed out. Request queued - will sync when back online.";
    }
    if (e.response?.status === 401) return "Please sign in again.";
    if (e.response?.status === 403)
      return "Only mothers can add pregnancy records.";
    if (e.response?.status === 422)
      return data?.errors?.[0] ?? "Invalid date or data.";
  }
  return "Could not save. Check your connection and try again.";
};

type RouteParams = { userId?: string };

export function PregnancyRecordScreen() {
  const route = useRoute<any>();
  const params = (route.params as RouteParams | undefined) ?? {};
  const viewedUserId = params.userId ?? null;
  const currentUser = useAuthStore((s) => s.user);
  const canEdit = currentUser?.role !== "HEALTH_WORKER";
  const {
    records,
    fetchMyRecords,
    fetchRecordsForUser,
    createRecord,
    updateRecordEdd,
    deleteRecord,
  } = usePregnancyStore();
  const [showAddMode, setShowAddMode] = useState(false);
  const [pickDate, setPickDate] = useState<string>(() =>
    toDateString(new Date()),
  );
  const [loading, setLoading] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const isOnline = useConnectivity();

  useEffect(() => {
    if (viewedUserId) {
      fetchRecordsForUser(viewedUserId);
    } else {
      fetchMyRecords();
    }
  }, [fetchMyRecords, fetchRecordsForUser, viewedUserId]);

  const recordsByDate = useMemo(() => {
    const map: Record<string, PregnancyRecord[]> = {};
    for (const r of records) {
      const dateStr = r.expectedDeliveryDate.split("T")[0];
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(r);
    }
    return map;
  }, [records]);

  const markedDates = useMemo(() => {
    const marked: Record<
      string,
      { selected?: boolean; dots?: { key: string; color: string }[] }
    > = {};
    for (const [dateStr, recs] of Object.entries(recordsByDate)) {
      marked[dateStr] = {
        dots: recs.map((_, i) => ({
          key: String(i),
          color: THEME_COLOR,
        })),
      };
    }
    return marked;
  }, [recordsByDate]);

  const handleSaveNewRecord = useCallback(async () => {
    setLoading(true);
    try {
      if (editingRecordId) {
        await updateRecordEdd(editingRecordId, pickDate);
      } else {
        await createRecord(pickDate);
      }
      setShowAddMode(false);
      setEditingRecordId(null);
      setPickDate(toDateString(new Date()));
    } catch (e: unknown) {
      Alert.alert("Error", getSaveErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [createRecord, updateRecordEdd, editingRecordId, pickDate]);

  const handleCancelAdd = useCallback(() => {
    setShowAddMode(false);
    setEditingRecordId(null);
  }, []);

  return (
    <View style={s.container}>
      <StatusBar style="dark" />
      {/* <StatusBanner isOnline={isOnline} /> */}
      <View style={s.header}>
        {showAddMode && <Text style={s.title}>Pregnancy record</Text>}
        {!showAddMode && !viewedUserId && canEdit && (
          <Button title="Add record" onPress={() => setShowAddMode(true)} />
        )}
      </View>

      {showAddMode ? (
        <View style={s.addMode}>
          <Text style={s.addModeTitle}>Select expected delivery date</Text>
          <Text style={s.addModeSelected}>
            Selected EDD: {formatDate(pickDate)}
          </Text>
          <Calendar
            current={pickDate}
            onDayPress={(day: DateData) => setPickDate(day.dateString)}
            markedDates={{
              ...markedDates,
              [pickDate]: { ...(markedDates[pickDate] ?? {}), selected: true },
            }}
            markingType="multi-dot"
            enableSwipeMonths
            theme={CALENDAR_THEME}
            style={s.addCalendar}
          />
          <View style={s.addActions}>
            <Button
              title={loading ? "…" : "Save"}
              onPress={handleSaveNewRecord}
              disabled={loading}
            />
            <TouchableOpacity onPress={handleCancelAdd} style={s.cancelBtn}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView
          style={s.list}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator
        >
          <View style={s.recordsSection}>
            <Text style={s.sectionTitle}>
              {viewedUserId ? "User Record" : "Your records"}
            </Text>
            {records.length > 0 ? (
              records.map((r) => (
                <Card key={r.id}>
                  <View style={s.cardHeader}>
                    <View style={s.cardHeaderText}>
                      <Text style={s.cardTitle}>
                        EDD: {formatDate(r.expectedDeliveryDate)} - Trimester{" "}
                        {r.trimester}
                      </Text>
                      {r.healthNotes ? (
                        <Text style={s.notes}>{r.healthNotes}</Text>
                      ) : null}
                    </View>
                    {canEdit && (
                      <View style={s.cardActions}>
                        <TouchableOpacity
                          onPress={() => {
                            setEditingRecordId(r.id);
                            setPickDate(r.expectedDeliveryDate.split("T")[0]);
                            setShowAddMode(true);
                          }}
                          accessibilityLabel="Edit expected delivery date"
                          accessibilityRole="button"
                        >
                          <Pencil size={20} color={THEME_COLOR} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={s.deleteIcon}
                          onPress={() =>
                            Alert.alert(
                              "Delete record",
                              "Are you sure you want to delete this pregnancy record?",
                              [
                                { text: "Cancel", style: "cancel" },
                                {
                                  text: "Delete",
                                  style: "destructive",
                                  onPress: () => deleteRecord(r.id),
                                },
                              ],
                            )
                          }
                          accessibilityLabel="Delete pregnancy record"
                          accessibilityRole="button"
                        >
                          <Trash2 size={20} color="#b3261e" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </Card>
              ))
            ) : (
              <View style={s.emptyData}>
                <Text style={s.emptyText}>
                  No records yet. Tap "Add record" to get started.
                </Text>
              </View>
            )}
          </View>

          <View style={s.calendarSection}>
            <Text style={s.sectionTitle}>Current Calendar</Text>
            <Calendar
              current={toDateString(new Date())}
              onDayPress={() => {}}
              markedDates={markedDates}
              markingType="multi-dot"
              enableSwipeMonths
              theme={CALENDAR_THEME}
              style={s.calendar}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 12 },
  header: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: THEME_COLOR,
    marginBottom: 12,
  },
  list: { flex: 1 },
  listContent: { paddingBottom: 24 },
  recordsSection: {
    paddingHorizontal: 4,
    paddingTop: 16,
    paddingBottom: 8,
  },
  calendarSection: {
    paddingHorizontal: 4,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME_COLOR,
    marginBottom: 12,
  },
  calendar: {
    borderRadius: 8,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  cardHeaderText: { flex: 1 },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  deleteIcon: {
    marginLeft: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  notes: { marginTop: 8, color: "#555", fontSize: 14 },
  emptyData: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { color: "#666", fontSize: 14, textAlign: "center" },
  addMode: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  addModeTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  addModeSelected: {
    fontSize: 14,
    fontWeight: "500",
    color: THEME_COLOR,
    marginBottom: 12,
  },
  addCalendar: {
    marginBottom: 20,
    borderRadius: 8,
  },
  addActions: {
    gap: 12,
  },
  cancelBtn: {
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  cancelText: { color: "#666", fontSize: 16 },
});
