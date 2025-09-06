// src/screens/ScanScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Animated, Easing, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { BarcodeType } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { parseOtpauthUri } from '../server/src/utils/totp';
import { useTotp } from '../server/src/state/TotpStore';
import { COLORS, SPACING, RADIUS, FONTS } from '../theme';

// 1) IMPORTA CommonActions
import { CommonActions } from '@react-navigation/native';


// Color para acciones destructivas si aún no existe en tu theme
const DESTRUCTIVE = '#ef4444'; // rojo 500

type ExistingLike = { issuer?: string | null; label: string };

// Componente separado para manejar safe-area y zIndex del botón inferior
function BottomCancel({ onPress, disabled }: { onPress: () => void; disabled?: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bottomBar, { bottom: 16 + insets.bottom }]}> 
      <Pressable
        style={styles.cancelBtn}
        android_ripple={{ color: '#0b111f' }}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={styles.cancelBtnText}>Cancelar</Text>
      </Pressable>
    </View>
  );
}

export default function ScanScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedOnce, setScannedOnce] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [existingName, setExistingName] = useState<string>('');
  const pendingResolve = useRef<((v: 'skip' | 'replace') => void) | null>(null);
  const focusAnim = useRef(new Animated.Value(0)).current; // para la línea de escaneo

  const { addAccount } = useTotp();

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  // Animación de la línea de escaneo (sube y baja dentro del marco)
  useEffect(() => {
    if (!isProcessing) return; // solo animar durante el "enfoque"
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(focusAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(focusAnim, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isProcessing]);

  const onResolve = useCallback((choice: 'skip' | 'replace') => {
    if (pendingResolve.current) {
      pendingResolve.current(choice);
      pendingResolve.current = null;
    }
    setShowDialog(false);
  }, []);

  const handleExisting = useCallback((existing: ExistingLike) => {
    return new Promise<'skip' | 'replace'>((resolve) => {
      const name = `${existing.issuer || 'SinIssuer'} - ${existing.label}`;
      setExistingName(name);
      pendingResolve.current = resolve;
      setShowDialog(true);
    });
  }, []);

  const focusDelay = 900; // ms de "enfoque" antes de parsear

  const handleScanned = useCallback(
    async (content: string) => {
      if (scannedOnce || isProcessing) return; // debouncer simple
      setScannedOnce(true);
      setIsProcessing(true);

      try {
        // Efecto de enfoque/buffer para que el usuario perciba que "apunta" al QR
        await new Promise((r) => setTimeout(r, focusDelay));

        const parsed = parseOtpauthUri(content);
        if (!parsed) throw new Error('El código QR no es válido (otpauth://totp requerido).');

        await addAccount(parsed, handleExisting);

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Deja el stack EXACTAMENTE en: Home -> Authenticator
navigation.dispatch(
  CommonActions.reset({
    index: 1,
    routes: [{ name: 'Home' }, { name: 'Authenticator' }],
  })
);
      } catch (e: any) {
        // Si falla, permitimos reintentar manteniendo la cámara abierta
        setScannedOnce(false);
        // Podrías mostrar aquí un toast/snackbar si tienes uno global
      } finally {
        setIsProcessing(false);
      }
    },
    [scannedOnce, isProcessing, addAccount, navigation]
  );

  const frameSize = 260;
  const translateY = focusAnim.interpolate({ inputRange: [0, 1], outputRange: [0, frameSize - 4] });

  // TIPOS CORRECTOS PARA EXPO-CAMERA
  const barcodeSettings = useMemo(() => ({
    barcodeTypes: ['qr'] as unknown as BarcodeType[],
  }), []);

  if (!permission?.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.text}>Necesitamos permiso de cámara para escanear QR</Text>
        <Pressable style={styles.primaryBtn} android_ripple={{ color: '#111827' }} onPress={requestPermission}>
          <Text style={styles.primaryBtnText}>Conceder permiso</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Cámara */}
      <View style={StyleSheet.absoluteFill}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={barcodeSettings}
          onBarcodeScanned={({ data }) => handleScanned(String(data))}
        />
      </View>

      {/* Overlay oscurecido con marco guía */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.overlayContainer]}> 
        {/* top */}
        <View style={[styles.mask, { height: '25%' }]} />
        {/* middle row */}
        <View style={{ flexDirection: 'row', height: '50%' }}>
          <View style={[styles.mask, { width: '10%' }]} />
          {/* Marco */}
          <View style={[styles.frameBox, { width: frameSize, height: frameSize }]}>
            {/* Esquinas decorativas */}
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
            {/* Línea de escaneo */}
            {isProcessing && (
              <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
            )}
          </View>
          <View style={[styles.mask, { width: '10%' }]} />
        </View>
        {/* bottom */}
        <View style={[styles.mask, { height: '25%' }]} />
      </View>

      {/* Barra inferior con botón Cancelar */}
      <BottomCancel onPress={() => navigation?.goBack?.()} disabled={isProcessing} />

      {/* Diálogo personalizado para duplicados */}
      <Modal visible={showDialog} animationType="fade" transparent onRequestClose={() => onResolve('skip')}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cuenta ya existente</Text>
            <Text style={styles.modalDesc}>Ya tienes "{existingName}". ¿Deseas reemplazarla?</Text>
            <View style={styles.modalActions}>
              <Pressable onPress={() => onResolve('skip')} style={[styles.dialogBtn, styles.dialogBtnCancel, { backgroundColor: COLORS.primary }]}> 
                <Text style={styles.dialogBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable onPress={() => onResolve('replace')} style={[styles.dialogBtn, { backgroundColor: DESTRUCTIVE }]}> 
                <Text style={styles.dialogBtnText}>Reemplazar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );


}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg, backgroundColor: COLORS.bg },
  text: { color: COLORS.text, fontFamily: FONTS.regular, fontSize: 16, textAlign: 'center', marginBottom: SPACING.lg },

  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  primaryBtnText: { color: COLORS.primary, fontFamily: FONTS.semibold, fontSize: 16 },

  overlayContainer: { zIndex: 4, elevation: 4 },

  // Overlay
  mask: { backgroundColor: 'rgba(0,0,0,0.55)', flex: 1, elevation: 3 },
  frameBox: {
    alignSelf: 'center',
    borderColor: COLORS.primary,
    borderWidth: 2,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    justifyContent: 'flex-start',
    elevation: 4,
  },
  corner: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderColor: COLORS.primary,
  },
  tl: { top: 0, left: 0, borderLeftWidth: 4, borderTopWidth: 4, borderTopLeftRadius: RADIUS.sm },
  tr: { top: 0, right: 0, borderRightWidth: 4, borderTopWidth: 4, borderTopRightRadius: RADIUS.sm },
  bl: { bottom: 0, left: 0, borderLeftWidth: 4, borderBottomWidth: 4, borderBottomLeftRadius: RADIUS.sm },
  br: { bottom: 0, right: 0, borderRightWidth: 4, borderBottomWidth: 4, borderBottomRightRadius: RADIUS.sm },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: COLORS.primary,
    opacity: 0.9,
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5, // por encima de la cámara y overlays
  },
  cancelBtn: {
    backgroundColor: '#2F80ED', // Forzado a azul para descartar temas del sistema
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    elevation: 3,
  },
  cancelBtnText: { color: COLORS.primary, fontFamily: FONTS.semibold, fontSize: 16 },

  // Modal dialog
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '86%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: { color: COLORS.text, fontFamily: FONTS.bold, fontSize: 18, marginBottom: SPACING.sm },
  modalDesc: { color: COLORS.muted, fontFamily: FONTS.regular, fontSize: 14, marginBottom: SPACING.lg },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  dialogBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  dialogBtnCancel: { marginRight: SPACING.md },
  dialogBtnText: { color: COLORS.primary, fontFamily: FONTS.semibold, fontSize: 15 },
});
