// src/navigation/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  NavigationContainer,
  DefaultTheme,
  Theme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { COLORS } from '../theme';

// 🌟 Importamos SÓLO las pantallas de la prueba de fuego
import Home from "../screens/Home";
import Login from "../screens/Login";

export type RootStackParamList = {
  Login: undefined;
  VerifyCode: { email: string };
  Home: undefined;
  Email: undefined;
  Otp: { email: string };
  Done: undefined;
  Authenticator: undefined; 
  AddToken: undefined;      
  About: undefined;         
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const MyTheme: Theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.bg,
    card: COLORS.card,
    text: COLORS.text,
    border: COLORS.border,
    primary: COLORS.primary,
    notification: COLORS.primary,
  },
};

export default function RootNavigator() {
  const [session, setSession] = useState<{ email: string } | null>(null);
  const [checking, setChecking] = useState(true);

  // Carga de sesión al abrir la app
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("session");
        if (raw) setSession(JSON.parse(raw));
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  const initialRoute = useMemo<keyof RootStackParamList>(() => {
    return session ? "Home" : "Login";
  }, [session]);

  if (checking) {
    return null; 
  }

  return (
    <NavigationContainer theme={MyTheme}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.card },
          headerTintColor: COLORS.text,
          contentStyle: { backgroundColor: COLORS.bg },
        }}
      >
        {/* 🌟 Registramos las pantallas limpiamente */}
        <Stack.Screen 
          name="Home" 
          component={Home} 
          options={{ title: "AuthApp" }} 
        />
        
        <Stack.Screen 
          name="Login" 
          component={Login} 
          options={{ title: "Iniciar sesión" }} 
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}