import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTES_KEY = '@secure_notes';

export interface SecureNote {
  id: string;
  title: string;
  content: string;
  isArchived: boolean;
  updatedAt: string; // Para mostrar la fecha
}

export const loadNotes = async (): Promise<SecureNote[]> => {
  try {
    const data = await AsyncStorage.getItem(NOTES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error cargando notas", error);
    return [];
  }
};

export const saveNotes = async (notes: SecureNote[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error("Error guardando notas", error);
  }
};

export const deleteNote = async (id: string): Promise<void> => {
  try {
    const notes = await loadNotes();
    const updatedNotes = notes.filter(note => note.id !== id);
    await saveNotes(updatedNotes);
  } catch (error) {
    console.error("Error eliminando nota", error);
  }
};