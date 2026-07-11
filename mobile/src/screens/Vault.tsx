import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  TextInput, LayoutAnimation, Platform, UIManager, Modal, Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING } from '../theme';
import Button from '../components/ui/Button';



// Datos de prueba (Mocks) para armar la UI antes de conectarla al Storage
const MOCK_PASSWORDS = [
  { id: '1', service: 'Netflix', username: 'ljcm47@gmail.com', password: 'SuperSecretPassword123!', updatedAt: '11 Jul 2026' },
  { id: '2', service: 'GitHub (Trabajo)', username: 'dev_luis', password: 'ghp_8x9A2k9LmPq2...3x', updatedAt: '10 Jul 2026' },
  { id: '3', service: 'Router Wi-Fi', username: 'admin', password: 'admin1234', updatedAt: '01 Ene 2026' },
];

export default function VaultScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showPasswordId, setShowPasswordId] = useState<string | null>(null);
  
  // Estados para el Generador de Contraseñas
  const [showGenerator, setShowGenerator] = useState(false);
  const [genLength, setGenLength] = useState(16);
  const [genUpper, setGenUpper] = useState(true);
  const [genNumbers, setGenNumbers] = useState(true);
  const [genSymbols, setGenSymbols] = useState(true);
  const [generatedPass, setGeneratedPass] = useState('');

  // 1. Lógica del Buscador en tiempo real
  const filteredPasswords = useMemo(() => {
    return MOCK_PASSWORDS.filter(item => 
      item.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // 2. Animación del Acordeón
  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
    // Si cerramos la tarjeta, ocultamos la contraseña por seguridad
    if (expandedId === id) setShowPasswordId(null);
  };

  // 3. Lógica de Copiado al Portapapeles
  const copyToClipboard = async (text: string, type: 'Usuario' | 'Contraseña') => {
    await Clipboard.setStringAsync(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Aquí podrías usar tu sistema de Toast si lo tienes global, por ahora usamos un alert o nada (el haptic es suficiente)
  };

  // 4. Lógica del Generador Matemático de Contraseñas
  const generatePassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const lowers = "abcdefghijklmnopqrstuvwxyz";
    const uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
    
    let chars = lowers;
    if (genUpper) chars += uppers;
    if (genNumbers) chars += numbers;
    if (genSymbols) chars += symbols;

    let pass = "";
    for (let i = 0; i < genLength; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPass(pass);
  };

  // RENDERIZADO DE LA TARJETA
  const renderCard = ({ item }: { item: typeof MOCK_PASSWORDS[0] }) => {
    const isExpanded = expandedId === item.id;
    const isPasswordVisible = showPasswordId === item.id;

    return (
      <TouchableOpacity 
        style={[styles.card, isExpanded && styles.cardExpanded]}
        activeOpacity={0.8}
        onPress={() => toggleExpand(item.id)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.serviceIconContainer}>
            <Text style={styles.serviceIconText}>{item.service.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>{item.service}</Text>
            <Text style={styles.cardUsername}>{item.username}</Text>
          </View>
          <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={24} color={COLORS.textMuted} />
        </View>

        {/* CONTENIDO DESPLEGABLE (ACORDEÓN) */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.passwordField}>
              <Text style={styles.passwordText}>
                {isPasswordVisible ? item.password : '••••••••••••••••'}
              </Text>
              <TouchableOpacity onPress={() => setShowPasswordId(isPasswordVisible ? null : item.id)} style={styles.iconBtn}>
                <Ionicons name={isPasswordVisible ? "eye-off" : "eye"} size={22} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => copyToClipboard(item.username, 'Usuario')}>
                <Ionicons name="person-outline" size={18} color="#60A5FA" />
                <Text style={styles.actionBtnText}>Copiar Usuario</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => copyToClipboard(item.password, 'Contraseña')}>
                <Ionicons name="key-outline" size={18} color="#60A5FA" />
                <Text style={styles.actionBtnText}>Copiar Clave</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* BARRA DE BÚSQUEDA */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar contraseñas..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredPasswords}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB DUAL: Nueva contraseña y Generador */}
      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: '#1E293B', marginBottom: 10, width: 48, height: 48, borderRadius: 24 }]} 
          onPress={() => {
            setShowGenerator(true);
            generatePassword(); // Genera una de inmediato al abrir
          }}
        >
          <Ionicons name="shuffle" size={24} color="#60A5FA" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.fab} onPress={() => alert('Abrir editor de credenciales')}>
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* MODAL DEL GENERADOR DE CONTRASEÑAS */}
      <Modal visible={showGenerator} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="shield-checkmark" size={28} color="#10B981" />
              <Text style={styles.modalTitle}>Generador Seguro</Text>
            </View>

            <View style={styles.generatedBox}>
              <Text style={styles.generatedText} selectable>{generatedPass}</Text>
              <TouchableOpacity onPress={() => copyToClipboard(generatedPass, 'Contraseña')}>
                <Ionicons name="copy-outline" size={24} color="#60A5FA" />
              </TouchableOpacity>
            </View>

            {/* Controles de Configuración */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Longitud ({genLength})</Text>
              <View style={styles.lengthControls}>
                <TouchableOpacity onPress={() => setGenLength(Math.max(8, genLength - 1))} style={styles.lengthBtn}>
                  <Ionicons name="remove" size={20} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setGenLength(Math.min(32, genLength + 1))} style={styles.lengthBtn}>
                  <Ionicons name="add" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Mayúsculas (A-Z)</Text>
              <Switch value={genUpper} onValueChange={setGenUpper} trackColor={{ false: '#334155', true: '#3B82F6' }} />
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Números (0-9)</Text>
              <Switch value={genNumbers} onValueChange={setGenNumbers} trackColor={{ false: '#334155', true: '#3B82F6' }} />
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Símbolos (@#$%)</Text>
              <Switch value={genSymbols} onValueChange={setGenSymbols} trackColor={{ false: '#334155', true: '#3B82F6' }} />
            </View>

            <Button label="Generar Nueva" onPress={generatePassword} variant="outline" style={{ marginTop: 20 }} />
            <Button label="Cerrar" onPress={() => setShowGenerator(false)} style={{ marginTop: 10 }} />
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', margin: SPACING.lg, paddingHorizontal: SPACING.md, borderRadius: 12, height: 50, borderWidth: 1, borderColor: '#334155' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 16 },
  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: 120 },
  
  // Estilos de la Tarjeta
  card: { backgroundColor: '#1E293B', borderRadius: 16, marginBottom: SPACING.md, borderWidth: 1, borderColor: '#334155', overflow: 'hidden' },
  cardExpanded: { borderColor: '#60A5FA' }, // Resalta el borde si está expandida
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg },
  serviceIconContainer: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  serviceIconText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  cardTitleContainer: { flex: 1 },
  cardTitle: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
  cardUsername: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  
  // Contenido Expandido
  expandedContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: SPACING.md },
  passwordField: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0F172A', padding: 12, borderRadius: 8, marginBottom: 12 },
  passwordText: { color: COLORS.text, fontSize: 16, letterSpacing: 2, flex: 1 },
  iconBtn: { padding: 4 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(96, 165, 250, 0.1)', paddingVertical: 10, borderRadius: 8 },
  actionBtnText: { color: '#60A5FA', marginLeft: 8, fontWeight: '600', fontSize: 14 },

  // FAB
  fabContainer: { position: 'absolute', bottom: 30, right: 30, alignItems: 'center' },
  fab: { backgroundColor: '#3B82F6', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8 },

  // Modal del Generador
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E293B', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.xl, elevation: 20 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg, justifyContent: 'center' },
  modalTitle: { color: COLORS.text, fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  generatedBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', padding: SPACING.md, borderRadius: 12, borderWidth: 1, borderColor: '#60A5FA', marginBottom: SPACING.xl },
  generatedText: { flex: 1, color: '#FFF', fontSize: 18, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', textAlign: 'center' },
  
  // Controles
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  settingLabel: { color: COLORS.text, fontSize: 16 },
  lengthControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  lengthBtn: { backgroundColor: '#334155', width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
});