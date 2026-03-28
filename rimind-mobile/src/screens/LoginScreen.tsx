import React, { useState } from 'react';
import { Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/Button';
import { StatusBanner } from '../components/StatusBanner';
import { useConnectivity } from '../hooks/useConnectivity';
import { useOfflineQueue } from '../hooks/useOfflineQueue';

export function LoginScreen(props: { navigation: any }) {
  const { navigation } = props;
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const isOnline = useConnectivity();
  const { queueLength } = useOfflineQueue();

  const onLogin = async () => {
    if (!phone.trim() || !password) {
      Alert.alert('Error', 'Enter phone and password');
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
      const message = isNetworkError
        ? "Cannot reach server. Is the API running? For device/emulator use the correct API URL (see .env.example)."
        : e?.response?.data?.error ?? "Try again.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <StatusBanner isOnline={isOnline} queueLength={queueLength} />
      <Text style={s.title}>Rimind - Sign in</Text>
      <TextInput style={s.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextInput style={s.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity onPress={() => Alert.alert('Forgot password', 'Please contact your clinic or health worker to reset your password.')}>
        <Text style={s.forgot}>Forgot password?</Text>
      </TouchableOpacity>
      <Button title={loading ? '…' : 'Sign in'} onPress={onLogin} disabled={loading} />
      <TouchableOpacity onPress={() => navigation.replace('Register')}><Text style={s.link}>Create account</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => Alert.alert('Help', 'Contact your clinic.')}><Text style={s.help}>Help</Text></TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f0' },
  content: { padding: 24, paddingTop: 48 },
  title: { fontSize: 24, fontWeight: '700', color: '#50a5e8', marginBottom: 24, textAlign: 'center' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 16, marginBottom: 16, minHeight: 52 },
  forgot: { marginTop: -4, marginBottom: 16, color: '#50a5e8', alignSelf: 'flex-end', fontSize: 14, fontWeight: '500' },
  link: { marginTop: 24, color: '#50a5e8', alignSelf: 'center' },
  help: { marginTop: 16, color: '#666', alignSelf: 'center' },
});
