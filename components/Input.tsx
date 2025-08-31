// components/Input.tsx
import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../theme';

type Props = TextInputProps & {
  label?: string;
  hint?: string;
};

export default function Input({ label, hint, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor={COLORS.muted}
        style={styles.input}
        {...rest}
      />
      {!!hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', marginBottom: SPACING.lg },
  label: { color: COLORS.text, fontFamily: FONTS.semibold, marginBottom: SPACING.xs },
  input: {
    backgroundColor: COLORS.card,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontFamily: FONTS.regular,
    fontSize: 16
  },
  hint: { color: COLORS.muted, marginTop: 6, fontFamily: FONTS.regular, fontSize: 12 }
});
