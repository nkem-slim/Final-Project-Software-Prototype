import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Pressable,
} from "react-native";
import { ChevronDown, Check } from "lucide-react-native";

type Props = {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
};

export function DropdownPicker({ label, value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Text style={s.label}>{label}</Text>
      <TouchableOpacity style={s.trigger} onPress={() => setOpen(true)}>
        <Text style={s.triggerText}>{value}</Text>
        <ChevronDown size={18} color="#888" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={s.backdrop} onPress={() => setOpen(false)}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>{label}</Text>
            <FlatList
              data={options as string[]}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.option}
                  onPress={() => { onChange(item); setOpen(false); }}
                >
                  <Text style={[s.optionText, item === value && s.optionSelected]}>
                    {item}
                  </Text>
                  {item === value && <Check size={16} color="#50a5e8" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  label: { marginBottom: 6, fontSize: 14, color: "#444", fontWeight: "500" },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
    minHeight: 52,
  },
  triggerText: { fontSize: 15, color: "#111", flex: 1 },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: "60%",
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  optionText: { fontSize: 15, color: "#333" },
  optionSelected: { color: "#50a5e8", fontWeight: "600" },
});
