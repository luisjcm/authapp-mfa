// src/screens/ScanScreen.tsx (fragmento)
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { parseOtpauthUri } from '../server/src/utils/totp';
import { useTotp } from '../server/src/state/TotpStore';

const { addAccount } = useTotp();

async function handleScanned(content: string, closeCamera: () => void) {
  try {
    const parsed = parseOtpauthUri(content);
    if (!parsed) throw new Error('El código QR no es válido (otpauth://totp requerido).');

    await addAccount(parsed, async (existing) => {
      return new Promise<'skip' | 'replace'>((resolve) => {
        const title = 'Cuenta ya existente';
        const name = `${existing.issuer || 'SinIssuer'} - ${existing.label}`;
        Alert.alert(title, `Ya tienes "${name}". ¿Deseas reemplazarla?`, [
          { text: 'Cancelar', style: 'cancel', onPress: () => resolve('skip') },
          { text: 'Reemplazar', style: 'destructive', onPress: () => resolve('replace') },
        ]);
      });
    });

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    closeCamera(); // auto-cerrar cámara tras alta OK
  } catch (e: any) {
    Alert.alert('QR inválido', e?.message || 'No se pudo leer un otpauth://totp válido.');
    // Mantener cámara abierta para reintento
  }
}
