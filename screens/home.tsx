import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable } from 'react-native';

const PrimaryButton = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable onPress={onPress} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}>
    <Text style={styles.btnText}>{label}</Text>
  </Pressable>
);

export default function Home({ navigation }: any) {
  const [count, setCount] = React.useState<number>(0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>AuthApp (MFA)</Text>
        <Text style={styles.subtitle}>Plantilla base lista ✅</Text>

        <View style={{ height: 16 }} />

        <Text style={styles.paragraph}>
          Contador (state + TypeScript): <Text style={styles.bold}>{count}</Text>
        </Text>
        <PrimaryButton label="Sumar +1" onPress={() => setCount(c => c + 1)} />

        <View style={{ height: 24 }} />
        <Text style={styles.muted}>Siguiente: crear pantallas Login y Verify Code</Text>

        <View style={{ height: 16 }} />
        <PrimaryButton label="Ir a Login" onPress={() => navigation.navigate('Login')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { width: '100%', maxWidth: 420, backgroundColor: '#111827', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1f2937' },
  title: { color: 'white', fontSize: 24, fontWeight: '700' },
  subtitle: { color: '#a3e635', marginTop: 4, fontSize: 14 },
  paragraph: { color: '#e5e7eb', fontSize: 16 },
  bold: { fontWeight: '700' },
  btn: { marginTop: 12, backgroundColor: '#22c55e', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#0b111f', fontWeight: '700' },
  muted: { color: '#9ca3af', fontSize: 13, marginTop: 4 }
});
