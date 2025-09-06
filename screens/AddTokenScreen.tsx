// src/screens/AddTokenScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, Animated, Easing } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import type { BarcodeType } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { parseOtpauthUri, TotpAccount } from "../server/src/utils/totp";
import { COLORS, SPACING, RADIUS } from "../theme";

const STORAGE_KEY = "totp_accounts";

type ExistingLike = { issuer?: string | null; label: string };

const makeKey = (a: { issuer?: string | null; label: string }) =>
  `${(a.issuer || "SinIssuer").toLowerCase()}::${a.label.toLowerCase()}`;

export default function AddTokenScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedOnce, setScannedOnce] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [existingName, setExistingName] = useState("");
  const resolveRef = useRef<((v: "skip" | "replace") => void) | null>(null);
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  // animación de línea de escaneo solo mientras “enfoca”
  useEffect(() => {
    if (!isProcessing) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(focusAnim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(focusAnim, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isProcessing]);

  const handleExisting = useCallback((existing: ExistingLike) => {
    return new Promise<"skip" | "replace">((resolve) => {
      setExistingName(`${existing.issuer || "SinIssuer"} - ${existing.label}`);
      resolveRef.current = resolve;
      setShowDialog(true);
    });
  }, []);

  const onResolve = (choice: "skip" | "replace") => {
    if (resolveRef.current) {
      resolveRef.current(choice);
      resolveRef.current = null;
    }
    setShowDialog(false);
  };

  const frameSize = 260;
  const translateY = focusAnim.interpolate({ inputRange: [0, 1], outputRange: [0, frameSize - 4] });

  const barcodeSettings = useMemo(() => ({ barcodeTypes: ["qr"] as unknown as BarcodeType[] }), []);

  const focusDelay = 900;

  const onBarCodeScanned = async ({ data }: { data: string }) => {
    if (scannedOnce || isProcessing) return;
    setScannedOnce(true);
    setIsProcessing(true);
    try {
      // pequeño “enfoque”
      await new Promise((r) => setTimeout(r, focusDelay));

      const parsed = parseOtpauthUri(String(data));
      if (!parsed) throw new Error("QR inválido. Debe ser otpauth://totp");

      // cargar lista
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const list: TotpAccount[] = raw ? JSON.parse(raw) : [];

      // ¿duplicado por issuer+label?
      const dup = list.find((a) => makeKey(a) === makeKey(parsed));
      if (dup) {
        const choice = await handleExisting({ issuer: dup.issuer, label: dup.label });
        if (choice === "skip") {
          setScannedOnce(false);
          return;
        }
        // replace: sustituye manteniendo el id anterior si existe
        const next = list.map((a) => (makeKey(a) === makeKey(parsed) ? { ...parsed, id: a.id } : a));
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } else {
        // alta normal
        list.push(parsed);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace("Authenticator");
    } catch (e) {
      setScannedOnce(false);
    } finally {
      setIsProcessing(false);
    }
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
        <Pressable onPress={requestPermission} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Conceder permiso</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0f172a" }}>
      {/* Cámara */}
      <View style={{ ...StyleSheet.absoluteFillObject }}>
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          onBarcodeScanned={onBarCodeScanned}
          barcodeScannerSettings={barcodeSettings}
        />
      </View>

      {/* Overlay + marco */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, styles.overlayContainer]}>
        {/* top */}
        <View style={[styles.mask, { height: "25%" }]} />
        {/* middle */}
        <View style={{ flexDirection: "row", height: "50%" }}>
          <View style={[styles.mask, { width: "10%" }]} />
          <View style={[styles.frameBox, { width: frameSize, height: frameSize }]}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
            {isProcessing && <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />}
          </View>
          <View style={[styles.mask, { width: "10%" }]} />
        </View>
        {/* bottom */}
        <View style={[styles.mask, { height: "25%" }]} />
      </View>

      {/* Cancelar */}
      <View style={styles.bottomBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.cancelBtn}>
          <Text style={{ color: "#0b111f", fontWeight: "800" }}>Cancelar</Text>
        </Pressable>
      </View>

      {/* Diálogo duplicado */}
      <Modal visible={showDialog} animationType="fade" transparent onRequestClose={() => onResolve("skip")}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cuenta ya existente</Text>
            <Text style={styles.modalDesc}>Ya tienes “{existingName}”. ¿Deseas reemplazarla?</Text>
            <View style={styles.modalActions}>
              <Pressable onPress={() => onResolve("skip")} style={[styles.dialogBtn, { backgroundColor: COLORS.primary }]}>
                <Text style={{ color: COLORS.text, fontWeight: "700" }}>Cancelar</Text>
              </Pressable>
              <Pressable onPress={() => onResolve("replace")} style={[styles.dialogBtn, { backgroundColor: "#ef4444" }]}>
                <Text style={{ color: COLORS.text, fontWeight: "700" }}>Reemplazar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0f172a" },
  text: { color: "#e5e7eb" },

  primaryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  primaryBtnText: { color: "#0f172a", fontWeight: "700" },

  overlayContainer: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, elevation: 1000 },
  mask: { backgroundColor: "rgba(0,0,0,0.70)", flex: 1, elevation: 1000 },
  frameBox: {
    alignSelf: "center",
    borderColor: COLORS.primary,
    borderWidth: 2,
    borderRadius: RADIUS.md,
    overflow: "hidden",
    justifyContent: "flex-start",
    elevation: 1001,
  },
  corner: { position: "absolute", width: 26, height: 26, borderColor: COLORS.primary },
  tl: { top: 0, left: 0, borderLeftWidth: 4, borderTopWidth: 4, borderTopLeftRadius: RADIUS.sm },
  tr: { top: 0, right: 0, borderRightWidth: 4, borderTopWidth: 4, borderTopRightRadius: RADIUS.sm },
  bl: { bottom: 0, left: 0, borderLeftWidth: 4, borderBottomWidth: 4, borderBottomLeftRadius: RADIUS.sm },
  br: { bottom: 0, right: 0, borderRightWidth: 4, borderBottomWidth: 4, borderBottomRightRadius: RADIUS.sm },
  scanLine: { position: "absolute", left: 0, right: 0, height: 4, backgroundColor: COLORS.primary, opacity: 0.9 },

  bottomBar: { position: "absolute", left: 0, right: 0, bottom: 24, alignItems: "center", justifyContent: "center", zIndex: 2000 },
  cancelBtn: { backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },

  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" },
  modalCard: { width: "86%", backgroundColor: "#111827", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#1f2937" },
  modalTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 8 },
  modalDesc: { color: "#9CA3AF", fontSize: 14, marginBottom: 12 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  dialogBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
});
