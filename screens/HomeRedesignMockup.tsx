// HomeRedesignMockup.tsx
// Ahora con ilustraciones vectoriales "cute" (cartoon) en cada slide del Onboarding

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, FlatList, Dimensions, StatusBar, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONTS } from '../theme';

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
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} style={styles.button}>
        <View style={styles.iconWrap}><Ionicons name={icon} size={22} color={'#fff'} /></View>
        <Text style={styles.buttonText}>{label}</Text>
        <Ionicons name="chevron-forward" size={18} color={'#fff'} style={{ opacity: 0.8 }} />
      </Pressable>
    </Animated.View>
  );
}

const FORCE_HOME = process.env.EXPO_PUBLIC_FORCE_HOME === 'true';

const { width } = Dimensions.get('window');
const SLIDES = [
  {
    key: 's1',
    title: '¡Bienvenido a AuthApp!',
    text: 'Activa tu doble protección de forma fácil y divertida.',
    image: require('../assets/onboarding/security.png'),
  },
  {
    key: 's2',
    title: 'Tu seguridad, primero',
    text: 'Usa códigos TOTP y biometría sin complicaciones.',
    image: require('../assets/onboarding/lock.png'),
  },
  {
    key: 's3',
    title: 'Listo para empezar',
    text: 'Añade cuentas con QR y valida en segundos.',
    image: require('../assets/onboarding/qr.png'),
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
            <Image source={item.image} style={styles.slideImage} resizeMode="contain" />
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

export default function HomeRedesignMockup({ navigation }: any) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [forceOnboarding, setForceOnboarding] = useState(false);

  useEffect(() => {
    if (FORCE_HOME) {
      AsyncStorage.setItem('onboarding_seen', 'true');
      return;
    }
    (async () => {
      const seen = await AsyncStorage.getItem('onboarding_seen');
      if (seen !== 'true') setShowOnboarding(true);
    })();
  }, []);

  const handleDoneOnboarding = async () => {
    await AsyncStorage.setItem('onboarding_seen', 'true');
    setShowOnboarding(false);
    setForceOnboarding(false);
  };

  if (showOnboarding || forceOnboarding) {
    return <Onboarding onDone={handleDoneOnboarding} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Protección fácil y divertida</Text>
        <Text style={styles.heroSubtitle}>Activa MFA en segundos y mantén tus cuentas seguras.</Text>
        <View style={styles.heroBadges}>
          <View style={styles.badge}><Ionicons name="finger-print" size={16} color={COLORS.text} /><Text style={styles.badgeTxt}>Biometría</Text></View>
          <View style={styles.badge}><Ionicons name="time" size={16} color={COLORS.text} /><Text style={styles.badgeTxt}>TOTP</Text></View>
          <View style={styles.badge}><Ionicons name="qr-code" size={16} color={COLORS.text} /><Text style={styles.badgeTxt}>QR</Text></View>
        </View>
      </View>
      <View style={styles.actions}>
        <IconBubbleButton icon="log-in" label="Iniciar sesión" onPress={() => navigation?.navigate?.('Email')} />
        <IconBubbleButton icon="shield-checkmark" label="Abrir Authenticator" onPress={() => navigation?.navigate?.('Authenticator')} />
        <IconBubbleButton icon="information-circle" label="Acerca de" onPress={() => navigation?.navigate?.('About')} />
        <IconBubbleButton icon="book" label="Ver Onboarding" onPress={() => setForceOnboarding(true)} />
      </View>
      <Text style={styles.footerNote}>Hecho con ❤️ para tu seguridad</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: SPACING.lg, paddingTop: 18 + (StatusBar.currentHeight || 0) },
  header: { color: COLORS.text, fontSize: 18, fontFamily: FONTS?.semibold || 'System', marginBottom: SPACING.md },
  heroCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.xl, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.xl },
  heroTitle: { color: COLORS.text, fontSize: 20, fontFamily: FONTS?.bold || 'System' },
  heroSubtitle: { color: COLORS.muted, fontSize: 14, marginTop: 6 },
  heroBadges: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0b111f', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 30 },
  badgeTxt: { color: COLORS.text, fontSize: 12 },
  actions: { gap: SPACING.md },
  button: { backgroundColor: COLORS.primary, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#3a8af0' },
  iconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  buttonText: { flex: 1, color: '#fff', fontSize: 16, fontFamily: FONTS?.semibold || 'System' },
  footerNote: { textAlign: 'center', color: COLORS.muted, marginTop: SPACING.xl, fontSize: 12 },
  onboardingWrap: { flex: 1, backgroundColor: COLORS.bg, paddingTop: 18 + (StatusBar.currentHeight || 0) },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl },
  slideImage: { width: '80%', height: 220, marginBottom: 24 },
  slideTitle: { color: COLORS.text, fontSize: 22, fontFamily: FONTS?.bold || 'System', textAlign: 'center' },
  slideText: { color: COLORS.muted, fontSize: 14, textAlign: 'center', marginTop: 8 },
  dotsRow: { flexDirection: 'row', alignSelf: 'center', gap: 8, marginBottom: 12 },
  dot: { height: 8, borderRadius: 4, backgroundColor: '#fff' },
  primaryCta: { alignSelf: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 16, marginBottom: 22 },
  primaryCtaText: { color: '#fff', fontSize: 16, fontFamily: FONTS?.semibold || 'System' },
});
