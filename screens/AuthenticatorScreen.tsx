// src/screens/AuthenticatorScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Swipeable } from "react-native-gesture-handler";
import CircularTimer from "../components/CircularTimer";
import {
  TotpAccount,
  genTotp,
  remainingSeconds,
} from "../server/src/utils/totp";

const STORAGE_KEY = "totp_accounts";

export default function AuthenticatorScreen({ navigation }: any) {
  const [accounts, setAccounts] = useState<TotpAccount[]>([]);
  const [nowRem, setNowRem] = useState<number>(remainingSeconds(30));
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ===== Helpers persistencia / claves de duplicado =====
  async function persist(next: TotpAccount[]) {
    setAccounts(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  const makeKey = (a: { issuer?: string; label: string }) =>
    `${(a.issuer || "SinIssuer").toLowerCase()}::${a.label.toLowerCase()}`;

  // ===== Cargar cuentas (y limpiar duplicados existentes una vez) =====
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const arr: TotpAccount[] = JSON.parse(raw);
      const seen = new Set<string>();
      const cleaned: TotpAccount[] = [];
      for (const a of arr) {
        const key = makeKey(a);
        if (!seen.has(key)) {
          seen.add(key);
          cleaned.push(a);
        }
      }
      if (cleaned.length !== arr.length) {
        await persist(cleaned);
      } else {
        setAccounts(arr);
      }
    })();
  }, []);

  // ===== Timer 1s para refrescar códigos/anillos =====
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setNowRem((r) => {
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

  // ===== Eliminar con confirmación =====
  function confirmDelete(id: string) {
    Alert.alert(
      "Eliminar cuenta",
      "¿Seguro que deseas eliminar esta cuenta TOTP?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const next = accounts.filter((a) => a.id !== id);
            await persist(next);
          },
        },
      ]
    );
  }

  // ===== Edición con modal simple =====
  const [editing, setEditing] = useState<TotpAccount | null>(null);
  const [editIssuer, setEditIssuer] = useState("");
  const [editLabel, setEditLabel] = useState("");

  function openEdit(acc: TotpAccount) {
    setEditing(acc);
    setEditIssuer(acc.issuer || "");
    setEditLabel(acc.label);
  }

  async function submitEdit() {
    if (!editing) return;
    const patch = {
      issuer: editIssuer.trim() || undefined,
      label: editLabel.trim(),
    };

    // prevenir duplicados por issuer+label
    const dup = accounts.find(
      (a) => a.id !== editing.id && makeKey(a) === makeKey(patch)
    );
    if (dup) {
      Alert.alert(
        "Duplicado",
        "Ya existe una cuenta con el mismo issuer/label."
      );
      return;
    }

    const next = accounts.map((a) =>
      a.id === editing.id ? { ...a, ...patch } : a
    );
    await persist(next);
    setEditing(null);
  }

  // ===== Item de la lista con Swipeable + long-press =====
  const renderItem = ({ item }: { item: TotpAccount }) => {
    const period = item.period ?? 30;
    const rem = remainingSeconds(period);
    const code = genTotp(item); // se recalcula cada render/segundo
    const codeSpaced = code.replace(/(\d{3})(\d{3})/, "$1 $2");

    const RightActions = () => (
      <Pressable onPress={() => confirmDelete(item.id)} style={styles.deleteBtn}>
        <Text style={styles.deleteTxt}>Eliminar</Text>
      </Pressable>
    );

    return (
      <Swipeable renderRightActions={RightActions}>
        <Pressable onLongPress={() => openEdit(item)} style={styles.card}>
          <View>
            <Text style={styles.issuer}>{item.issuer || item.label}</Text>
            {item.issuer && item.label && item.issuer !== item.label && (
              <Text style={styles.label}>{item.label}</Text>
            )}
            <Text style={styles.code}>{codeSpaced}</Text>
          </View>
          <CircularTimer period={period} remaining={rem} />
        </Pressable>
      </Swipeable>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={accounts}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>
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
        <Text style={styles.fabPlus}>＋</Text>
      </Pressable>

      {/* Modal edición (overlay sencillo sin libs) */}
      {editing && (
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar cuenta</Text>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Issuer (opcional)</Text>
              <TextInput
                value={editIssuer}
                onChangeText={setEditIssuer}
                placeholder="Issuer"
                placeholderTextColor="#6b7280"
                style={styles.input}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Label</Text>
              <TextInput
                value={editLabel}
                onChangeText={setEditLabel}
                placeholder="Label"
                placeholderTextColor="#6b7280"
                style={styles.input}
              />
            </View>

            <View style={styles.modalRow}>
              <Pressable
                onPress={() => setEditing(null)}
                style={styles.btnSecondary}
              >
                <Text>Cancelar</Text>
              </Pressable>
              <Pressable onPress={submitEdit} style={styles.btnPrimary}>
                <Text style={{ color: "#fff" }}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  empty: { color: "#9CA3AF", textAlign: "center", marginTop: 32 },
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
  code: {
    color: "#60A5FA",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 6,
    letterSpacing: 2,
  },
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
  fabPlus: { color: "#0b111f", fontSize: 24, fontWeight: "900" },
  deleteBtn: {
    backgroundColor: "#c62828",
    justifyContent: "center",
    alignItems: "center",
    width: 96,
    borderRadius: 12,
    marginVertical: 6,
  },
  deleteTxt: { color: "#fff", fontWeight: "700" },
  modalWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: { backgroundColor: "#111827", borderRadius: 16, padding: 16 },
  modalTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 8 },
  inputWrap: { backgroundColor: "#1f2937", borderRadius: 10, marginTop: 8 },
  inputLabel: {
    color: "#9CA3AF",
    fontSize: 12,
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  input: { color: "#fff", paddingHorizontal: 10, paddingBottom: 10 },
  modalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 12,
  },
  btnSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
  },
  btnPrimary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#2563eb",
    borderRadius: 10,
  },
});
