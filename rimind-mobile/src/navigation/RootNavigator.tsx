import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  type NativeStackHeaderProps,
} from "@react-navigation/native-stack";
import { SafeNativeHeader } from "../components/SafeNativeHeader";
import { useAuthStore } from "../store/authStore";
import { useSync } from "../hooks/useSync";
import { AuthStack } from "./AuthStack";
import { MainTabs } from "./MainTabs";
import { PregnancyRecordScreen } from "../screens/PregnancyRecordScreen";
import { CHWDashboardScreen } from "../screens/CHWDashboardScreen";
import { AdminReportsScreen } from "../screens/AdminReportsScreen";
import { AdminUsersScreen } from "../screens/AdminUsersScreen";
import { EditProfileScreen } from "../screens/EditProfileScreen";

const Stack = createNativeStackNavigator();

const HEADER_BG = "#50a5e8";

/** JS header reserves status-bar space explicitly (native header can clip on Android edge-to-edge). */
const stackScreenOptions = {
  header: (props: NativeStackHeaderProps) => <SafeNativeHeader {...props} />,
  headerStyle: { backgroundColor: HEADER_BG },
  headerTintColor: "#fff",
  headerTitleStyle: { fontWeight: "600" as const },
  headerBackTitleVisible: false,
  statusBarStyle: "light" as const,
};

export function RootNavigator() {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const hydrate = useAuthStore((s) => s.hydrate);
  useSync();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!isHydrated) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={stackScreenOptions}>
        {!user ? (
          <Stack.Screen
            name="Auth"
            component={AuthStack}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PregnancyRecord"
              component={PregnancyRecordScreen}
              options={{ title: "Pregnancy" }}
            />
            <Stack.Screen
              name="CHW"
              component={CHWDashboardScreen}
              options={{ title: "CHW" }}
            />
            <Stack.Screen
              name="Admin"
              component={AdminReportsScreen}
              options={{ title: "Admin" }}
            />
            <Stack.Screen
              name="AdminUsers"
              component={AdminUsersScreen}
              options={{ title: "Users" }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ title: "Edit profile" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
