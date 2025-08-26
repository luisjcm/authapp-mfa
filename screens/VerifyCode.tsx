import React from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';

type Props = {
  onVerify: (code: string) => void;
  onResend?: () => void;
  destination?: string;
};

export default function VerifyCode({ onVerify, onResend, destination }: Props) {
  const [code, setCode] = React.useState('');

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Verifica el código</Text>
      {!!destination && (
        <Text style={{ color:'#9ca3af', marginBottom:4 }}>
          Te enviamos un código a {destination}
        </Text>
      )}
      <TextInput
        placeholder="123456"
        placeholderTextColor="#9ca3af"
        style={styles.input}
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={6}
      />
      <Pressable style={styles.btn} onPress={() => code.length === 6 && onVerify(code)}>
        <Text style={styles.btnTxt}>Confirmar</Text>
      </Pressable>
      {!!onResend && (
        <Pressable onPress={onResend}>
          <Text style={{ color:'#a3e635', marginTop:8 }}>Reenviar código</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{ gap:12 },
  title:{ color:'white', fontSize:20, fontWeight:'700' },
  input:{ backgroundColor:'#111827', color:'white', padding:12, borderRadius:10, borderWidth:1, borderColor:'#1f2937', minWidth:260, letterSpacing:4, textAlign:'center' },
  btn:{ backgroundColor:'#22c55e', padding:12, borderRadius:10, alignItems:'center' },
  btnTxt:{ fontWeight:'700', color:'#0b111f' }
});
