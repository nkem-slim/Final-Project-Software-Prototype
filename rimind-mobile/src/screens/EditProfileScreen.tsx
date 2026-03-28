import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/Button";
import { StatusBanner } from "../components/StatusBanner";
import { useConnectivity } from "../hooks/useConnectivity";

export function EditProfileScreen(props: { navigation: any }) {
  const { navigation } = props;
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const isOnline = useConnectivity();
  const [name, setName] = useState(user?.name ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !phoneNumber.trim()) {
      Alert.alert("Error", "Name and phone number are required.");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
      });
      Alert.alert("Updated", "Profile updated successfully.");
      navigation.goBack();
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? "Could not update profile.";
      Alert.alert("Error", msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* <StatusBanner isOnline={isOnline} /> */}
      <View style={s.form}>
        <Text style={s.label}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={s.input}
          placeholder="Enter name"
        />
        <Text style={s.label}>Phone number</Text>
        <TextInput
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          style={s.input}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />
      </View>

      <Button
        title={saving ? "Saving..." : "Save changes"}
        onPress={handleSave}
        disabled={saving}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f0" },
  content: { padding: 24, paddingBottom: 32 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#50a5e8",
    marginBottom: 16,
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
    marginTop: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
});
