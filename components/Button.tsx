import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, FONTS } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  textColor?: string;
  size?: 'sm' | 'md' | 'lg';   // NUEVO
  fullWidth?: boolean;         // NUEVO
};

export default function Button({
  label,
  onPress,
  style,
  disabled,
  variant = 'primary',
  textColor,
  size = 'md',
  fullWidth = false,
}: Props) {
  const isPrimary = variant === 'primary';
  const sizeStyle =
    size === 'lg'
      ? { paddingVertical: SPACING.lg }
      : size === 'sm'
      ? { paddingVertical: SPACING.sm }
      : { paddingVertical: SPACING.md };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: COLORS.primary }}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        sizeStyle,
        fullWidth && { width: '100%' },
        disabled && { opacity: 0.6 },
        pressed && { opacity: 0.9 },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: textColor ?? (isPrimary ? '#ffffff' : COLORS.text) },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  primary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderColor: COLORS.border,
  },
  text: {
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
});
