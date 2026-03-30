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
import { StatusBar } from "expo-status-bar";

export function LoginScreen(props: { navigation: any }) {
  const { navigation } = props;
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((s) => s.login);
  const insets = useSafeAreaInsets();

  const onLogin = async () => {
    if (!phone.trim() || !password) {
      Alert.alert("Error", "Enter phone and password");
      return;
    }
    setLoading(true);
    try {
      await login(phone.trim(), password);
    } catch (e: any) {
      const isNetworkError =
        e?.message === "Network Error" ||
        e?.code === "ECONNABORTED" ||
        !e?.response;
      const status = e?.response?.status;
      const message = isNetworkError
        ? "Cannot reach server. Check your internet connection."
        : (e?.response?.data?.error ??
          e?.response?.data?.message ??
          `Server error (${status ?? "unknown"}). Try again.`);
      Alert.alert("Login failed", "And error occured.");
      // Alert.alert("Login failed", message);
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
        <Text style={s.title}>Rimind - Sign in</Text>
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
            placeholder="Password"
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
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              "Forgot password",
              "Please contact your clinic or health worker to reset your password.",
            )
          }
        >
          <Text style={s.forgot}>Forgot password?</Text>
        </TouchableOpacity>
        <Button
          title={loading ? "…" : "Sign in"}
          onPress={onLogin}
          disabled={loading}
        />
        <TouchableOpacity onPress={() => navigation.replace("Register")}>
          <Text style={s.link}>Create account</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Alert.alert("Help", "Contact your clinic.")}
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
    fontSize: 24,
    fontWeight: "700",
    color: "#50a5e8",
    marginBottom: 24,
    textAlign: "center",
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
  forgot: {
    marginTop: -4,
    marginBottom: 16,
    color: "#50a5e8",
    alignSelf: "flex-end",
    fontSize: 14,
    fontWeight: "500",
  },
  link: { marginTop: 24, color: "#50a5e8", alignSelf: "center" },
  help: { marginTop: 16, color: "#666", alignSelf: "center" },
});
