// App.tsx
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation';
import BiometricGate from './src/screens/BiometricGate';

export default function App() {
  return (
    // SafeAreaProvider calcula los márgenes físicos del teléfono (Notch, barra de gestos)
    <SafeAreaProvider>
      <StatusBar style="light" />
        <BiometricGate>
          <RootNavigator />
        </BiometricGate>
    </SafeAreaProvider>
  );
}