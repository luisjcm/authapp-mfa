import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, Text, View, TextInput, KeyboardAvoidingView, 
  Platform, ScrollView, TouchableOpacity, Modal, Linking 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING } from '../theme';
import Button from '../components/ui/Button';
import { RootStackScreenProps } from '../navigation/types';
import { loadNotes, saveNotes, SecureNote } from '../utils/notesStorage';

type Props = RootStackScreenProps<'NoteEditor'>;

export default function NoteEditor({ route, navigation }: Props) {
  const { noteId } = route.params || {}; 
  const isEditing = !!noteId;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isArchived, setIsArchived] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [secureLink, setSecureLink] = useState('');

  // 1. CARGAR LA NOTA REAL AL ABRIR EL EDITOR
  useEffect(() => {
    if (isEditing) {
      const fetchNote = async () => {
        const notes = await loadNotes();
        const noteToEdit = notes.find(n => n.id === noteId);
        if (noteToEdit) {
          setTitle(noteToEdit.title);
          setContent(noteToEdit.content);
          setIsArchived(noteToEdit.isArchived);
        }
      };
      fetchNote();
    }
  }, [isEditing, noteId]);

  // 2. GUARDAR LA NOTA REALMENTE EN MEMORIA
  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return; // Evitar guardar notas vacías
    
    setIsSaving(true);
    
    const notes = await loadNotes();
    const now = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

    if (isEditing) {
      // Actualizar nota existente
      const updatedNotes = notes.map(n => 
        n.id === noteId ? { ...n, title, content, isArchived, updatedAt: now } : n
      );
      await saveNotes(updatedNotes);
    } else {
      // Crear nota nueva
      const newNote: SecureNote = {
        id: Date.now().toString(),
        title: title || 'Sin título',
        content,
        isArchived,
        updatedAt: now
      };
      await saveNotes([newNote, ...notes]); // La agregamos al principio
    }
    
    setIsSaving(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  const handleToggleArchive = async () => {
    const newArchivedState = !isArchived;
    setIsArchived(newArchivedState);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Si estamos editando, guardamos el estado de archivo de inmediato
    if (isEditing) {
      const notes = await loadNotes();
      const updatedNotes = notes.map(n => 
        n.id === noteId ? { ...n, isArchived: newArchivedState } : n
      );
      await saveNotes(updatedNotes);
    }
  };

  const generateSecureLink = () => {
    setSecureLink('https://tu-boveda.com/n/8x9A2#k9LmPq2...'); // Sigue siendo mock por ahora
  };

  const shareViaWhatsApp = () => {
    if (!secureLink) return;
    const message = `Te he compartido una nota segura y encriptada. Ábrela aquí:\n\n${secureLink}`;
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(message)}`)
      .catch(() => alert('Asegúrate de tener WhatsApp instalado'));
  };

  const copyLink = async () => {
    await Clipboard.setStringAsync(secureLink);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
          <Ionicons name="arrow-back" size={28} color={COLORS.text} />
        </TouchableOpacity>
        
        <View style={styles.toolbarActions}>
          {isEditing && (
            <>
              <TouchableOpacity style={styles.actionIcon} onPress={handleToggleArchive}>
                {/* SOLUCIÓN AL ERROR DEL ÍCONO: Usamos archive y archive-outline */}
                <Ionicons name={isArchived ? "archive" : "archive-outline"} size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionIcon} onPress={() => {
                setShowShareModal(true);
                generateSecureLink();
              }}>
                <Ionicons name="share-social" size={24} color="#60A5FA" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TextInput
          style={styles.titleInput}
          placeholder="Título de la nota..."
          placeholderTextColor="#475569"
          value={title}
          onChangeText={setTitle}
        />
        
        <View style={styles.encryptionBadge}>
          <Ionicons name="shield-checkmark" size={14} color="#10B981" />
          <Text style={styles.encryptionText}> Encriptación AES-256 (Pendiente)</Text>
        </View>

        <TextInput
          style={styles.contentInput}
          placeholder="Escribe tu información confidencial aquí..."
          placeholderTextColor="#475569"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        <Button 
          label={isEditing ? "Actualizar Nota Segura" : "Guardar Nota Segura"} 
          onPress={handleSave} 
          isLoading={isSaving} 
          style={{ marginTop: SPACING.xl }}
        />
      </ScrollView>

      {/* ... (EL MODAL DE COMPARTIR SE QUEDA EXACTAMENTE IGUAL) ... */}
      <Modal visible={showShareModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="lock-closed" size={30} color="#10B981" />
              <Text style={styles.modalTitle}>Compartir Nota Segura</Text>
            </View>
            <Text style={styles.modalDescription}>
              Se ha generado una llave de cifrado temporal. Tu servidor no podrá leer esta nota.
            </Text>
            <View style={styles.linkBox}>
              <Text style={styles.linkText} numberOfLines={1}>{secureLink || 'Generando enlace...'}</Text>
              <TouchableOpacity onPress={copyLink}>
                <Ionicons name="copy-outline" size={24} color="#60A5FA" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.whatsappBtn} onPress={shareViaWhatsApp}>
              <Ionicons name="logo-whatsapp" size={24} color="#FFF" />
              <Text style={styles.whatsappText}>Enviar por WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowShareModal(false)}>
              <Text style={styles.closeBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ... (LOS ESTILOS SE QUEDAN EXACTAMENTE IGUAL) ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: 50, paddingBottom: SPACING.sm, backgroundColor: '#1E293B', borderBottomWidth: 1, borderBottomColor: '#334155' },
  toolbarActions: { flexDirection: 'row', alignItems: 'center' },
  actionIcon: { marginLeft: SPACING.lg, padding: 5 },
  scrollContent: { flexGrow: 1, padding: SPACING.lg },
  titleInput: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.xs },
  encryptionBadge: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg, backgroundColor: 'rgba(16, 185, 129, 0.1)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  encryptionText: { color: '#10B981', fontSize: 12, fontWeight: '600' },
  contentInput: { flex: 1, minHeight: 300, fontSize: 16, color: COLORS.text, lineHeight: 24 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E293B', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.xl, elevation: 20 },
  modalHeader: { alignItems: 'center', marginBottom: SPACING.md },
  modalTitle: { color: COLORS.text, fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  modalDescription: { color: COLORS.textMuted, textAlign: 'center', fontSize: 14, marginBottom: SPACING.xl, lineHeight: 20 },
  linkBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', padding: SPACING.md, borderRadius: 12, borderWidth: 1, borderColor: '#334155', marginBottom: SPACING.lg },
  linkText: { flex: 1, color: '#60A5FA', fontSize: 14, marginRight: 10 },
  whatsappBtn: { flexDirection: 'row', backgroundColor: '#25D366', padding: SPACING.md, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  whatsappText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  closeBtn: { padding: SPACING.md, alignItems: 'center' },
  closeBtnText: { color: COLORS.textMuted, fontSize: 16, fontWeight: 'bold' }
});