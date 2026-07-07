import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Alert, Pressable } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import ScannerView from '../components/ScannerView';
import { parseOtpauthUri, TotpAccount } from '../utils/totpParser';
import { loadAccounts, saveAccounts } from '../utils/storage';

// --- OPTIMIZACIÓN 1: TEMPORIZADOR SVG ANIMADO CON TEXTO CENTRADO ---
const AnimatedTimer = ({ secondsLeft, color }: { secondsLeft: number, color: string }) => {
  const radius = 20;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (secondsLeft / 30) * circumference;

  return (
    <View style={styles.timerWrapper}>
      <Svg width="48" height="48" viewBox="0 0 48 48">
        <Circle cx="24" cy="24" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} fill="none" />
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
          transform="rotate(-90 24 24)"
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.timerTextContainer]}>
        <Text style={[styles.timerText, { color }]}>{secondsLeft}</Text>
      </View>
    </View>
  );
};

export default function Generator() {
  const [isScanning, setIsScanning] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [tokens, setTokens] = useState<TotpAccount[]>([]);
  
  // --- OPTIMIZACIÓN 2: VARIABLES DE ESTADO COHERENTES ---
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<TotpAccount | null>(null);
  
  const [epoch, setEpoch] = useState(Math.round(new Date().getTime() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setEpoch(Math.round(new Date().getTime() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchAccounts = async () => {
      const storedTokens = await loadAccounts();
      setTokens(storedTokens);
    };
    fetchAccounts();
  }, []);

  const secondsLeft = 30 - (epoch % 30);

  const showToast = (message: string) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(null), 2500);
  };

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
      // Alert personalizado con estilo oscuro
      Alert.alert(
        "Cuenta ya existente",
        `Ya tienes "${newAccount.issuer} - ${newAccount.label}". ¿Deseas reemplazarla?`,
        [
          { 
            text: "Cancelar", 
            style: "cancel",
            textStyle: { color: '#94A3B8' }
          },
          { 
            text: "Reemplazar", 
            style: "destructive",
            onPress: () => {
              const updatedTokens = [...tokens];
              updatedTokens[existsIndex] = newAccount;
              setTokens(updatedTokens);
              saveAccounts(updatedTokens);
              showToast("Cuenta actualizada correctamente");
            }
          }
        ],
        { 
          userInterfaceStyle: 'dark',
          cancelButtonIndex: 0,
          destructiveButtonIndex: 1
        }
      );
      return;
    }

    const newTokens = [...tokens, newAccount];
    setTokens(newTokens);
    saveAccounts(newTokens);
    showToast("Cuenta agregada exitosamente");
  };

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
    await Clipboard.setStringAsync(code.replace(/\s/g, ''));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showToast("Copiado al portapapeles");
  };

  const renderTokenCard = ({ item }: { item: TotpAccount }) => {
    const pseudoHash = Math.abs(
      item.secret.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * (Math.floor(epoch / 30))
    );
    const code = String(pseudoHash % 1000000).padStart(6, '0');

    let timerColor = '#3B82F6';
    if (secondsLeft <= 10) timerColor = '#F59E0B';
    if (secondsLeft <= 5) timerColor = '#EF4444';

    return (
      <Pressable 
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed
        ]}
        onPress={() => copyToClipboard(code)}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setAccountToDelete(item);
        }}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardLeftSection}>
            <Text style={styles.cardIssuer}>{item.issuer || 'Desconocido'}</Text>
            <Text style={styles.cardLabel}>{item.label}</Text>
            <View style={styles.cardCodeWrapper}>
              <Text style={styles.cardCode}>{code.slice(0, 3)}</Text>
              <Text style={styles.cardCodeSeparator}> </Text>
              <Text style={styles.cardCode}>{code.slice(3, 6)}</Text>
            </View>
            <View style={styles.copyIndicator}>
              <Ionicons name="copy-outline" size={14} color="#64748B" />
              <Text style={styles.copyText}>Toca para copiar</Text>
            </View>
          </View>
          <AnimatedTimer secondsLeft={secondsLeft} color={timerColor} />
        </View>
      </Pressable>
    );
  };

  if (isScanning) return <ScannerView onScan={handleScan} onCancel={() => setIsScanning(false)} />;

  return (
    <View style={styles.container}>
      {/* Header con contador */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Códigos TOTP</Text>
        {tokens.length > 0 && (
          <View style={styles.headerCount}>
            <Text style={styles.headerCountText}>{tokens.length} cuentas</Text>
          </View>
        )}
      </View>

      {tokens.length > 0 ? (
        <FlatList
          data={tokens}
          keyExtractor={(item) => item.id}
          renderItem={renderTokenCard}
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrapper}>
            <Ionicons name="shield-checkmark-outline" size={56} color="#64748B" />
          </View>
          <Text style={styles.emptyText}>No hay cuentas vinculadas aún</Text>
          <Text style={styles.emptySubtext}>Agrega tu primera cuenta escaneando un código QR</Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => setIsScanning(true)}
          >
            <Text style={styles.emptyButtonText}>Escanear QR</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* --- MODAL OSCURO PARA ELIMINACIÓN --- */}
      <Modal 
        visible={!!accountToDelete} 
        transparent 
        animationType="fade"
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconWrapper}>
              <Ionicons name="warning-outline" size={40} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>Eliminar cuenta</Text>
            <Text style={styles.modalText}>
              ¿Seguro que deseas eliminar la cuenta de{' '}
              <Text style={{fontWeight: '700', color: '#F1F5F9'}}>
                {accountToDelete?.issuer}
              </Text>
              ? Esta acción no se puede deshacer.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalBtnCancel} 
                onPress={() => setAccountToDelete(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalBtnDelete} 
                onPress={confirmDelete}
                activeOpacity={0.7}
              >
                <Text style={styles.modalBtnDeleteText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Menú Dual del FAB */}
      {showFabMenu && (
        <TouchableOpacity 
          style={[StyleSheet.absoluteFill, styles.fabOverlayBg]} 
          activeOpacity={1} 
          onPress={() => setShowFabMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => { 
                setShowFabMenu(false);
                showToast("Función en desarrollo");
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.menuText}>Ingresar código manual</Text>
              <View style={styles.menuIcon}>
                <Ionicons name="keypad" size={20} color="#FFF" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => { 
                setShowFabMenu(false); 
                setIsScanning(true); 
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.menuText}>Escanear código QR</Text>
              <View style={styles.menuIcon}>
                <Ionicons name="qr-code" size={20} color="#FFF" />
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* --- TOAST FLOTANTE --- */}
      {toastMsg && (
        <View style={styles.toastContainer}>
          <Ionicons name="checkmark-circle" size={20} color="#3B82F6" style={styles.toastIcon} />
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.fab, showFabMenu && styles.fabActive]} 
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
  container: { 
    flex: 1, 
    backgroundColor: '#0F172A',
    paddingTop: 20,
  },

  // --- Header ---
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#F1F5F9',
    fontSize: 24,
    fontWeight: '700',
  },
  headerCount: {
    backgroundColor: 'rgba(51, 65, 85, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  headerCountText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },

  // --- Tarjetas ---
  card: { 
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    marginHorizontal: 20, 
    marginBottom: 4,
    borderRadius: 16, 
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 12,
    elevation: 8,
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  cardContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    gap: 12,
  },
  cardLeftSection: {
    flex: 1,
    marginRight: 12,
  },
  cardIssuer: { 
    color: '#E2E8F0', 
    fontSize: 14, 
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cardLabel: { 
    color: '#94A3B8', 
    fontSize: 12, 
    marginBottom: 6,
    opacity: 0.8,
  },
  cardCodeWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  cardCode: { 
    color: '#60A5FA', 
    fontSize: 32, 
    fontWeight: '800', 
    letterSpacing: 4,
    textShadowColor: 'rgba(96, 165, 250, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  cardCodeSeparator: {
    color: '#475569',
    fontSize: 32,
    fontWeight: '300',
    marginHorizontal: 2,
  },
  copyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    opacity: 0.6,
  },
  copyText: {
    color: '#64748B',
    fontSize: 11,
    marginLeft: 4,
  },
  cardSeparator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginHorizontal: 20,
    marginBottom: 12,
  },

  // --- Temporizador Animado ---
  timerWrapper: { 
    width: 48, 
    height: 48, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  timerTextContainer: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  timerText: { 
    fontSize: 14, 
    fontWeight: 'bold' 
  },

  // --- Estados Vacíos ---
  emptyState: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyIconWrapper: {
    backgroundColor: 'rgba(51, 65, 85, 0.3)',
    padding: 24,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  emptyText: { 
    color: '#E2E8F0', 
    fontSize: 18, 
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  emptySubtext: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: 12,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
  },

  // --- Toast ---
  toastContainer: { 
    position: 'absolute', 
    bottom: 110, 
    alignSelf: 'center', 
    backgroundColor: 'rgba(30, 41, 59, 0.95)', 
    paddingVertical: 14, 
    paddingHorizontal: 24, 
    borderRadius: 30, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 20,
    elevation: 20,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toastIcon: {
    marginRight: 4,
  },
  toastText: { 
    color: '#E2E8F0', 
    fontSize: 14, 
    fontWeight: '500',
  },

  // --- Modal Oscuro Unificado ---
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.75)', 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: { 
    backgroundColor: '#1E293B',
    width: '100%',
    maxWidth: 340,
    padding: 28, 
    borderRadius: 24, 
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 30,
  },
  modalIconWrapper: {
    alignSelf: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 50,
  },
  modalTitle: { 
    color: '#F1F5F9', 
    fontSize: 20, 
    fontWeight: '700', 
    textAlign: 'center', 
    marginBottom: 8,
  },
  modalText: { 
    color: '#94A3B8', 
    fontSize: 15, 
    textAlign: 'center', 
    marginBottom: 28, 
    lineHeight: 22,
  },
  modalActions: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    gap: 12,
  },
  modalBtnCancel: { 
    flex: 1, 
    paddingVertical: 14, 
    borderRadius: 14, 
    backgroundColor: 'rgba(51, 65, 85, 0.6)', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  modalBtnCancelText: {
    color: '#E2E8F0',
    fontWeight: '600',
    fontSize: 15,
  },
  modalBtnDelete: { 
    flex: 1, 
    paddingVertical: 14, 
    borderRadius: 14, 
    backgroundColor: '#EF4444', 
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalBtnDeleteText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
  },

  // --- FAB y Menú ---
  fabOverlayBg: { 
    backgroundColor: 'rgba(15, 23, 42, 0.8)', 
    zIndex: 5,
  },
  fab: { 
    position: 'absolute', 
    bottom: 30, 
    right: 30, 
    backgroundColor: '#3B82F6', 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.4, 
    shadowRadius: 12,
    elevation: 12,
    zIndex: 10,
  },
  fabActive: {
    transform: [{ rotate: '45deg' }],
    backgroundColor: '#334155',
    shadowColor: '#334155',
  },
  menuContainer: { 
    position: 'absolute', 
    bottom: 100, 
    right: 30, 
    alignItems: 'flex-end',
    gap: 12,
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  menuText: { 
    color: '#E2E8F0', 
    fontSize: 14, 
    fontWeight: '500',
    marginRight: 12,
  },
  menuIcon: { 
    backgroundColor: '#3B82F6', 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
});