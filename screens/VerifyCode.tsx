// screens/VerifyCode.tsx
import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Screen from '../components/Screen';
import Button from '../components/Button';
import OTPInput from '../components/OTPInput';
import { COLORS, FONTS, SPACING } from '../theme';
// opcional haptics
import * as Haptics from 'expo-haptics';


type Props = {
  onVerify: (code: string) => Promise<void> | void;
  onResend?: () => void;
  destination?: string;
};



export default function VerifyCode({ onVerify, onResend, destination }: Props) {
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);

  const handleVerify = async (c: string) => {
    if (loading) return;
    setLoading(true);
    setError(false);
    try {
      await onVerify(c);
      // si onVerify falla lanzando error, caemos al catch
    } catch (e) {
      setError(true);
      // feedback táctil
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.wrap}>
        <Text style={styles.title}>Verifica tu código</Text>
        {!!destination && <Text style={styles.subtitle}>Enviado a {destination}</Text>}

        <View style={{ height: SPACING.xl }} />

        <OTPInput
          length={6}
          fit
          gap={10}
          minSize={38}
          error={error}                 // ← pinta bordes rojos si hay error
          onChangeCode={(c) => { setCode(c); if (error) setError(false); }}
          onFulfill={(c) => handleVerify(c)}  // ← auto-submit al completar
        />

        {error && (
          <Text style={styles.error}>Código incorrecto o expirado. Intenta de nuevo.</Text>
        )}

        <View style={{ height: SPACING.xl }} />

        <Button
          label={loading ? 'Verificando…' : 'Confirmar'}
          onPress={() => handleVerify(code)}
          disabled={code.length !== 6 || loading}   // ← deshabilitado hasta 6 dígitos
        />

        {!!onResend && (
          <Text onPress={onResend} style={styles.resend}>Reenviar código</Text>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  title: { color: COLORS.text, fontFamily: FONTS.bold, fontSize: 24 },
  subtitle: { color: COLORS.muted, fontFamily: FONTS.regular, marginTop: 6 },
  resend: { color: '#a3e635', marginTop: SPACING.md, fontFamily: FONTS.semibold },
  error: { color: '#ef4444', marginTop: SPACING.sm, fontFamily: FONTS.semibold }
});
