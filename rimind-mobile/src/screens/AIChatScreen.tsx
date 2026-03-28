import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import Markdown from "react-native-markdown-display";
import { Copy } from "lucide-react-native";
import { useAiChatStore } from "../store/aiChatStore";
import { useAuthStore } from "../store/authStore";
import { DisclaimerBanner } from "../components/DisclaimerBanner";
import { Button } from "../components/Button";
import { useConnectivity } from "../hooks/useConnectivity";

export function AIChatScreen(props: { navigation: any }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const ask = useAiChatStore((s) => s.ask);
  const fetchHistory = useAiChatStore((s) => s.fetchHistory);
  const history = useAiChatStore((s) => s.history);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.accessToken);
  const isOnline = useConnectivity();

  useEffect(() => {
    let isMounted = true;
    const loadHistory = async () => {
      setIsFetchingHistory(true);
      try {
        await fetchHistory(user?.id ?? null);
      } finally {
        if (isMounted) setIsFetchingHistory(false);
      }
    };
    loadHistory();
    return () => {
      isMounted = false;
    };
  }, [user?.id, fetchHistory]);

  const onAsk = async () => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      await ask(q.trim(), token, user?.id ?? null);
      setQ("");
    } catch (e: unknown) {
      Alert.alert("Error", isOnline ? "Try again." : "Offline.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResponse = async (response: string) => {
    try {
      await Clipboard.setStringAsync(response);
      Alert.alert("Copied", "Response copied to clipboard.");
    } catch {
      Alert.alert("Error", "Could not copy.");
    }
  };

  return (
    <View style={s.container}>
      <DisclaimerBanner />
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        {isFetchingHistory && (
          <View style={s.loadingRow}>
            <ActivityIndicator size="small" color="#50a5e8" />
            <Text style={s.loadingText}>Getting your chats...</Text>
          </View>
        )}
        {history.slice(0, 10).map((h, i) => {
          const showUserPrompt =
            Boolean(h.question?.trim()) && !h.hideQuestion;
          return (
          <View key={i} style={s.bubble}>
            {showUserPrompt ? (
              <Text style={s.questionLabel}>You: {h.question}</Text>
            ) : null}
            <View style={s.responseRow}>
              <View style={s.responseContent}>
                <Markdown style={markdownStyles}>{h.response}</Markdown>
              </View>
              <TouchableOpacity
                style={s.copyButton}
                onPress={() => handleCopyResponse(h.response)}
                accessibilityLabel="Copy response"
                accessibilityRole="button"
              >
                <Copy size={20} color="#50a5e8" />
              </TouchableOpacity>
            </View>
          </View>
          );
        })}
      </ScrollView>
      <View style={s.footer}>
        <TextInput
          style={s.input}
          placeholder="Ask AI…"
          value={q}
          onChangeText={setQ}
          editable={!loading}
        />
        <Button
          title={loading ? "…" : "Ask AI"}
          onPress={onAsk}
          disabled={loading}
        />
      </View>
      <TouchableOpacity onPress={() => Alert.alert("Help", "Guidance only.")}>
        <Text style={s.help}>Help</Text>
      </TouchableOpacity>
    </View>
  );
}

const markdownStyles = StyleSheet.create({
  body: { color: "#333", fontSize: 15, lineHeight: 22 },
  heading1: {
    color: "#50a5e8",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 6,
  },
  heading2: {
    color: "#50a5e8",
    fontSize: 17,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 4,
  },
  heading3: {
    color: "#2d7a5e",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
  },
  strong: { fontWeight: "700", color: "#50a5e8" },
  bullet_list: { marginVertical: 4 },
  bullet_list_icon: { color: "#50a5e8", fontSize: 16, lineHeight: 22 },
  ordered_list: { marginVertical: 4 },
  list_item: { marginVertical: 2, paddingLeft: 4 },
  paragraph: { marginVertical: 4 },
  blockquote: {
    backgroundColor: "#f0f4f0",
    borderLeftWidth: 4,
    borderLeftColor: "#50a5e8",
    paddingLeft: 12,
    marginVertical: 6,
  },
  code_inline: {
    backgroundColor: "#eee",
    paddingHorizontal: 4,
    borderRadius: 4,
    fontFamily: "monospace",
  },
});

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f0" },
  scroll: { flex: 1 },
  content: { padding: 16 },
  bubble: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#50a5e8",
    marginBottom: 8,
  },
  responseRow: { flexDirection: "row", alignItems: "flex-start" },
  responseContent: { flex: 1 },
  copyButton: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f0f4f0",
  },
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    minHeight: 44,
  },
  help: { alignSelf: "center", padding: 8, color: "#666" },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  loadingText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 13,
  },
});
