import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { COLORS, SPACING } from '../theme';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { RootStackScreenProps } from '../navigation/types';
import { loadAccounts, saveAccounts } from '../utils/storage';
import { TotpAccount } from '../utils/totpParser';

type Props = RootStackScreenProps<'ManualSetup'>;

export default function ManualSetup({ navigation }: Props) {
  const [issuer, setIssuer] = useState(''); // Ej: GitHub, Google
  const [account, setAccount] = useState(''); // Ej: ljcm47@gmail.com
  const [secret, setSecret] = useState(''); // Ej: JBSWY3DPEHPK3PXP
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async() => {

    const newAccount: TotpAccount = {
    id: Date.now().toString(), // Generamos un ID único
    issuer: issuer,
    label: account,
    secret: secret.replace(/\s+/g, '').toUpperCase(), // Limpiamos espacios por seguridad
    period: 30,
    digits: 6,
    algorithm: 'SHA1'
    };

// 2. Traemos las cuentas que ya existen en el teléfono
const existingAccounts = await loadAccounts();

// 3. Agregamos la nueva cuenta al arreglo
const updatedAccounts = [...existingAccounts, newAccount];

// 4. Guardamos todo de vuelta en el almacenamiento
await saveAccounts(updatedAccounts);
    setError('');
    
    // Validaciones básicas
    if (!issuer.trim() || !account.trim() || !secret.trim()) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    // El secret de TOTP suele ser alfanumérico sin espacios
    if (secret.includes(' ')) {
      setError('La clave secreta no debe contener espacios.');
      return;
    }

    setIsLoading(true);

    // Aquí irá la lógica para guardar el token en el almacenamiento local
    setTimeout(() => {
      setIsLoading(false);
      // Regresamos a la pantalla principal después de guardar
      navigation.goBack();
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        
        <View style={styles.headerContainer}>
          <Text style={styles.logoText}>Ingreso Manual</Text>
          <Text style={styles.subtitleText}>
            Agrega los detalles de tu cuenta y la clave secreta proporcionada por el servicio.
          </Text>
        </View>

        <Input
          label="Proveedor / Emisor"
          placeholder="Ej: GitHub, Binance, Google"
          value={issuer}
          onChangeText={setIssuer}
          editable={!isLoading}
        />

        <Input
          label="Nombre de la cuenta"
          placeholder="Ej: usuario@correo.com"
          value={account}
          onChangeText={setAccount}
          keyboardType="email-address"
          editable={!isLoading}
          autoCapitalize="none"
        />

        <Input
          label="Clave secreta (Base32)"
          placeholder="Ej: JBSWY3DPEHPK3PXP"
          value={secret}
          onChangeText={text => setSecret(text.toUpperCase())} // Las claves suelen estar en mayúsculas
          editable={!isLoading}
          error={error}
          autoCapitalize="characters"
        />

        <Button
          label="Guardar Cuenta"
          onPress={handleSave}
          isLoading={isLoading}
          style={styles.buttonSpacer}
        />

        <Button
          label="Cancelar"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={styles.cancelButton}
        />

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  headerContainer: {
    marginBottom: SPACING.xl,
  },
  logoText: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitleText: {
    color: COLORS.textMuted,
    fontSize: 15,
    marginTop: SPACING.xs,
  },
  buttonSpacer: {
    marginTop: SPACING.lg,
  },
  cancelButton: {
    marginTop: SPACING.md,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#334155',
  }
});