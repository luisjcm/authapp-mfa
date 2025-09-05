// src/screens/TotpListScreen.tsx (fragmento)
import React, { useState } from 'react';
import { View, Text, FlatList, Alert, Pressable, Modal, TextInput, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTotp } from '../server/src/state/TotpStore';
import type { TotpAccount } from '../server/src/utils/totp';

export default function TotpListScreen() {
  const { accounts, deleteAccount, editAccount } = useTotp();
  const [editing, setEditing] = useState<{ id: string; issuer?: string; label: string } | null>(null);
  const [issuer, setIssuer] = useState('');
  const [label, setLabel] = useState('');

  const confirmDelete = (id: string) => {
    Alert.alert('Eliminar cuenta', '¿Seguro que deseas eliminar esta cuenta TOTP?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteAccount(id) },
    ]);
  };

  const openEdit = (acc: { id: string; issuer?: string; label: string }) => {
    setIssuer(acc.issuer || '');
    setLabel(acc.label);
    setEditing(acc);
  };

  const submitEdit = async () => {
    if (!editing) return;
    await editAccount(editing.id, { issuer: issuer.trim() || undefined, label: label.trim() });
    setEditing(null);
  };

  const renderItem = ({ item }: { item: TotpAccount }) => (
    <Swipeable
      renderRightActions={() => (
        <Pressable onPress={() => confirmDelete(item.id)} style={styles.deleteBtn}>
          <Text style={styles.deleteTxt}>Eliminar</Text>
        </Pressable>
      )}>
      <Pressable onLongPress={() => openEdit(item as any)} style={styles.card}>
        <Text style={styles.issuer}>{item.issuer || 'SinIssuer'}</Text>
        <Text style={styles.account}>{item.label}</Text>
      </Pressable>
    </Swipeable>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={accounts as any}
        keyExtractor={(a) => a.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={{ opacity: 0.6 }}>Toca “+” para escanear tu primer QR.</Text>}
      />

      <Modal visible={!!editing} transparent animationType="slide" onRequestClose={() => setEditing(null)}>
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar cuenta</Text>
            <TextInput value={issuer} onChangeText={setIssuer} placeholder="Issuer (opcional)" style={styles.input}/>
            <TextInput value={label} onChangeText={setLabel} placeholder="Label" style={styles.input}/>
            <View style={styles.modalRow}>
              <Pressable onPress={() => setEditing(null)} style={styles.btnSecondary}><Text>Cancelar</Text></Pressable>
              <Pressable onPress={submitEdit} style={styles.btnPrimary}><Text style={{ color: '#fff' }}>Guardar</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card:{ padding:16, backgroundColor:'#0F1420', borderRadius:14, marginBottom:12 },
  issuer:{ color:'#c9d4ff', fontSize:16, fontWeight:'600' },
  account:{ color:'#9fb2ff', marginTop:4 },
  deleteBtn:{ backgroundColor:'#c62828', justifyContent:'center', alignItems:'center', width:96, borderRadius:12, marginVertical:6 },
  deleteTxt:{ color:'#fff', fontWeight:'700' },
  modalWrap:{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', padding:20 },
  modalCard:{ backgroundColor:'#111827', borderRadius:16, padding:16 },
  modalTitle:{ color:'#fff', fontSize:18, fontWeight:'700', marginBottom:8 },
  input:{ backgroundColor:'#1f2937', color:'#fff', padding:10, borderRadius:10, marginTop:8 },
  modalRow:{ flexDirection:'row', justifyContent:'flex-end', gap:12, marginTop:12 },
  btnSecondary:{ paddingVertical:10, paddingHorizontal:16, backgroundColor:'#e5e7eb', borderRadius:10 },
  btnPrimary:{ paddingVertical:10, paddingHorizontal:16, backgroundColor:'#2563eb', borderRadius:10 },
});
