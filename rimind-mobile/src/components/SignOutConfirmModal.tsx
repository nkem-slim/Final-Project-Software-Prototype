import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";

export type SignOutConfirmModalProps = {
  visible: boolean;
  onDismiss: () => void;
  onConfirmSignOut: () => void;
};

export const SignOutConfirmModal: React.FC<SignOutConfirmModalProps> = ({
  visible,
  onDismiss,
  onConfirmSignOut,
}) => {
  const handleConfirmPress = () => {
    onConfirmSignOut();
  };

  const handleCancelPress = () => {
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      accessibilityViewIsModal
    >
      <View style={styles.wrap}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss sign out dialog"
        />
        <View style={styles.card}>
          <Text style={styles.title} accessibilityRole="header">
            Sign out?
          </Text>
          <Text style={styles.message}>
            You will need to sign in again to use your account.
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleCancelPress}
              accessibilityRole="button"
              accessibilityLabel="Cancel sign out"
            >
              <Text style={styles.buttonSecondaryText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonDanger]}
              onPress={handleConfirmPress}
              accessibilityRole="button"
              accessibilityLabel="Confirm sign out"
            >
              <Text style={styles.buttonDangerText}>Sign out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 22,
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2d4150",
    marginBottom: 10,
  },
  message: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
    marginBottom: 22,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    flexWrap: "wrap",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    minWidth: 100,
    alignItems: "center",
  },
  buttonSecondary: {
    backgroundColor: "#e8ecf0",
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d4150",
  },
  buttonDanger: {
    backgroundColor: "#b3261e",
  },
  buttonDangerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
