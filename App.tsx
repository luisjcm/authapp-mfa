// App.tsx
import React from 'react';
import RootNavigator from './navigation';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { ActivityIndicator, View, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from './theme'; // opcional si quieres usar tu bg/text aquí

export default function App() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!loaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: COLORS?.bg ?? '#0f172a',
        }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* StatusBar acorde a tu tema */}
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS?.bg ?? '#0f172a'}
        />

          <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
