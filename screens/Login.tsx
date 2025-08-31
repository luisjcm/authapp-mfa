import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Screen from '../components/Screen';
import Input from '../components/Input';
import Button from '../components/Button';
import { COLORS, FONTS, SPACING } from '../theme';

type Props = { onSubmit: (value: string) => void };

export default function Login({ onSubmit }: Props) {
  const [value, setValue] = React.useState('');

  return (
    <Screen scroll>
      <Text style={styles.title}>Iniciar sesión</Text>
      <Text style={styles.subtitle}>Te enviaremos un código de verificación</Text>

      <View style={{ height: SPACING.lg }} />

      <Input
        label="Email o teléfono"
        placeholder="tucorreo@ejemplo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={value}
        onChangeText={setValue}
        returnKeyType="done"
      />

      <Button
        label="Enviar código"
        onPress={() => value.trim() && onSubmit(value.trim())}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: 420, alignSelf: 'center' },     // ⬅︎ mismo ancho que Verify
  title: { color: COLORS.text, fontFamily: FONTS.bold, fontSize: 24 },
  subtitle: { color: COLORS.muted, fontFamily: FONTS.regular, marginTop: 6 }
});
