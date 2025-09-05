// src/screens/AboutScreen.tsx
import React from "react";
import { View, Text, StyleSheet, Image, Pressable, Linking } from "react-native";
import Constants from "expo-constants";

export default function AboutScreen() {
  const version = Constants?.expoConfig?.version ?? "1.0.0";

  const openMail = () => Linking.openURL("mailto:ljcm47@gmail.com");
  const openGitHub = () => Linking.openURL("https://github.com/nicktiel");

  return (
    <View style={styles.container}>

      <View style={{ alignItems: "center", marginTop: 12 }}>
        <Image
          source={require("../assets/profile.jpg")} // 👉 pon tu foto en /assets/profile.jpg
          style={styles.avatar}
        />
        <Text style={styles.appName}>AuthApp</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Desarrollador</Text>

        <Text style={styles.item}>
          <Text style={styles.bold}>Nombre: </Text>
          Luis Jesus Curbata
        </Text>
        <Text style={styles.item}>
          <Text style={styles.bold}>Experiencia: </Text>
          Estudiante Master Full Stack
        </Text>
        <Text style={styles.item}>
          <Text style={styles.bold}>Ubicación: </Text>
          Barcelona, Anzoátegui
        </Text>

        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Contacto</Text>

        <Pressable onPress={openMail} style={styles.linkRow}>
          <Text style={styles.linkEmoji}>✉️</Text>
          <Text style={styles.linkText}>ljcm47@gmail.com</Text>
        </Pressable>

        <Pressable onPress={openGitHub} style={styles.linkRow}>
          <Text style={styles.linkEmoji}>🐙</Text>
          <Text style={styles.linkText}>github.com/nicktiel</Text>
        </Pressable>
      </View>

      <Text style={styles.version}>Versión {version}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", paddingHorizontal: 16, paddingTop: 16 },
  title: { color: "#e5e7eb", fontSize: 20, fontWeight: "700" },
  avatar: { width: 120, height: 120, borderRadius: 60, marginTop: 12, marginBottom: 8 },
  appName: { color: "#fff", fontSize: 22, fontWeight: "800" },
  card: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  sectionTitle: { color: "#60a5fa", fontWeight: "800", marginBottom: 8, fontSize: 16 },
  item: { color: "#e5e7eb", marginTop: 4 },
  bold: { fontWeight: "700" },
  linkRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  linkEmoji: { fontSize: 16, marginRight: 8 },
  linkText: { color: "#93c5fd", textDecorationLine: "underline" },
  version: { color: "#9CA3AF", textAlign: "center", marginTop: 16 },
});
