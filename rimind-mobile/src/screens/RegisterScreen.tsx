import React, { useState } from "react";
import {
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/Button";
import { StatusBanner } from "../components/StatusBanner";
import { useConnectivity } from "../hooks/useConnectivity";
import { useOfflineQueue } from "../hooks/useOfflineQueue";
import {
  REGISTRATION_ROLES,
  type RegistrationRole,
  LOCATION_OPTIONS,
  type SupportedCountry,
} from "../utils/constants";

export function RegisterScreen(props: { navigation: any }) {
  const { navigation } = props;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RegistrationRole>("MOTHER");
  const [country, setCountry] = useState<SupportedCountry>("Rwanda");
  const [regionLevel1, setRegionLevel1] = useState<string>(
    LOCATION_OPTIONS.Rwanda.regionLevel1[0],
  );
  const [regionLevel2, setRegionLevel2] = useState<string>(
    LOCATION_OPTIONS.Rwanda.regionLevel2ByRegion[
      LOCATION_OPTIONS.Rwanda.regionLevel1[0]
    ][0],
  );
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const isOnline = useConnectivity();
  const { queueLength } = useOfflineQueue();

  const region1Options = LOCATION_OPTIONS[country].regionLevel1;
  const region2Options =
    LOCATION_OPTIONS[country].regionLevel2ByRegion[regionLevel1] ?? [];

  const onRegister = async () => {
    if (!name.trim() || !phone.trim() || !password) {
      Alert.alert("Error", "Fill name, phone and password");
      return;
    }
    if (!regionLevel1 || !regionLevel2) {
      Alert.alert("Error", "Select full location details.");
      return;
    }
    setLoading(true);
    try {
      await register(
        name.trim(),
        phone.trim(),
        password,
        role,
        country,
        regionLevel1,
        regionLevel2,
      );
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ??
        e?.response?.data?.message ??
        (e?.message === "Network Error"
          ? "Cannot reach server. Check your connection."
          : e?.message) ??
        "Try again.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* <StatusBanner isOnline={isOnline} queueLength={queueLength} /> */}
      <Text style={s.title}>Create account</Text>
      <TextInput
        style={s.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={s.input}
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={s.input}
        placeholder="Password (8+ chars)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Text style={s.label}>Role</Text>
      {REGISTRATION_ROLES.map((r) => (
        <TouchableOpacity
          key={r}
          style={[s.roleBtn, role === r && s.roleActive]}
          onPress={() => setRole(r)}
        >
          <Text style={role === r ? s.roleTextActive : undefined}>{r}</Text>
        </TouchableOpacity>
      ))}
      <Text style={s.label}>Country</Text>
      {(Object.keys(LOCATION_OPTIONS) as SupportedCountry[]).map((c) => (
        <TouchableOpacity
          key={c}
          style={[s.roleBtn, country === c && s.roleActive]}
          onPress={() => {
            setCountry(c);
            const nextRegion1 = LOCATION_OPTIONS[c].regionLevel1[0];
            setRegionLevel1(nextRegion1);
            const nextRegion2 =
              LOCATION_OPTIONS[c].regionLevel2ByRegion[nextRegion1]?.[0] ?? "";
            setRegionLevel2(nextRegion2);
          }}
        >
          <Text style={country === c ? s.roleTextActive : undefined}>{c}</Text>
        </TouchableOpacity>
      ))}
      <Text style={s.label}>{LOCATION_OPTIONS[country].regionLevel1Label}</Text>
      {region1Options.map((r1) => (
        <TouchableOpacity
          key={r1}
          style={[s.roleBtn, regionLevel1 === r1 && s.roleActive]}
          onPress={() => {
            setRegionLevel1(r1);
            const first =
              LOCATION_OPTIONS[country].regionLevel2ByRegion[r1]?.[0] ?? "";
            setRegionLevel2(first);
          }}
        >
          <Text style={regionLevel1 === r1 ? s.roleTextActive : undefined}>
            {r1}
          </Text>
        </TouchableOpacity>
      ))}
      <Text style={s.label}>{LOCATION_OPTIONS[country].regionLevel2Label}</Text>
      {region2Options.map((r2) => (
        <TouchableOpacity
          key={r2}
          style={[s.roleBtn, regionLevel2 === r2 && s.roleActive]}
          onPress={() => setRegionLevel2(r2)}
        >
          <Text style={regionLevel2 === r2 ? s.roleTextActive : undefined}>
            {r2}
          </Text>
        </TouchableOpacity>
      ))}
      <Button
        title={loading ? "…" : "Create account"}
        onPress={onRegister}
        disabled={loading}
      />
      <TouchableOpacity onPress={() => navigation.replace("Login")}>
        <Text style={s.link}>Sign in</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => Alert.alert("Help", "Contact clinic.")}>
        <Text style={s.help}>Help</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f0" },
  content: { padding: 24, paddingTop: 48 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#50a5e8",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    minHeight: 52,
  },
  label: { marginBottom: 8 },
  roleBtn: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#ccc",
    marginBottom: 8,
  },
  roleActive: { borderColor: "#50a5e8" },
  roleTextActive: { color: "#50a5e8", fontWeight: "600" },
  link: { marginTop: 24, color: "#50a5e8", alignSelf: "center" },
  help: { marginTop: 16, color: "#666", alignSelf: "center" },
});
