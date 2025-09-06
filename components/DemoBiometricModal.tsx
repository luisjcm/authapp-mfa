import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, Pressable, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../theme';

type Props = {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  title?: string;
  subtitle?: string;
};

export default function DemoBiometricModal({
  visible,
  onSuccess,
  onCancel,
  title = 'Confirma tu identidad',
  subtitle = 'Simulación para presentación (no solicita FaceID/huella real)',
}: Props) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 800, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [visible]);

  const handleSuccess = async () => {
    try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    onSuccess();
  };

  const handleCancel = async () => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.6)', alignItems:'center', justifyContent:'center', padding:24 }}>
        <View style={{ width:'100%', maxWidth:420, backgroundColor:'#121212', borderRadius:16, padding:20, gap:16 }}>
          <Text style={{ color:'#fff', fontSize:18, fontWeight:'600', textAlign:'center' }}>{title}</Text>
          <Text style={{ color:'#cfcfcf', fontSize:14, textAlign:'center' }}>{subtitle}</Text>

          <View style={{ alignItems:'center', justifyContent:'center', paddingVertical:10 }}>
            <Animated.View style={{ transform:[{ scale: pulse }] }}>
              {/* Ícono simple de huella con “bars”; puedes reemplazar por SVG propio si quieres */}
              <View style={{ width:96, height:96, borderRadius:48, borderWidth:2, borderColor:'#4da3ff', alignItems:'center', justifyContent:'center' }}>
                <View style={{ width:62, height:62, borderRadius:31, borderWidth:2, borderColor:'#4da3ff', opacity:0.9 }} />
                <View style={{ position:'absolute', width:72, height:72, borderRadius:36, borderWidth:2, borderColor:'#4da3ff', opacity:0.5 }} />
              </View>
            </Animated.View>
            <Text style={{ color:'#8fbfff', marginTop:12 }}>Coloca tu dedo (simulado)</Text>
          </View>

          <View style={{ flexDirection:'row', gap:10 }}>
            <Pressable
              onPress={handleCancel}
              style={{ flex:1, paddingVertical:12, borderRadius:10, borderWidth:1, borderColor:'#2a2a2a', backgroundColor:'#1a1a1a', alignItems:'center' }}>
              <Text style={{ color:'#ddd' }}>Cancelar</Text>
            </Pressable>

            <Pressable
              onPress={handleSuccess}
              style={{ flex:1, paddingVertical:12, borderRadius:10, backgroundColor:COLORS.primary, alignItems:'center' }}>
              <Text style={{ color:'#fff', fontWeight:'600' }}>Validar</Text>
            </Pressable>
          </View>

          <Text style={{ color:'#7a7a7a', fontSize:12, textAlign:'center' }}>
            *Para demo en pantalla compartida. La app real usará biometría/patrón del sistema.
          </Text>
        </View>
      </View>
    </Modal>
  );
}