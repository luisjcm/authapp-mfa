// src/services/storage.ts
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TotpAccount } from '../utils/totp';

type TotpMeta = Omit<TotpAccount, 'secret'>;

const LIST_KEY = 'totp:accounts:v1';
const SECRET_KEY = (id: string) => `totp:secret:${id}`;

export async function loadAccounts(): Promise<TotpMeta[]> {
  const raw = await AsyncStorage.getItem(LIST_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as TotpMeta[]; } catch { return []; }
}

export async function saveAccounts(accounts: TotpMeta[]) {
  await AsyncStorage.setItem(LIST_KEY, JSON.stringify(accounts));
}

export async function saveSecret(id: string, secretB32: string) {
  await SecureStore.setItemAsync(SECRET_KEY(id), secretB32, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
  });
}

export async function getSecret(id: string) {
  return SecureStore.getItemAsync(SECRET_KEY(id));
}

export async function deleteSecret(id: string) {
  await SecureStore.deleteItemAsync(SECRET_KEY(id));
}
