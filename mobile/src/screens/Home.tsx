// src/screens/Home.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../theme';
import Button from '../components/ui/Button';
import { RootStackScreenProps } from '../navigation/types';

// Tipado estricto
type Props = RootStackScreenProps<'Home'>;

export default function Home({ navigation }: Props) {
  
  const handleLogout = () => {
    // Seguridad extrema: Borramos el historial de navegación al salir
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Acceso Concedido! 🔐</Text>
      <Text style={styles.subtitle}>
        Has superado la autenticación de doble factor y tu conexión está segura.
      </Text>

      <Button 
        label="Cerrar Sesión" 
        variant="outline" 
        onPress={handleLogout} 
        style={styles.buttonSpacer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  title: {
    color: COLORS.primary,
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonSpacer: {
    marginTop: SPACING.xl,
    width: '100%',
  },
});