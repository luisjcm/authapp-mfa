// src/navigation/types.ts
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// 1. Declaramos el diccionario sagrado de rutas de la app.
//    - undefined significa que la pantalla no requiere parámetros para abrirse.
//    - Si requiere algo (como el email para validar el OTP), lo tipamos explícitamente.
export type RootStackParamList = {
  Login: undefined;
  VerifyCode: { email: string }; 
  Home: undefined;
};

export type HomeTabParamList = {
  Vault: undefined;      // Mi caja fuerte (MFA tokens)
  SecureNotes: undefined; // Tu nueva sección de Notas Seguras (Send)
  Generator: undefined;   // Generador de claves
  Settings: undefined;    // Ajustes de la app
};

// 2. Helper global para tipar las props que React Navigation inyecta en cada pantalla
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

  // Este helper avanzado combina el tipado del Tab con el del Stack principal, 
// permitiendo que una pestaña pueda hacer "navigation.reset" al Login para cerrar sesión.
  export type HomeTabScreenProps<T extends keyof HomeTabParamList> = 
  CompositeScreenProps<
    BottomTabScreenProps<HomeTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;