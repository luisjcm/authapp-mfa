import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";

export type EmailScreenProps = {
  onSubmit?: (email: string) => Promise<void> | void;
};

export default function EmailScreen({ onSubmit }: EmailScreenProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    if (!onSubmit) return;
    try {
      setLoading(true);
      await onSubmit(email.trim());
    } catch (e: any) {
      Alert.alert("Ups", e?.message ?? "No pudimos enviar el código");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0f172a", justifyContent: "center", padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: "700", color: "#fff", marginBottom: 8 }}>Iniciar sesión</Text>
      <Text style={{ fontSize: 15, color: "#94a3b8", marginBottom: 32 }}>
        Te enviaremos un código de verificación
      </Text>

      <View style={{ backgroundColor: "#1e293b", borderRadius: 12, marginBottom: 20, paddingHorizontal: 16 }}>
        <TextInput
          placeholder="tu@correo.com"
          placeholderTextColor="#64748b"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={{ height: 50, fontSize: 16, color: "#fff" }}
        />
      </View>

      <TouchableOpacity
        disabled={!email || loading}
        onPress={handlePress}
        style={{
          backgroundColor: !email ? "#334155" : "#22c55e",
          borderRadius: 12,
          paddingVertical: 14,
          alignItems: "center",
        }}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Enviar código</Text>}
      </TouchableOpacity>
    </View>
  );
}
