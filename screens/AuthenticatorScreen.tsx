// src/screens/AuthenticatorScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CircularTimer from "../components/CircularTimer";
import { TotpAccount, genTotp, remainingSeconds } from "../server/src/utils/totp";

const STORAGE_KEY = "totp_accounts";

export default function AuthenticatorScreen({ navigation }: any) {
  const [accounts, setAccounts] = useState<TotpAccount[]>([]);
  const [nowRem, setNowRem] = useState<number>(remainingSeconds(30));
const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cargar cuentas
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setAccounts(JSON.parse(raw));
    })();
  }, []);

  // Timer 1s
  useEffect(() => {
  tickRef.current = setInterval(() => {
    setNowRem(r => {
      const next = r - 1;
      return next <= 0 ? 30 : next;
    });
  }, 1000);

  return () => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };
}, []);

  const renderItem = ({ item }: { item: TotpAccount }) => {
    const period = item.period ?? 30;
    const rem = remainingSeconds(period);
    const code = genTotp(item); // se recalcula cada render/segundo
    const codeSpaced = code.replace(/(\d{3})(\d{3})/, "$1 $2");

    return (
      <View style={styles.card}>
        <View>
          <Text style={styles.issuer}>{item.issuer || item.label}</Text>
          {item.issuer && item.label && item.issuer !== item.label && (
            <Text style={styles.label}>{item.label}</Text>
          )}
          <Text style={styles.code}>{codeSpaced}</Text>
        </View>
        <CircularTimer period={period} remaining={rem} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={accounts}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ color: "#9CA3AF", textAlign: "center", marginTop: 32 }}>
            Aún no tienes cuentas TOTP. Toca “+” para escanear un QR.
          </Text>
        }
        contentContainerStyle={{ padding: 16, gap: 12 }}
      />

      {/* FAB */}
      <Pressable
        onPress={() => navigation.navigate("AddToken")}
        style={({ pressed }) => [
          styles.fab,
          pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
        ]}
      >
        <Text style={{ color: "#0b111f", fontSize: 24, fontWeight: "900" }}>＋</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  issuer: { color: "#F3F4F6", fontSize: 16, fontWeight: "700" },
  label: { color: "#9CA3AF", marginTop: 2 },
  code: { color: "#60A5FA", fontSize: 28, fontWeight: "800", marginTop: 6, letterSpacing: 2 },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
});
