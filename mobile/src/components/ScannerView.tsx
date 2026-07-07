import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

interface ScannerProps {
  onScan: (data: string) => void;
  onCancel: () => void;
}

export default function ScannerView({ onScan, onCancel }: ScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.message}>Necesitamos acceso a la cámara</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Conceder permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={(result) => onScan(result.data)}
      />
      {/* Overlay oscuro con agujero transparente en el medio */}
      <View style={styles.overlay}>
        <View style={styles.unfocusedContainer} />
        <View style={styles.middleContainer}>
          <View style={styles.unfocusedContainer} />
          <View style={styles.focusedSquare}>
            {/* Esquinas del escáner */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <View style={styles.unfocusedContainer} />
        </View>
        <View style={styles.unfocusedContainer} />
      </View>

      {/* Botón de Cancelar */}
      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  message: { color: '#FFF', marginBottom: 20, fontSize: 16 },
  permissionBtn: { backgroundColor: '#3B82F6', padding: 12, borderRadius: 8 },
  permissionBtnText: { color: '#FFF', fontWeight: 'bold' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  unfocusedContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  middleContainer: { flexDirection: 'row', height: 250 },
  focusedSquare: { width: 250, height: 250, backgroundColor: 'transparent', position: 'relative' },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#3B82F6', borderWidth: 4 },
  cornerTL: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 16 },
  cornerTR: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 16 },
  cornerBL: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 16 },
  cornerBR: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 16 },
  cancelButton: { position: 'absolute', bottom: 50, alignSelf: 'center', backgroundColor: '#3B82F6', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
  cancelText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});