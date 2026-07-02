// src/screens/Login.tsx
import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  View 
} from 'react-native';
import { COLORS, SPACING } from '../theme';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
// 1. Importamos el helper de tipado estricto para esta pantalla
import { RootStackScreenProps } from '../navigation/types';
import { loginRequest } from '../api/auth';

// 2. Le decimos a TypeScript: "Esta pantalla pertenece al Login y heredará sus propiedades"
type Props = RootStackScreenProps<'Login'>;

export default function Login({ navigation }: Props) {
  // Estados para controlar el formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

 // Reemplaza tu función handleLoginSubmit actual con esta:
  const handleLoginSubmit = async () => {
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setIsLoading(true);

    try {
      // Disparamos la petición real al backend en Fastify
      const data = await loginRequest(email, password);

      // Evaluamos la decisión del motor de riesgo del backend
      if (data.decision === 'CHALLENGE_REQUIRED') {
        // Redirigimos a la pantalla de verificación enviando el email como parámetro
        navigation.reset({
          index: 0,
          routes: [{ name: 'VerifyCode', params: { email } }],
        });
      } else {
        // Si no pide MFA (ALLOW_DIRECT), lo mandamos directo al Home
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas o error de red');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        
        <View style={styles.headerContainer}>
          <Text style={styles.logoText}>MFA Security</Text>
          <Text style={styles.subtitleText}>Ingresa tus credenciales de acceso</Text>
        </View>

        {/* Formulario usando nuestros componentes reutilizables */}
        <Input
          label="Correo electrónico"
          placeholder="nombre@correo.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
        />

        <Input
          label="Contraseña"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          autoCapitalize="none"
          editable={!isLoading}
          error={error} // Inyecta el error dinámico si existe
        />

        <Button
          label="Iniciar Sesión"
          onPress={handleLoginSubmit}
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
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  subtitleText: {
    color: COLORS.textMuted,
    fontSize: 15,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  buttonSpacer: {
    marginTop: SPACING.md,
  },
});