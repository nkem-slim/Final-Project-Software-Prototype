import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Eye, EyeOff } from "lucide-react-native";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/Button";
import { DropdownPicker } from "../components/DropdownPicker";
import {
  REGISTRATION_ROLES,
  type RegistrationRole,
  LOCATION_OPTIONS,
  type SupportedCountry,
} from "../utils/constants";
import { StatusBar } from "expo-status-bar";

export function RegisterScreen(props: { navigation: any }) {
  const { navigation } = props;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
  const insets = useSafeAreaInsets();

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
      // Alert.alert("Error", msg);
      Alert.alert("Registration failed", "And error occured.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.wrapper}>
      <StatusBar style="dark" />
      <ScrollView
        style={s.container}
        contentContainerStyle={[s.content, { paddingTop: insets.top + 16 }]}
      >
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
        <View style={s.passwordRow}>
          <TextInput
            style={s.passwordInput}
            placeholder="Password (8+ chars)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={s.eyeBtn}
            onPress={() => setShowPassword((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {showPassword ? (
              <EyeOff size={20} color="#888" />
            ) : (
              <Eye size={20} color="#888" />
            )}
          </TouchableOpacity>
        </View>

        <DropdownPicker
          label="Role"
          value={role}
          options={REGISTRATION_ROLES}
          onChange={(v) => setRole(v as RegistrationRole)}
        />

        <DropdownPicker
          label="Country"
          value={country}
          options={Object.keys(LOCATION_OPTIONS) as SupportedCountry[]}
          onChange={(v) => {
            const c = v as SupportedCountry;
            setCountry(c);
            const nextRegion1 = LOCATION_OPTIONS[c].regionLevel1[0];
            setRegionLevel1(nextRegion1);
            setRegionLevel2(
              LOCATION_OPTIONS[c].regionLevel2ByRegion[nextRegion1]?.[0] ?? "",
            );
          }}
        />

        <DropdownPicker
          label={LOCATION_OPTIONS[country].regionLevel1Label}
          value={regionLevel1}
          options={region1Options}
          onChange={(v) => {
            setRegionLevel1(v);
            setRegionLevel2(
              LOCATION_OPTIONS[country].regionLevel2ByRegion[v]?.[0] ?? "",
            );
          }}
        />

        <DropdownPicker
          label={LOCATION_OPTIONS[country].regionLevel2Label}
          value={regionLevel2}
          options={region2Options}
          onChange={setRegionLevel2}
        />

        <Button
          title={loading ? "…" : "Create account"}
          onPress={onRegister}
          disabled={loading}
        />
        <TouchableOpacity onPress={() => navigation.replace("Login")}>
          <Text style={s.link}>Sign in</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Alert.alert("Help", "Contact clinic.")}
        >
          <Text style={s.help}>Help</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#50a5e8" },
  container: { flex: 1, backgroundColor: "#f0f4f0" },
  content: { padding: 24 },
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
    color: "#111",
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
    minHeight: 52,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    color: "#111",
  },
  eyeBtn: {
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  link: { marginTop: 24, color: "#50a5e8", alignSelf: "center" },
  help: { marginTop: 16, color: "#666", alignSelf: "center" },
});
