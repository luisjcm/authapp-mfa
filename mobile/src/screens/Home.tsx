// src/screens/Home.tsx
import { ComponentProps } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // Íconos premium nativos de Expo
import { COLORS } from '../theme';
import { HomeTabParamList } from '../navigation/types';

// Importamos los cascarones de las pestañas
import Vault from './Vault';
import SecureNotes from './SecureNotes';
import Generator from './Generator';
import Settings from './Settings'; // Reutilizaremos el que ya tenías o creamos uno básico

const Tab = createBottomTabNavigator<HomeTabParamList>();

export default function Home() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Configuración de los íconos de forma dinámica y estricta
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: ComponentProps<typeof Ionicons>['name'] = 'square';

          if (route.name === 'Vault') {
            iconName = focused ? 'lock-closed' : 'lock-closed-outline';
          } else if (route.name === 'SecureNotes') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Generator') {
            iconName = focused ? 'refresh-circle' : 'refresh-circle-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        // Estilización de la barra inferior al estilo Bitwarden (Tema oscuro)
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopWidth: 1,
          borderTopColor: '#1e293b', // Un gris sutil para dividir
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        headerStyle: {
          backgroundColor: COLORS.card,
        },
        headerTintColor: COLORS.text,
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen 
        name="Vault" 
        component={Vault} 
        options={{ title: 'Mi Caja Fuerte' }} 
      />
      <Tab.Screen 
        name="SecureNotes" 
        component={SecureNotes} 
        options={{ title: 'Notas Seguras' }} 
      />
      <Tab.Screen 
        name="Generator" 
        component={Generator} 
        options={{ title: 'Generador' }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={Settings} 
        options={{ title: 'Ajustes' }} 
      />
    </Tab.Navigator>
  );
}