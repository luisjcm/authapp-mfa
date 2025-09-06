// HomeRedesignMockup.tsx
// Mockup completo de Home rediseñada + Onboarding (solo primera vez)
// - Mantiene paleta COLORS del theme.ts
// - Botones con ícono y efecto bounce
// - Tarjeta central estilo "comiquita"
// - Onboarding simple con 3 pantallas y AsyncStorage

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Animated, FlatList, Dimensions, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
// Si usas expo-linear-gradient: import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, FONTS } from '../theme';

// ------------- Utilidad: Botón con icono + animación -------------
function IconBubbleButton({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 20, bounciness: 8 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }).start(() => onPress());
  };

  return (
    <Animated.View style={{ transform: [{ scale }], width: '100%' }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.button,
          pressed && { opacity: 0.95 },
        ]}
      >
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={22} color={'#fff'} />
        </View>
        <Text style={styles.buttonText}>{label}</Text>
        <Ionicons name="chevron-forward" size={18} color={'#fff'} style={{ opacity: 0.8 }} />
      </Pressable>
    </Animated.View>
  );
}

// ------------- Pantalla: Onboarding (solo primera vez) -------------
const { width } = Dimensions.get('window');

const SLIDES = [
  {
    key: 's1',
    title: '¡Bienvenido a AuthApp!',
    text: 'Activa tu doble protección de forma fácil y divertida.',
    emoji: '🛡️',
  },
  {
    key: 's2',
    title: 'Tu seguridad, primero',
    text: 'Usa códigos TOTP y biometría sin complicaciones.',
    emoji: '🔐',
  },
  {
    key: 's3',
    title: 'Listo para empezar',
    text: 'Añade cuentas con QR y valida en segundos.',
    emoji: '⚡',
  },
];

function Onboarding({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const renderDot = (i: number) => {
    const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
    const dotWidth = scrollX.interpolate({ inputRange, outputRange: [8, 20, 8], extrapolate: 'clamp' });
    const opacity = scrollX.interpolate({ inputRange, outputRange: [0.4, 1, 0.4], extrapolate: 'clamp' });
    return <Animated.View key={i} style={[styles.dot, { width: dotWidth, opacity }]} />;
  };

  return (
    <View style={styles.onboardingWrap}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(i);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}> 
            <View style={styles.emojiCircle}><Text style={styles.emoji}>{item.emoji}</Text></View>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideText}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.dotsRow}>{SLIDES.map((_, i) => renderDot(i))}</View>

      <Pressable onPress={onDone} style={styles.primaryCta}>
        <Text style={styles.primaryCtaText}>{index < SLIDES.length - 1 ? 'Saltar' : '¡Empezar!'}</Text>
      </Pressable>
    </View>
  );
}

// ------------- Pantalla: Home rediseñada -------------
export default function HomeRedesignMockup({ navigation }: any) {
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    (async () => {
      const seen = await AsyncStorage.getItem('onboarding_seen');
      if (seen === 'true') setShowOnboarding(false);
    })();
  }, []);

  const handleDoneOnboarding = async () => {
    await AsyncStorage.setItem('onboarding_seen', 'true');
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return <Onboarding onDone={handleDoneOnboarding} />;
  }

  return (
    <View style={styles.container}>
      {/* Header mini */}
      <Text style={styles.header}>AuthApp (MFA)</Text>

      {/* Tarjeta central */}
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Protección fácil y divertida</Text>
        <Text style={styles.heroSubtitle}>Activa MFA en segundos y mantén tus cuentas seguras.</Text>
        <View style={{ height: 16 }} />
        <View style={styles.heroBadges}>
          <View style={styles.badge}><Ionicons name="finger-print" size={16} color={COLORS.primary} /><Text style={styles.badgeTxt}>Biometría</Text></View>
          <View style={styles.badge}><Ionicons name="time" size={16} color={COLORS.primary} /><Text style={styles.badgeTxt}>TOTP</Text></View>
          <View style={styles.badge}><Ionicons name="qr-code" size={16} color={COLORS.primary} /><Text style={styles.badgeTxt}>QR</Text></View>
        </View>
      </View>

      {/* Acciones principales */}
      <View style={styles.actions}>
        <IconBubbleButton icon="log-in" label="Iniciar sesión" onPress={() => navigation?.navigate?.('Email') } />
        <IconBubbleButton icon="shield-checkmark" label="Abrir Authenticator" onPress={() => navigation?.navigate?.('Authenticator') } />
        <IconBubbleButton icon="information-circle" label="Acerca de" onPress={() => navigation?.navigate?.('About') } />
      </View>

      {/* Footer simpático */}
      <Text style={styles.footerNote}>Hecho con ❤️ para tu seguridad</Text>
    </View>
  );
}

// ------------- Estilos -------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: SPACING.lg,
    paddingTop: 18 + (StatusBar.currentHeight || 0),
  },
  header: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily: FONTS?.semibold || 'System',
    marginBottom: SPACING.md,
  },
  heroCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontFamily: FONTS?.bold || 'System',
  },
  heroSubtitle: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 6,
  },
  heroBadges: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0b111f', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 30 },
  badgeTxt: { color: COLORS.primary, fontSize: 12 },

  actions: { marginTop: SPACING.xl, gap: SPACING.md },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#3a8af0',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  buttonText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS?.semibold || 'System',
  },
  footerNote: {
    textAlign: 'center',
    color: COLORS.muted,
    marginTop: SPACING.xl,
    fontSize: 12,
  },

  // Onboarding
  onboardingWrap: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: 18 + (StatusBar.currentHeight || 0),
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emojiCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  emoji: { fontSize: 60 },
  slideTitle: { color: COLORS.text, fontSize: 22, fontFamily: FONTS?.bold || 'System', textAlign: 'center' },
  slideText: { color: COLORS.muted, fontSize: 14, textAlign: 'center', marginTop: 8 },
  dotsRow: { flexDirection: 'row', alignSelf: 'center', gap: 8, marginBottom: 12 },
  dot: { height: 8, borderRadius: 4, backgroundColor: '#fff' },
  primaryCta: { alignSelf: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 16, marginBottom: 22 },
  primaryCtaText: { color: '#fff', fontSize: 16, fontFamily: FONTS?.semibold || 'System' },
});

// --------- Notas de integración ---------
// 1) Sustituye tu pantalla Home por HomeRedesignMockup y ajusta los nombres de rutas: 'Email', 'Authenticator', 'About'.
// 2) Asegúrate de tener Ionicons:  npx expo install @expo/vector-icons
// 3) Ya usas theme.ts; se respetan COLORS/SPACING/RADIUS/FONTS.
// 4) Si quieres un degradado en la tarjeta, usa expo-linear-gradient y reemplaza heroCard por un contenedor LinearGradient.
