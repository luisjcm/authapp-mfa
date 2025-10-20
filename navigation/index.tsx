// src/navigation/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  NavigationContainer,
  DefaultTheme,
  Theme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BiometricGate from "../components/BiometricGate";

import { COLORS } from '../theme';


// PANTALLAS
import Home from "../screens/Home";
import EmailScreen from "../screens/EmailScreen";
import OtpScreen from "../screens/OtpScreen";
import Done from "../screens/Done";
import AboutScreen from "../screens/AboutScreen"; 
import AuthenticatorScreen from "../screens/AuthenticatorScreen";
import AddTokenScreen from "../screens/AddTokenScreen";

// API (cliente front, NO del server)
import { requestOtp, verifyOtp, resendOtp } from "../server/src/api/auth";
import HomeRedesignMockup from "../screens/HomeRedesignMockup";



const FORCE_HOME = process.env.EXPO_PUBLIC_FORCE_HOME === "true";
const DEMO_MODE = true;

export type RootStackParamList = {
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
    primary: COLORS.primary,        // 🔵 <- clave
    notification: COLORS.primary,   // si quieres mismo tono para badges
  },
};

export default function RootNavigator() {
  const [session, setSession] = useState<{ email: string } | null>(
    FORCE_HOME ? { email: "demo@authapp.dev" } : null
  );
  const [checking, setChecking] = useState(!FORCE_HOME);

  // Carga de sesión al abrir la app
  useEffect(() => {
    if (FORCE_HOME) return;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("session");
        if (raw) setSession(JSON.parse(raw));
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  // Ruta inicial según sesión
  const initialRoute = useMemo<keyof RootStackParamList>(() => {
    if (FORCE_HOME) return "Home";
    return session ? "Home" : "Email";
  }, [session]);

  // Wrappers para inyectar tu API + persistencia
  function EmailScreenWrapper({ navigation }: any) {
    return (
      <EmailScreen
        onSubmit={async (email: string) => {
          const clean = email.trim();
          await requestOtp(clean);
          navigation.navigate("Otp", { email: clean });
        }}
      />
    );
  }

  function OtpScreenWrapper({ navigation, route }: any) {
    const { email } = route.params as { email: string };
    return (
      <OtpScreen
        email={email}
        onVerify={async (code: string) => {
          await verifyOtp(email, code);
          const sess = { email };
          await AsyncStorage.setItem("session", JSON.stringify(sess));
          setSession(sess);
          navigation.replace("Done");
        }}
        onResend={async () => {
          await resendOtp(email);
        }}
      />
    );
  }

  function DoneScreenWrapper({ navigation }: any) {
    const goHome = () => {
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    };
    return <Done onGoHome={goHome} />;
  }

  if (checking) {
    return null; // Splash opcional
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
        
        <Stack.Screen
  name="Home"
  options={{ title: "AuthApp" }}
>
  {(props) => (
    <BiometricGate prompt="Confirma con biometría o patrón" demoMode={DEMO_MODE}>
      <HomeRedesignMockup {...props} />
    </BiometricGate>
  )}
</Stack.Screen>
        <Stack.Screen name="Email" component={EmailScreenWrapper} options={{ title: "Iniciar sesión" }} />
        <Stack.Screen name="Otp" component={OtpScreenWrapper} options={{ title: "Código OTP" }} />
        <Stack.Screen name="Done" component={DoneScreenWrapper} options={{ headerShown: false }} />

        {/* 👇 NUEVAS RUTAS (ya tipadas arriba) */}
        <Stack.Screen name="Authenticator" component={AuthenticatorScreen} options={{ title: "Códigos TOTP" }} />
        <Stack.Screen name="AddToken" component={AddTokenScreen} options={{ title: "Escanear QR" }} />

        <Stack.Screen name="About" component={AboutScreen} options={{ title: "Acerca de" }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
