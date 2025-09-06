// src/components/ui/Button.tsx
import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../theme';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: 'primary' | 'ghost' | 'outline';
};

export default function Button({ title, onPress, disabled, style, variant='primary' }: Props) {
  const base = [styles.base, style, disabled && { opacity: 0.6 }];

  if (variant === 'ghost') {
    return (
      <Pressable onPress={onPress} disabled={disabled} style={({pressed}) => [styles.ghost, pressed && styles.pressed, ...base]}>
        <Text style={[styles.ghostText]}>{title}</Text>
      </Pressable>
    );
  }

  if (variant === 'outline') {
    return (
      <Pressable onPress={onPress} disabled={disabled} style={({pressed}) => [styles.outline, pressed && styles.pressed, ...base]}>
        <Text style={styles.outlineText}>{title}</Text>
      </Pressable>
    );
  }

  // primary
  return (
    <Pressable onPress={onPress} disabled={disabled} android_ripple={{color:'#00000022'}}
      style={({pressed}) => [styles.primary, pressed && styles.pressed, ...base]}>
      <Text style={styles.primaryText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: RADIUS.md, paddingVertical: 12, alignItems: 'center', marginTop: SPACING.sm },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },

  primary: { backgroundColor: COLORS.primary },
  primaryText: { color: COLORS.onPrimary, fontWeight: '700' },

  ghost: { backgroundColor: 'transparent' },
  ghostText: { color: COLORS.text, fontWeight: '600' },

  outline: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: 'transparent' },
  outlineText: { color: COLORS.text, fontWeight: '600' },
});
