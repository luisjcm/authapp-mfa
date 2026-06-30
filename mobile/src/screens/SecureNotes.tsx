import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';
export default function SecureNotes() {
  return <View style={styles.c}><Text style={styles.t}>📝 Notas Seguras (Cifradas)</Text></View>;
}
const styles = StyleSheet.create({ c: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }, t: { color: COLORS.text, fontSize: 18 } });