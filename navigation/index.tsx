import React from 'react';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../screens/home';
import Login from '../screens/login';
import VerifyCode from '../screens/VerifyCode';
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

function DoneScreen() {
  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
      <Text style={{ color:'#fff', fontSize:22, fontWeight:'700' }}>✅ Sesión verificada</Text>
    </View>
  );
}

function LoginScreenWrapper({ navigation }: any) {
  return <Login onSubmit={(value) => navigation.navigate('Verify', { destination: value })} />;
}

function VerifyScreenWrapper({ navigation, route }: any) {
  const { destination } = route.params;
  return (
    <VerifyCode
      destination={destination}
      onVerify={(code) => { if (code.length === 6) navigation.replace('Done'); }}
      onResend={() => {}}
    />
  );
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
        <Stack.Screen name="Done" component={DoneScreen} options={{ title: 'Listo' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
