import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../components/ui/Button'; // Ajusta la ruta si es necesario

// Tipado básico (asumiendo que tu navigation ya pasa por props)
export default function Settings({ navigation }: any) {
  
  const handleLogout = () => {
    // Aquí a futuro borraremos los tokens de expo-secure-store
    
    // Destruimos la pila de navegación y regresamos al Login
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajustes de Seguridad</Text>
      
      <View style={styles.content}>
        {/* Aquí irán tus opciones futuras (biometría, cambiar PIN, etc.) */}
      </View>

      <Button 
        label="Cerrar Sesión" 
        variant="danger"
        onPress={handleLogout} 
        // Si tu componente Button soporta estilos/colores de peligro, úsalos aquí
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0F172A', // Color oscuro de tu tema
    justifyContent: 'space-between', // Empuja el botón al fondo
  },
  title: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    marginTop: 20,
  }
});