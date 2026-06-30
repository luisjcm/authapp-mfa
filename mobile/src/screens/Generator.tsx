import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';
export default function Generator() {
  return <View style={styles.c}><Text style={styles.t}>⚙️ Generador de Claves Robustas</Text></View>;
}
const styles = StyleSheet.create({ c: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }, t: { color: COLORS.text, fontSize: 18 } });