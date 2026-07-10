import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  TouchableOpacity
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../theme';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { RootStackScreenProps } from '../navigation/types';

type Props = RootStackScreenProps<'VerifyCode'>;

export default function VerifyCode({ route, navigation }: Props) {
  const { email } = route.params;
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estado para saber si el teléfono soporta huella/reconocimiento facial
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  // 1. Ahora el useEffect SOLO verifica si hay hardware, NO lanza el prompt
  useEffect(() => {
    const checkBiometricSupport = async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricAvailable(hasHardware && isEnrolled);
    };
    
    checkBiometricSupport();
  }, []);

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verifica tu identidad',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: true, // Queremos que use biometría pura aquí
      });

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleVerifySubmit = () => {
    setError('');
    
    if (code.length !== 6) {
      setError('El código debe tener exactamente 6 dígitos.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
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
            Elige tu método de verificación para la cuenta:
          </Text>
          <Text style={styles.emailText}>{email}</Text>
        </View>

        {/* --- OPCIÓN: CÓDIGO MANUAL --- */}
        <Input
          label="Código TOTP"
          placeholder="123456"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
          editable={!isLoading}
          error={error}
        />

        <Button
          label="Verificar Código"
          onPress={handleVerifySubmit}
          isLoading={isLoading}
          style={styles.buttonSpacer}
        />

          



        {/* --- OPCIÓN: BOTÓN DE BIOMETRÍA --- */}
        {/* Solo se renderiza si el teléfono tiene un lector de huellas configurado */}
        {isBiometricAvailable && (
          <View style={styles.biometricSection}>
            <Text style={styles.dividerText}>--- O VERIFICAR CON ---</Text>

            <TouchableOpacity 
              style={styles.biometricButton} 
              onPress={handleBiometricAuth}
              activeOpacity={0.7}
            >
              <Ionicons name="finger-print" size={50} color="#60A5FA" />
              <Text style={styles.biometricText}>Huella Digital</Text>
            </TouchableOpacity>
          </View>
        )}

        
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
    marginTop: SPACING.xs,
  },
  
  // --- Estilos nuevos para la sección de Biometría ---
  biometricSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  biometricButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  biometricText: {
    color: '#60A5FA',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: SPACING.sm,
  },
  dividerText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
});