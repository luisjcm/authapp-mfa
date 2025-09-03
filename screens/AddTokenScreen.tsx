import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { parseOtpauthUri, TotpAccount } from "../server/src/utils/totp";

const STORAGE_KEY = "totp_accounts";

export default function AddTokenScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const onBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setError(null);

    const parsed = parseOtpauthUri(data);
    if (!parsed) {
      setError("QR inválido. Debe ser un otpauth://totp");
      setScanned(false);
      return;
    }

    // Guardar en AsyncStorage
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const list: TotpAccount[] = raw ? JSON.parse(raw) : [];
    list.push(parsed);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));

    navigation.replace("Authenticator");
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Solicitando permisos…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Se requiere acceso a la cámara</Text>
        <Pressable onPress={requestPermission} style={styles.btn}>
          <Text style={styles.btnText}>Conceder permiso</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0f172a" }}>
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        onBarcodeScanned={onBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />
      {error && (
        <View style={styles.error}>
          <Text style={{ color: "#fff" }}>{error}</Text>
        </View>
      )}
      <Pressable
        onPress={() => navigation.goBack()}
        style={({ pressed }) => [styles.close, pressed && { opacity: 0.85 }]}
      >
        <Text style={{ color: "#0b111f", fontWeight: "800" }}>Cancelar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
  },
  text: { color: "#e5e7eb" },
  btn: {
    marginTop: 16,
    backgroundColor: "#22c55e",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnText: { color: "#0f172a", fontWeight: "700" },
  error: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 90,
    backgroundColor: "#ef4444",
    padding: 12,
    borderRadius: 12,
  },
  close: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
});
