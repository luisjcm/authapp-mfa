import React, { useState } from 'react';
import { StyleSheet, Text, View, Switch, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING } from '../theme';
import Button from '../components/ui/Button';

export default function SettingsScreen( { navigation }: any) {
  // Estados para los interruptores
  const [useBiometrics, setUseBiometrics] = useState(false);
  const [privacyShield, setPrivacyShield] = useState(true);
  const [autoLock, setAutoLock] = useState(true);

  // Funciones de interacción (Mockups antes de conectar la lógica dura)
  const toggleBiometrics = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setUseBiometrics(value);
    if (value) {
      Alert.alert("Biometría Activada", "Se usará tu huella o FaceID para desbloquear la bóveda.");
    }
  };

  const handleExport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "Exportar Bóveda",
      "Esto generará un archivo encriptado con todas tus credenciales y notas. ¿Continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Exportar", onPress: () => console.log("Exportando...") }
      ]
    );
  };

  const handleDestroyVault = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "¡PELIGRO EXTREMO!",
      "Estás a punto de borrar TODA la base de datos local. Las notas y credenciales no sincronizadas se perderán para siempre. ¿Estás absolutamente seguro?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "DESTRUIR TODO", style: "destructive", onPress: () => console.log("Bóveda borrada") }
      ]
    );
  };

  const handleLogout = () => {
    // Aquí a futuro borraremos los tokens de expo-secure-store
    
    // Destruimos la pila de navegación y regresamos al Login
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      

      {/* SECCIÓN: SEGURIDAD */}
      <Text style={styles.sectionTitle}>Seguridad</Text>
      <View style={styles.card}>
        <View style={styles.settingRow}>
          <View style={styles.settingIconTitle}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Ionicons name="finger-print" size={20} color="#10B981" />
            </View>
            <Text style={styles.settingText}>Desbloqueo Biométrico</Text>
          </View>
          <Switch 
            value={useBiometrics} 
            onValueChange={toggleBiometrics}
            trackColor={{ false: '#334155', true: '#10B981' }}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={styles.settingIconTitle}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(96, 165, 250, 0.1)' }]}>
              <Ionicons name="eye-off" size={20} color="#60A5FA" />
            </View>
            <Text style={styles.settingText}>Privacy Shield (Fondo opaco)</Text>
          </View>
          <Switch 
            value={privacyShield} 
            onValueChange={(val) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setPrivacyShield(val);
            }}
            trackColor={{ false: '#334155', true: '#60A5FA' }}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={styles.settingIconTitle}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Ionicons name="time" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.settingText}>Bloqueo automático al salir</Text>
          </View>
          <Switch 
            value={autoLock} 
            onValueChange={(val) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setAutoLock(val);
            }}
            trackColor={{ false: '#334155', true: '#F59E0B' }}
          />
        </View>
      </View>

      {/* SECCIÓN: DATOS */}
      <Text style={styles.sectionTitle}>Datos de la Bóveda</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleExport}>
          <Ionicons name="cloud-download-outline" size={22} color={COLORS.text} />
          <Text style={styles.actionBtnText}>Exportar bóveda (Backup)</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert("Pronto", "Función de importación en desarrollo")}>
          <Ionicons name="cloud-upload-outline" size={22} color={COLORS.text} />
          <Text style={styles.actionBtnText}>Importar bóveda</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* SECCIÓN: ZONA DE PELIGRO */}
      <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>Zona de Peligro</Text>
      <View style={[styles.card, { borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert("Cambiar Clave", "Flujo para cambiar la contraseña maestra")}>
          <Ionicons name="key" size={22} color={COLORS.text} />
          <Text style={styles.actionBtnText}>Cambiar Contraseña Maestra</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.actionBtn} onPress={handleDestroyVault}>
          <Ionicons name="trash-bin" size={22} color="#EF4444" />
          <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Destruir Bóveda Local</Text>
        </TouchableOpacity>
      </View>

      {/* BOTÓN DE CERRAR SESIÓN */}
      <Button 
        label="Cerrar Sesión" 
        onPress={handleLogout} 
        style={{ marginTop: SPACING.xl, backgroundColor: '#334155' }} 
      />

      <Text style={styles.versionText}>Versión 1.0.0 (Build 42)</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg, paddingBottom: 100 },
  header: { marginBottom: SPACING.xl, marginTop: 20 },
  title: { color: COLORS.text, fontSize: 28, fontWeight: 'bold' },
  
  sectionTitle: { color: COLORS.textMuted, fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: SPACING.sm, marginLeft: SPACING.xs, letterSpacing: 1 },
  
  card: { backgroundColor: '#1E293B', borderRadius: 16, marginBottom: SPACING.xl, borderWidth: 1, borderColor: '#334155', overflow: 'hidden' },
  
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md },
  settingIconTitle: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  settingText: { color: COLORS.text, fontSize: 16, fontWeight: '500' },
  
  divider: { height: 1, backgroundColor: '#334155', marginLeft: 56 },
  
  actionBtn: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md },
  actionBtnText: { flex: 1, color: COLORS.text, fontSize: 16, marginLeft: 12, fontWeight: '500' },
  
  versionText: { color: '#475569', textAlign: 'center', marginTop: SPACING.xl, fontSize: 12, fontWeight: '600' }
});