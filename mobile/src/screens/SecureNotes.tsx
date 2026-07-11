import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl, 
  Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING } from '../theme';
import { RootStackScreenProps } from '../navigation/types';

import { useFocusEffect } from '@react-navigation/native';
import { loadNotes, SecureNote, deleteNote } from '../utils/notesStorage'; 

type Props = RootStackScreenProps<'SecureNotes'>;

// Mock de datos temporales (Luego esto vendrá desencriptado del storage/backend)


export default function SecureNotes({ navigation }: Props) {
  const [notes, setNotes] = useState<SecureNote[]>([]); // Estado real
  const [refreshing, setRefreshing] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const [noteToDelete, setNoteToDelete] = useState<SecureNote | null>(null);

  // Cargar notas al entrar a la pantalla
  useFocusEffect(
    useCallback(() => {
      fetchNotes();
    }, [])
  );

  const fetchNotes = async () => {
    const data = await loadNotes();
    setNotes(data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchNotes(); // Leemos la DB local real
    setRefreshing(false);
  };

  // Función para confirmar y ejecutar la eliminación
  const confirmDelete = async () => {
    if (!noteToDelete) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await deleteNote(noteToDelete.id);
    
    // Actualizamos el estado local instantáneamente para que desaparezca de la pantalla
    setNotes(prevNotes => prevNotes.filter(n => n.id !== noteToDelete.id));
    setNoteToDelete(null);
  };
    

  const filteredNotes = notes.filter(note => note.isArchived === showArchived);

  const renderNoteCard = ({ item }: { item: SecureNote }) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('NoteEditor', { noteId: item.id })}
      // Agregamos el evento de dejar presionado
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setNoteToDelete(item);
      }}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Ionicons name="lock-closed" size={16} color={COLORS.textMuted} />
      </View>
      <Text style={styles.cardPreview} numberOfLines={2}>{item.content}</Text>
      <Text style={styles.cardDate}>{item.updatedAt}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header de Filtros */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterTab, !showArchived && styles.filterTabActive]}
          onPress={() => setShowArchived(false)}
        >
          <Text style={[styles.filterText, !showArchived && styles.filterTextActive]}>Activas</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, showArchived && styles.filterTabActive]}
          onPress={() => setShowArchived(true)}
        >
          <Text style={[styles.filterText, showArchived && styles.filterTextActive]}>Archivadas</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        renderItem={renderNoteCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#60A5FA"
            colors={['#60A5FA']}
            progressBackgroundColor="#1E293B"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#334155" />
            <Text style={styles.emptyText}>No hay notas en esta sección.</Text>
          </View>
        }
      />

      {/* FAB para crear nota nueva */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.navigate('NoteEditor', {});
        }}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal visible={!!noteToDelete} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="warning-outline" size={40} color="#EF4444" style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Eliminar nota</Text>
            <Text style={styles.modalText}>
              ¿Seguro que deseas eliminar la nota <Text style={styles.boldText}>"{noteToDelete?.title}"</Text>? Esta acción no se puede deshacer.
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setNoteToDelete(null)}>
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnDelete} onPress={confirmDelete}>
                <Text style={styles.modalBtnDeleteText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  filterContainer: { flexDirection: 'row', padding: SPACING.md, backgroundColor: '#1E293B', borderBottomWidth: 1, borderBottomColor: '#334155' },
  filterTab: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center' },
  filterTabActive: { borderBottomWidth: 2, borderBottomColor: '#60A5FA' },
  filterText: { color: COLORS.textMuted, fontSize: 15, fontWeight: '600' },
  filterTextActive: { color: '#60A5FA' },
  listContent: { padding: SPACING.lg, paddingBottom: 100 },
  card: { backgroundColor: '#1E293B', padding: SPACING.lg, borderRadius: 16, marginBottom: SPACING.md, borderWidth: 1, borderColor: '#334155' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  cardTitle: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', flex: 1, marginRight: SPACING.sm },
  cardPreview: { color: COLORS.textMuted, fontSize: 14, lineHeight: 20 },
  cardDate: { color: '#475569', fontSize: 12, marginTop: SPACING.md, textAlign: 'right' },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: COLORS.textMuted, marginTop: SPACING.md, fontSize: 16 },
  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#3B82F6', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8 },

  // Estilos del Modal Oscuro
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#1E293B', width: '85%', padding: 24, borderRadius: 20, elevation: 10 },
  modalIcon: { alignSelf: 'center', marginBottom: 10 },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  modalText: { color: '#94A3B8', fontSize: 15, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  boldText: { fontWeight: 'bold', color: '#FFF' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  modalBtnCancel: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#334155', alignItems: 'center' },
  modalBtnCancelText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  modalBtnDelete: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#EF4444', alignItems: 'center' },
  modalBtnDeleteText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
});