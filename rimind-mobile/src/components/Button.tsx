import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
};

export const Button: React.FC<Props> = ({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  style,
}) => (
  <TouchableOpacity
    style={[
      styles.button,
      variant === 'secondary' ? styles.secondary : styles.primary,
      disabled && styles.disabled,
      style,
    ]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityLabel={title}
    accessibilityState={{ disabled }}
  >
    {disabled && title === '…' ? (
      <ActivityIndicator size="small" color={variant === 'primary' ? '#fff' : '#50a5e8'} />
    ) : (
      <Text style={[styles.text, variant === 'secondary' ? styles.textSecondary : styles.textPrimary]}>
        {title}
      </Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: {
    backgroundColor: '#50a5e8',
  },
  secondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#50a5e8',
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  textPrimary: {
    color: '#fff',
  },
  textSecondary: {
    color: '#50a5e8',
  },
});
