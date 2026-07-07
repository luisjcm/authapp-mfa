import * as SecureStore from 'expo-secure-store';
import { TotpAccount } from './totpParser';

// La "llave maestra" interna bajo la cual guardaremos el arreglo de cuentas
const VAULT_KEY = 'mfa_vault_accounts';

export const saveAccounts = async (accounts: TotpAccount[]) => {
  try {
    const jsonValue = JSON.stringify(accounts);
    // Guarda el string cifrado en el llavero nativo del sistema operativo (Keychain/Keystore)
    await SecureStore.setItemAsync(VAULT_KEY, jsonValue);
  } catch (error) {
    console.error("Error encriptando y guardando las cuentas:", error);
  }
};

export const loadAccounts = async (): Promise<TotpAccount[]> => {
  try {
    const jsonValue = await SecureStore.getItemAsync(VAULT_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error("Error desencriptando las cuentas:", error);
    return [];
  }
};