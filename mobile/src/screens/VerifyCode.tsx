// src/screens/VerifyCode.tsx
import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { COLORS, SPACING } from '../theme';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { RootStackScreenProps } from '../navigation/types';

// 1. Tipamos la pantalla para que exija los parámetros definidos en nuestro enrutador
type Props = RootStackScreenProps<'VerifyCode'>;

export default function VerifyCode({ route, navigation }: Props) {
  // 2. Extraemos el email exacto que vino viajando desde la pantalla de Login
  const { email } = route.params;
  
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerifySubmit = () => {
    setError('');
    
    // Validación local estricta antes de pegarle al servidor
    if (code.length !== 6) {
      setError('El código debe tener exactamente 6 dígitos.');
      return;
    }

    setIsLoading(true);

    // Simulamos la verificación contra el backend
    setTimeout(() => {
      setIsLoading(false);
      // Si el código es correcto, lo mandamos a la bóveda (Home)
      navigation.navigate('Home');
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        
        <View style={styles.headerContainer}>
          <Text style={styles.logoText}>Autenticador MFA</Text>
          <Text style={styles.subtitleText}>
            Ingresa el código temporal de 6 dígitos generado para la cuenta:
          </Text>
          <Text style={styles.emailText}>{email}</Text>
        </View>

        <Input
          label="Código TOTP"
          placeholder="123456"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6} // Evita que el usuario escriba más de 6 números
          editable={!isLoading}
          error={error}
        />

        <Button
          label="Verificar Código"
          onPress={handleVerifySubmit}
          isLoading={isLoading}
          style={styles.buttonSpacer}
        />

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  headerContainer: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  logoText: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitleText: {
    color: COLORS.textMuted,
    fontSize: 15,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  emailText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  buttonSpacer: {
    marginTop: SPACING.md,
  },
});