// src/components/DemoBiometricModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, Pressable, Animated, Easing, Platform, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, RADIUS, SPACING, FONTS } from '../theme';
import { Fingerprint, ScanFace } from 'lucide-react-native';

type Props = {
  visible: boolean;
  onSuccess: () => void;
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
};

export default function DemoBiometricModal({
  visible,
  onSuccess,
  onCancel,
  title = Platform.OS === 'ios' ? 'Face ID' : 'Huella dactilar',
  subtitle = 'Confirma tu identidad para continuar',
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [validating, setValidating] = useState(false);
  const [ok, setOk] = useState(false);

  // Colores de feedback
  const SUCCESS = (COLORS as any).success ?? '#22c55e';
  const SUCCESS_MUTED = 'rgba(34,197,94,0.15)';

  // Animación de pulso base
  useEffect(() => {
    if (!visible) return;
    // reset estado visual
    setOk(false);
    setValidating(false);

    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.08, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.0, duration: 700, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ])
    ).start();

    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();

    return () => {
      scale.stopAnimation();
      opacity.setValue(0);
      setValidating(false);
      setOk(false);
    };
  }, [visible]);

  const handleValidate = async () => {
    if (validating) return;
    setValidating(true);

    // Haptic + cambio de color inmediato
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setOk(true);

    // Mini "pop" de confirmación
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.15, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1.0, friction: 5, tension: 100, useNativeDriver: true }),
    ]).start();

    // Haptic de éxito + callback
    setTimeout(async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSuccess?.();
    }, 480);
  };

  const handleCancel = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCancel?.();
  };

  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, { opacity }]}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <Animated.View
            style={[
              styles.scanner,
              {
                transform: [{ scale }],
                backgroundColor: ok ? SUCCESS_MUTED : COLORS.primary,
                borderColor: ok ? SUCCESS : COLORS.border,
                borderWidth: ok ? 1.2 : 1,
              },
            ]}
          >
            {Platform.OS === 'ios' ? (
              <ScanFace size={60} color={ok ? SUCCESS : COLORS.primary} strokeWidth={1.8} />
            ) : (
              <Fingerprint size={60} color={ok ? SUCCESS : COLORS.primary} strokeWidth={1.8} />
            )}
          </Animated.View>

          <View style={styles.actions}>
            <Pressable style={[styles.btn, styles.btnGhost]} onPress={handleCancel} disabled={validating}>
              <Text style={[styles.btnText, styles.btnGhostText]}>Cancelar</Text>
            </Pressable>

            <Pressable
              style={[
                styles.btn,
                styles.btnPrimary,
                validating && styles.btnDisabled,
                ok && { backgroundColor: SUCCESS },
              ]}
              onPress={handleValidate}
              disabled={validating}
            >
              <Text style={styles.btnText}>{validating ? 'Validando…' : (Platform.OS === 'ios' ? 'Usar Face ID' : 'Usar huella')}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4,8,15,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    color: COLORS.text,
    fontFamily: FONTS.semibold,
    fontSize: 18,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.muted,
    fontFamily: FONTS.regular,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
  },
  scanner: {
    width: 120,
    height: 120,
    borderRadius: 100,
    alignSelf: 'center',
    marginVertical: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
  },
  btnGhost: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
  },
  btnText: {
    color: COLORS.text,
    fontFamily: FONTS.semibold,
    fontSize: 15,
  },
  btnGhostText: {
    color: COLORS.muted,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
