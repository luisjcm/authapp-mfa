// src/screens/OtpScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";

export type OtpScreenProps = {
  email: string;
  onVerify: (code: string) => Promise<void> | void;
  onResend: () => Promise<void> | void;
  otpLength?: number;     // default 6
  ttlSeconds?: number;    // default 60
};

export default function OtpScreen({
  email,
  onVerify,
  onResend,
  otpLength = 6,
  ttlSeconds = 60,
}: OtpScreenProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [left, setLeft] = useState(ttlSeconds);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const id = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  const masked = email.replace(/(.{2}).+(@.*)/, "$1***$2");

  const handleVerify = async () => {
    try {
      setLoading(true);
      await onVerify(code);
    } catch (e: any) {
      Alert.alert("Código inválido", e?.message ?? "Intenta de nuevo");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (left > 0) return;
    try {
      setLoading(true);
      await onResend();
      setCode("");
      setLeft(ttlSeconds);
      // foco al input
      setTimeout(() => inputRef.current?.focus(), 200);
    } catch (e: any) {
      Alert.alert("No se pudo reenviar", e?.message ?? "Intenta más tarde");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0f172a", padding: 24, justifyContent: "center" }}>
      {/* HEADER */}
      <Text style={{ fontSize: 26, fontWeight: "800", color: "#fff", marginBottom: 8 }}>
        Verifica tu código
      </Text>
      <Text style={{ color: "#94a3b8", marginBottom: 24 }}>
        Te enviamos un código a{" "}
        <Text style={{ fontWeight: "700", color: "#cbd5e1" }}>{masked}</Text>
      </Text>

      {/* OTP INPUT (estilo “pill” grande) */}
      <View
        style={{
          backgroundColor: "#1e293b",
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 6,
          alignItems: "center",
          marginBottom: 16,
          borderWidth: 1,
          borderColor: "#263244",
        }}
      >
        <TextInput
          ref={inputRef}
          placeholder="••••••"
          placeholderTextColor="#64748b"
          keyboardType="number-pad"
          maxLength={otpLength}
          value={code}
          onChangeText={setCode}
          style={{
            height: 64,
            fontSize: 28,
            color: "#fff",
            letterSpacing: 10,
            textAlign: "center",
            width: "100%",
          }}
        />
      </View>

      {/* VERIFY BUTTON */}
      <TouchableOpacity
        disabled={code.length !== otpLength || loading}
        onPress={handleVerify}
        style={{
          backgroundColor: code.length === otpLength ? "#22c55e" : "#334155",
          borderRadius: 12,
          paddingVertical: 14,
          alignItems: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Verificar</Text>
        )}
      </TouchableOpacity>

      {/* RESEND */}
      <View style={{ alignItems: "center", marginTop: 14 }}>
        {left > 0 ? (
          <Text style={{ color: "#94a3b8" }}>Puedes reenviar en {left}s</Text>
        ) : (
          <TouchableOpacity onPress={handleResend} disabled={loading}>
            <Text style={{ color: "#3b82f6", fontWeight: "700" }}>Reenviar código</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* AYUDA / TIP */}
      <Text style={{ color: "#64748b", fontSize: 12, marginTop: 18, textAlign: "center" }}>
        ¿No ves el correo? Revisa spam o promociones.
      </Text>
    </View>
  );
}
