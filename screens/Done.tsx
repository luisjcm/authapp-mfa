// screens/Done.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Screen from '../components/Screen';
import Button from '../components/Button';
import { COLORS, FONTS, SPACING } from '../theme';

type Props = { onGoHome?: () => void };

export default function Done({ onGoHome }: Props) {
  return (
    <Screen>
      <View style={styles.wrap}>
        <Text style={styles.title}>✅ Sesión verificada</Text>
        <Text style={styles.subtitle}>Tu acceso ha sido confirmado correctamente.</Text>
        <Button label="Ir al inicio" onPress={onGoHome || (() => {})} style={{ marginTop: SPACING.xl }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: 420, alignSelf: 'center', alignItems: 'center', paddingTop: SPACING.xl },
  title: { color: COLORS.text, fontFamily: FONTS.bold, fontSize: 22, textAlign: 'center' },
  subtitle: { color: COLORS.muted, fontFamily: FONTS.regular, marginTop: 6, textAlign: 'center' }
});
