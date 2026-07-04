import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';
import { useState } from 'react';
import ScannerView from '../components/ScannerView';
import Button from '../components/ui/Button'; // Ajusta la ruta si es necesario


export default function Generator() {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = (data: string) => {
    setIsScanning(false);
    console.log("Secreto capturado:", data);
    // Aquí es donde luego llamaremos a nuestro parser y guardaremos en SecureStore
  };

  if (isScanning) return <ScannerView onScan={handleScan} />;

  return (
    <View style={styles.container}>
      <Button label="Escanear Código QR" onPress={() => setIsScanning(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A', // Ajusta al color de fondo de tu tema
  },
});