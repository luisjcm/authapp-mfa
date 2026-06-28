// src/components/ui/Input.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../../src/theme';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export default function Input({
  label,
  error,
  style,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const getBorderColor = () => {
    if (error) return COLORS.danger;
    if (isFocused) return COLORS.primary;
    return COLORS.border;
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, error ? { color: COLORS.danger } : null]}>
        {label}
      </Text>

      <TextInput
        style={[styles.input, { borderColor: getBorderColor() }]}
        placeholderTextColor={COLORS.textMuted}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...rest}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', marginBottom: SPACING.md },
  label: { color: COLORS.text, fontSize: 14, fontWeight: '500', marginBottom: SPACING.xs },
  input: {
    backgroundColor: COLORS.card,
    color: COLORS.text,
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    fontSize: 16,
  },
  errorText: { color: COLORS.danger, fontSize: 12, marginTop: SPACING.xs },
});