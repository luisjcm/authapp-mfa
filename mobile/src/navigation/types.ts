// src/navigation/types.ts
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// 1. Declaramos el diccionario sagrado de rutas de la app.
//    - undefined significa que la pantalla no requiere parámetros para abrirse.
//    - Si requiere algo (como el email para validar el OTP), lo tipamos explícitamente.
export type RootStackParamList = {
  Login: undefined;
  VerifyCode: { email: string }; // 🧠 Obligatorio: no puedes saltar aquí sin pasar el correo
  Home: undefined;
};

// 2. Helper global para tipar las props que React Navigation inyecta en cada pantalla
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;