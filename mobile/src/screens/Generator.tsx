import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import ScannerView from '../components/ScannerView';
import { parseOtpauthUri, TotpAccount } from '../utils/totpParser';
import { loadAccounts, saveAccounts } from '../utils/storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// --- COMPONENTE: Temporizador Circular Animado ---
const AnimatedTimer = ({ secondsLeft, color }: { secondsLeft: number, color: string }) => {
  const radius = 20;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius; // ~125.6
  // Calculamos cuánto "vaciar" el círculo
  const strokeDashoffset = circumference - (secondsLeft / 30) * circumference;

  return (
    <View style={styles.timerWrapper}>
      <Svg width="48" height="48" viewBox="0 0 48 48">
        {/* Círculo de fondo oscuro */}
        <Circle cx="24" cy="24" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} fill="none" />
        {/* Círculo de progreso animado */}
        <Circle
          cx="24"
          cy="24"
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 24 24)" // Inicia a las 12 en punto
        />
      </Svg>
      <View style={styles.timerTextContainer}>
        <Text style={[styles.timerText, { color }]}>{secondsLeft}</Text>
      </View>
    </View>
  );
};

export default function Generator() {
  const [isScanning, setIsScanning] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [tokens, setTokens] = useState<TotpAccount[]>([]);
  const navigation = useNavigation<any>();
  
  // Estados para UI Premium
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<TotpAccount | null>(null);
  const [epoch, setEpoch] = useState(Math.round(new Date().getTime() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setEpoch(Math.round(new Date().getTime() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchAccounts = async () => {
        const storedTokens = await loadAccounts();
        setTokens(storedTokens);
      };
    fetchAccounts();
  }, [])
  );
  const secondsLeft = 30 - (epoch % 30);

  // --- LÓGICA DE UI: TOAST ---
  const showToast = (message: string) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(null), 2500); // Se oculta solo en 2.5s
  };

  // --- LÓGICA DE ESCANEO ---
  const handleScan = (data: string) => {
    setIsScanning(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newAccount = parseOtpauthUri(data);
    
    if (!newAccount) {
      showToast("❌ Código QR no válido");
      return;
    }

    const existsIndex = tokens.findIndex(t => t.secret === newAccount.secret);
    if (existsIndex !== -1) {
      // Por simplicidad en este MVP, si es duplicado lo actualizamos en silencio
      const updatedTokens = [...tokens];
      updatedTokens[existsIndex] = newAccount;
      setTokens(updatedTokens);
      saveAccounts(updatedTokens);
      showToast("Cuenta actualizada");
      return;
    }

    const newTokens = [...tokens, newAccount];
    setTokens(newTokens);
    saveAccounts(newTokens);
    showToast("Cuenta agregada exitosamente");
  };

  // --- LÓGICA DE TARJETAS ---
  const confirmDelete = () => {
    if (!accountToDelete) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const updatedTokens = tokens.filter(t => t.id !== accountToDelete.id);
    setTokens(updatedTokens);
    saveAccounts(updatedTokens);
    setAccountToDelete(null);
    showToast("Cuenta eliminada");
  };

  const copyToClipboard = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
  };

  const renderTokenCard = ({ item }: { item: TotpAccount }) => {
    const pseudoHash = Math.abs(
      item.secret.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * (Math.floor(epoch / 30))
    );
    const code = String(pseudoHash % 1000000).padStart(6, '0');

    let timerColor = '#3B82F6'; // Azul
    if (secondsLeft <= 10) timerColor = '#F59E0B'; // Naranja
    if (secondsLeft <= 5) timerColor = '#EF4444'; // Rojo

    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.6} // Efecto visual suave de pulsación
        onPress={() => copyToClipboard(code)}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setAccountToDelete(item);
        }}
      >
        <View style={styles.cardContent}>
          <View>
            <Text style={styles.cardIssuer}>{item.issuer || 'Desconocido'}</Text>
            <Text style={styles.cardLabel}>{item.label}</Text>
            <Text style={styles.cardCode}>{code.slice(0, 3)} {code.slice(3, 6)}</Text>
          </View>
          <AnimatedTimer secondsLeft={secondsLeft} color={timerColor} />
        </View>
      </TouchableOpacity>
    );
  };

  if (isScanning) return <ScannerView onScan={handleScan} onCancel={() => setIsScanning(false)} />;

  return (
    <View style={styles.container}>
      {tokens.length > 0 ? (
        <FlatList
          data={tokens}
          keyExtractor={(item) => item.id}
          renderItem={renderTokenCard}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="shield-checkmark-outline" size={64} color="#334155" />
          <Text style={styles.emptyText}>No hay cuentas vinculadas aún.</Text>
        </View>
      )}

      {/* --- MODAL DE ELIMINACIÓN PERSONALIZADO --- */}
      <Modal visible={!!accountToDelete} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="warning-outline" size={40} color="#EF4444" style={{ alignSelf: 'center', marginBottom: 10 }} />
            <Text style={styles.modalTitle}>Eliminar cuenta</Text>
            <Text style={styles.modalText}>
              ¿Seguro que deseas eliminar la cuenta de <Text style={{fontWeight: 'bold', color: '#FFF'}}>{accountToDelete?.issuer}</Text>? Esta acción no se puede deshacer.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setAccountToDelete(null)}>
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnDelete} onPress={confirmDelete}>
                <Text style={styles.modalBtnDeleteText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- TOAST FLOTANTE --- */}
      {toastMsg && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      )}

     
     {/* --- FAB DUAL (CORREGIDO Y ESTRUCTURADO) --- */}
      {showFabMenu && (
        <TouchableOpacity 
          style={[StyleSheet.absoluteFill, styles.fabOverlayBg]} 
          activeOpacity={1} 
          onPress={() => setShowFabMenu(false)}
        >
          <View style={styles.menuContainer}>
            {/* Opción Código Manual */}
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => { 
                setShowFabMenu(false); 
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('ManualSetup');
              }}
            >
              <Text style={styles.menuText}>Ingresar código manual</Text>
              <View style={styles.menuIcon}>
                <Ionicons name="keypad" size={20} color="#FFF" />
              </View>
            </TouchableOpacity>

            {/* Opción Escanear QR */}
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => { 
                setShowFabMenu(false); 
                setIsScanning(true); 
              }}
            >
              <Text style={styles.menuText}>Escanear código QR</Text>
              <View style={styles.menuIcon}>
                <Ionicons name="qr-code" size={20} color="#FFF" />
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      <TouchableOpacity 
        style={[styles.fab, showFabMenu && { transform: [{ rotate: '45deg' }], backgroundColor: '#334155' }]} 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowFabMenu(!showFabMenu);
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', paddingTop: 20 },
  
  // --- Tarjetas ---
  card: { backgroundColor: '#1E293B', marginHorizontal: 20, marginBottom: 16, borderRadius: 16, padding: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2 },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardIssuer: { color: '#E2E8F0', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  cardLabel: { color: '#94A3B8', fontSize: 13, marginBottom: 8 },
  cardCode: { color: '#60A5FA', fontSize: 36, fontWeight: '800', letterSpacing: 3 },
  
  // --- Temporizador SVG ---
  timerWrapper: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  timerTextContainer: { ...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'center' },
  timerText: { fontSize: 14, fontWeight: 'bold' },

  // --- Estados Vacíos ---
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyText: { color: '#94A3B8', fontSize: 16, marginTop: 16, textAlign: 'center' },

  fabOverlayBg: { 
    backgroundColor: 'rgba(15, 23, 42, 0.8)', 
    zIndex: 5 
  },
  
  // --- Toast ---
  toastContainer: { position: 'absolute', bottom: 100, alignSelf: 'center', backgroundColor: '#334155', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25, elevation: 10, zIndex: 200 },
  toastText: { color: '#FFF', fontSize: 14, fontWeight: '500' },

  // --- Modal Oscuro ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#1E293B', width: '85%', padding: 24, borderRadius: 20, elevation: 10 },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  modalText: { color: '#94A3B8', fontSize: 15, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  modalBtnCancel: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#334155', alignItems: 'center' },
  modalBtnCancelText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  modalBtnDelete: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#EF4444', alignItems: 'center' },
  modalBtnDeleteText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },

  // --- FAB y Menú Dual ---
  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#3B82F6', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8, zIndex: 10 },
  fabOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(15, 23, 42, 0.8)', zIndex: 5 },
  menuContainer: { position: 'absolute', bottom: 100, right: 30, alignItems: 'flex-end' },
  menuItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  menuText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginRight: 15, backgroundColor: '#1E293B', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, overflow: 'hidden' },
  menuIcon: { backgroundColor: '#3B82F6', width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', elevation: 5 },
});