// components/Button.tsx
import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, FONTS } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
};

export default function Button({ label, onPress, style, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: '#16a34a' }}
      style={({ pressed }) => [
        styles.btn,
        disabled && { opacity: 0.6 },
        pressed && { opacity: 0.9 },
        style
      ]}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center'
  },
  text: {
    color: COLORS.primaryText,
    fontFamily: FONTS.bold,
    fontSize: 16
  }
});
