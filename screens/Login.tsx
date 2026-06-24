import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import Screen from '../components/Screen';
import Input from '../components/Input';
import Button from '../components/Button';
import { COLORS, FONTS, SPACING } from '../theme';
import { API_URL } from '../server/src/config'; // Usamos la IP/URL de tu entorno

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function Login({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Por favor ingresa correo y contraseña");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v2/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      });
      
      const data = await response.json();

      if (data.status === 'success') {
        if (data.decision === 'CHALLENGE_REQUIRED') {
          // El motor de riesgo detectó que se necesita MFA
          // Pasamos el correo a la siguiente pantalla por parámetros
          navigation.navigate('VerifyCode', { email: email.trim() });
        } else {
          // Riesgo bajo: entra directo
          navigation.navigate('Home');
        }
      } else {
        Alert.alert("Error de acceso", data.message || "Credenciales inválidas");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error de red", "No se pudo conectar con el servidor backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Text style={styles.title}>Iniciar sesión</Text>
      <Text style={styles.subtitle}>Accede a tu bóveda de seguridad</Text>

      <View style={{ height: SPACING.lg }} />

      <Input
        label="Email o teléfono"
        placeholder="tucorreo@ejemplo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
      />

      <View style={{ height: SPACING.md }} />

      <Input
        label="Contraseña"
        placeholder="********"
        secureTextEntry
        autoCapitalize="none"
        value={password}
        onChangeText={setPassword}
        returnKeyType="done"
      />

      <View style={{ height: SPACING.lg }} />

      <Button
        label={loading ? "Verificando..." : "Ingresar"}
        onPress={handleLogin}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  title: { color: COLORS.text, fontFamily: FONTS.bold, fontSize: 24 },
  subtitle: { color: COLORS.muted, fontFamily: FONTS.regular, marginTop: 6 }
});