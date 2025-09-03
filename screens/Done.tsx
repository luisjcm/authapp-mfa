import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Screen from '../components/Screen';
import Button from '../components/Button';
import { COLORS, FONTS, SPACING, RADIUS } from '../theme';

type Props = { onGoHome?: () => void };

export default function Done({ onGoHome }: Props) {
  return (
    <Screen center>
      <View style={styles.wrap}>
        {/* Badge + título */}
        <View style={styles.row}>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>✓</Text>
          </View>
          <Text style={styles.title}>Todo en orden</Text>
        </View>

        <Text style={styles.subtitle}>
          Tu identidad fue confirmada correctamente.
        </Text>

        <Button
          label="Ir al inicio"
          onPress={onGoHome || (() => {})}
          size="lg"            // más alto
          fullWidth            // ocupa todo el ancho del contenedor
          style={{ marginTop: SPACING.xl }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: {
    color: COLORS.primaryText,
    fontFamily: FONTS.bold,
    fontSize: 16,
    lineHeight: 16,
  },
  title: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 20,
  },
  subtitle: {
    color: COLORS.muted,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
});
