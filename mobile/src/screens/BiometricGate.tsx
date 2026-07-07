import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import VerifyCode, { VerifyCodeProps } from '../screens/VerifyCode'; // Importa tu pantalla de código maestro

export default function BiometricGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);

  const authenticate = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Desbloquear Bóveda MFA',
      fallbackLabel: 'Usar Código Maestro',
    });

    if (result.success) {
      setIsAuthenticated(true);
    }
  };

  useEffect(() => {
    authenticate();
  }, []);

  // Si ya estamos autenticados, renderizamos el RootNavigator (los hijos)
  if (isAuthenticated) return <>{children}</>;

  // Si elegimos el Código Maestro, mostramos esa pantalla
 if (showManualEntry) {
    return (
      <VerifyCode 
        // Aquí conectamos la lógica real de BiometricGate con los props que espera VerifyCode
        onBack={() => setShowManualEntry(false)} 
        onSuccess={() => setIsAuthenticated(true)} 
        emailFallback="Tu Cuenta MFA" // Opcional
      />
    );
  }

  // Pantalla de bloqueo con opción a biometría o código maestro
  return (
    <View style={styles.container}>
      <Ionicons name={ "shield-lock-outline" as any} size={80} color="#60A5FA" />
      <Text style={styles.title}>Bóveda Bloqueada</Text>
      
      <TouchableOpacity style={styles.btnPrimary} onPress={authenticate}>
        <Text style={styles.btnText}>Intentar Biometría</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnSecondary} onPress={() => setShowManualEntry(true)}>
        <Text style={styles.btnSecondaryText}>Usar Código Maestro</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  title: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginBottom: 40 },
  btnPrimary: { backgroundColor: '#3B82F6', padding: 15, borderRadius: 12, width: '80%', alignItems: 'center', marginBottom: 15 },
  btnSecondary: { padding: 15 },
  btnText: { color: '#FFF', fontWeight: 'bold' },
  btnSecondaryText: { color: '#60A5FA', fontWeight: '600' }
});