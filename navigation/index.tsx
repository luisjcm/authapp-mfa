import { mockVerify, TEST_CODE } from '../lib/mock';


import React from 'react';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../screens/Home';
import Login from '../screens/Login';
import VerifyCode from '../screens/VerifyCode';
import Done from '../screens/Done'; // o '../screens/done' si tu archivo está en minúsculas

import { View, Text } from 'react-native';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Verify: { destination: string };
  Done: undefined;  
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const MyTheme: Theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: '#0f172a',
    card: '#111827',
    text: '#ffffff',
    border: '#1f2937',
    primary: '#22c55e',
    notification: '#22c55e',
  },
};



function LoginScreenWrapper({ navigation }: any) {
  return <Login onSubmit={(value) => navigation.navigate('Verify', { destination: value })} />;
}

function VerifyScreenWrapper({ navigation, route }: any) {
  const { destination } = route.params;
  return (
    <VerifyCode
      destination={destination}
      onVerify={async (code) => {
        await mockVerify(code);          // valida contra TEST_CODE
        navigation.replace('Done');      // éxito
      }}
      onResend={() => {
        console.log('TEST_CODE:', TEST_CODE); // útil para recordar el código en dev
      }}
    />
  );
}

function DoneScreenWrapper({ navigation }: any) {
  return <Done onGoHome={() => navigation.navigate('Home')} />;
}

export default function RootNavigator() {
  return (
    <NavigationContainer theme={MyTheme}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#111827' },
          headerTintColor: '#fff',
          contentStyle: { backgroundColor: '#0f172a' },
        }}
      >
        <Stack.Screen name="Home" component={Home} options={{ title: 'Inicio' }} />
        <Stack.Screen name="Login" component={LoginScreenWrapper} options={{ title: 'Iniciar sesión' }} />
        <Stack.Screen name="Verify" component={VerifyScreenWrapper} options={{ title: 'Verificación' }} />
        <Stack.Screen name="Done" component={DoneScreenWrapper} options={{ title: 'Listo' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
