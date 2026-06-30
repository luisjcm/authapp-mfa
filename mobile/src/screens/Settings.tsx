import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';
export default function Settings() {
  return <View style={styles.c}><Text style={styles.t}>⚙️ Settings</Text></View>;
}
const styles = StyleSheet.create({ c: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }, t: { color: COLORS.text, fontSize: 18 } });