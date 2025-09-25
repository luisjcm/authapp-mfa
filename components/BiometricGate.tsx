import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator, AppState } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import DemoBiometricModal from './DemoBiometricModal';
import { COLORS } from '../theme';

type Props = {
  children: React.ReactNode;
  prompt?: string;
  demoMode?: boolean;          // 👈 activa el modal simulado
};

export default function BiometricGate({ children, prompt = 'Confirma tu identidad', demoMode = false }: Props) {
  const [checking, setChecking] = useState(true);
  const [granted, setGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemo, setShowDemo] = useState(false);

  const runCheckReal = useCallback(async () => {
    setChecking(true);
    setError(null);
    try {
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: prompt,
        disableDeviceFallback: false,
        cancelLabel: 'Cancelar',
        requireConfirmation: false,
      });
      setGranted(res.success);
      if (!res.success) setError(res.warning ?? 'Autenticación cancelada o fallida');
    } catch (e) {
      setError('No se pudo iniciar la autenticación');
      setGranted(false);
    } finally {
      setChecking(false);
    }
  }, [prompt]);

  const runCheckDemo = useCallback(async () => {
    // Simula el “chequeo” inicial y abre el modal
    setChecking(false);
    setGranted(false);
    setShowDemo(true);
  }, []);

  const runCheck = useCallback(() => {
    if (demoMode) return runCheckDemo();
    return runCheckReal();
  }, [demoMode, runCheckDemo, runCheckReal]);

  useEffect(() => { runCheck(); }, [runCheck]);

  // Re-bloqueo al volver a primer plano (en demo y real)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setGranted(false);
        demoMode ? runCheckDemo() : runCheckReal();
      }
    });
    return () => sub.remove();
  }, [demoMode, runCheckDemo, runCheckReal]);

  if (checking) {
    return (
      <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:24 }}>
        <ActivityIndicator />
        <Text style={{ marginTop:12 }}>Verificando…</Text>
      </View>
    );
  }

  if (!granted) {
    return (
      <>
        {/* Pantalla fallback por si cierran el modal o falla la auth */}
        <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:24, gap:12 }}>
          <Text style={{ fontSize:16, textAlign:'center', color: COLORS.text }}>
            {error ?? (demoMode ? 'Activa la validación de demo para continuar.' : 'Necesitas confirmar tu identidad para continuar.')}
          </Text>
          <Pressable
            onPress={runCheck}
            style={{ paddingHorizontal:16, paddingVertical:10, borderRadius:10, backgroundColor:COLORS.primary }}>
            <Text style={{ color:'#fff' }}>Reintentar</Text>
          </Pressable>
        </View>

        {/* Modal DEMO */}
        {demoMode && (
          <DemoBiometricModal
            visible={showDemo}
            title="Biometría / Patrón"
            onSuccess={() => {
              setShowDemo(false);
              setGranted(true);
              setError(null);
            }}
            onCancel={() => {
              setShowDemo(false);
              setGranted(false);
              setError('Autenticación cancelada');
            }}
          />
        )}
      </>
    );
  }

  return <>{children}</>;
}