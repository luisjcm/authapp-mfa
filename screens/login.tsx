import React from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';

type Props = { onSubmit: (value: string) => void };

export default function Login({ onSubmit }: Props) {
  const [value, setValue] = React.useState('');

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Iniciar sesión</Text>
      <TextInput
        placeholder="Email o teléfono"
        placeholderTextColor="#9ca3af"
        style={styles.input}
        value={value}
        onChangeText={setValue}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Pressable
        style={styles.btn}
        onPress={() => value.trim() && onSubmit(value.trim())}
      >
        <Text style={styles.btnTxt}>Enviar código</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{ gap:12 },
  title:{ color:'white', fontSize:20, fontWeight:'700' },
  input:{ backgroundColor:'#111827', color:'white', padding:12, borderRadius:10, borderWidth:1, borderColor:'#1f2937', minWidth:260 },
  btn:{ backgroundColor:'#22c55e', padding:12, borderRadius:10, alignItems:'center' },
  btnTxt:{ fontWeight:'700', color:'#0b111f' }
});
