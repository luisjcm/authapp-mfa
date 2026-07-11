// src/navigation/index.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { COLORS } from '../theme';

// Importamos nuestros cascarones de pantalla
import Login from '../screens/Login';
import VerifyCode from '../screens/VerifyCode';
import Home from '../screens/Home';
import ManualSetup from '../screens/ManualSetup';
import NoteEditor from '../screens/NoteEditor';

// Le pasamos nuestro mapa de rutas tipado al Stack
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    // NavigationContainer maneja el historial completo y gestos nativos (atrás) del teléfono
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login" // Arrancamos directo en el Login
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.card },
          headerTintColor: COLORS.text,
          headerShadowVisible: false, // Quita la línea divisoria fea nativa
          contentStyle: { backgroundColor: COLORS.background }, // Fondo oscuro para todas las pantallas
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={Login} 
          options={{ headerShown: false }} // Ocultamos la barra superior nativa solo en el login
        />
        <Stack.Screen 
          name="VerifyCode" 
          component={VerifyCode} 
          options={{ title: 'Segundo Factor (MFA)' }} 
        />
        <Stack.Screen 
          name="Home" 
          component={Home} 
          options={{ headerShown: false }} // Bloquea volver atrás una vez logueado
        />

        <Stack.Screen 
              name="ManualSetup" 
              component={ManualSetup} 
              options={{ title: 'Ingreso Manual' }} // O headerMode: 'none' si tienes tu propio header
        />

        <Stack.Screen 
          name="NoteEditor" 
          component={NoteEditor} 
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}