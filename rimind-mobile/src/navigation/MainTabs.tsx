import React, { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, Heart, MessageCircle, Bell, User } from "lucide-react-native";
import { DashboardScreen } from "../screens/DashboardScreen";
import { HealthInfoScreen } from "../screens/HealthInfoScreen";
import { AIChatScreen } from "../screens/AIChatScreen";
import { ReminderListScreen } from "../screens/ReminderListScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { CHWDashboardScreen } from "../screens/CHWDashboardScreen";
import { useAuthStore } from "../store/authStore";
import { useRemindersStore } from "../store/remindersStore";

const Tab = createBottomTabNavigator();

const ICON_SIZE = 22;

const createTabBarIcon = (Icon: typeof Home) =>
  function TabBarIcon({ color }: { color: string }) {
    return <Icon size={ICON_SIZE} color={color} strokeWidth={2} />;
  };

export function MainTabs() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN";
  const isChw = user?.role === "HEALTH_WORKER";
  const fetchMyReminders = useRemindersStore((s) => s.fetchMyReminders);
  const pendingReminderCount = useRemindersStore(
    (s) => s.reminders.filter((r) => r.status === "PENDING").length,
  );

  useEffect(() => {
    if (!user?.id) return;
    void fetchMyReminders();
  }, [user?.id, fetchMyReminders]);

  const remindersTabBadge =
    pendingReminderCount > 0
      ? pendingReminderCount > 99
        ? "99+"
        : pendingReminderCount
      : undefined;

  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: "#50a5e8" }}>
      <Tab.Screen
        name="Home"
        component={isChw ? CHWDashboardScreen : DashboardScreen}
        options={{
          tabBarLabel: isChw ? "Users" : "Home",
          tabBarIcon: createTabBarIcon(Home),
          headerShown: false,
        }}
      />
      {!isAdmin && !isChw && (
        <Tab.Screen
          name="HealthInfo"
          component={HealthInfoScreen}
          options={{
            tabBarLabel: "Health",
            tabBarIcon: createTabBarIcon(Heart),
            headerShown: false,
          }}
        />
      )}
      {!isAdmin && !isChw && (
        <Tab.Screen
          name="AIChat"
          component={AIChatScreen}
          options={{
            tabBarLabel: "Chat",
            tabBarIcon: createTabBarIcon(MessageCircle),
            headerShown: false,
          }}
        />
      )}
      <Tab.Screen
        name="Reminders"
        component={ReminderListScreen}
        options={{
          tabBarLabel: isAdmin ? "Send" : isChw ? "Alerts" : "Reminders",
          tabBarIcon: createTabBarIcon(Bell),
          tabBarBadge: remindersTabBadge,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: createTabBarIcon(User),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}
