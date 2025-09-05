// src/state/TotpStore.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { TotpAccount } from '../utils/totp';
import { loadAccounts, saveAccounts, saveSecret, deleteSecret } from '../services/storage';

type TotpMeta = Omit<TotpAccount, 'secret'>;
type DuplicateResolution = 'skip' | 'replace';

type TotpContextType = {
  accounts: TotpMeta[];
  addAccount: (
    account: TotpAccount,
    onDuplicate: (existing: TotpMeta) => Promise<DuplicateResolution>
  ) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  editAccount: (id: string, patch: Partial<Pick<TotpMeta, 'issuer' | 'label'>>) => Promise<void>;
};

const Ctx = createContext<TotpContextType | null>(null);

const dupKey = (a: { issuer?: string; label: string }) =>
  `${(a.issuer || 'SinIssuer').toLowerCase()}::${a.label.toLowerCase()}`;

export function TotpProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<TotpMeta[]>([]);

  useEffect(() => { (async () => setAccounts(await loadAccounts()))(); }, []);
  useEffect(() => { saveAccounts(accounts); }, [accounts]);

  const addAccount: TotpContextType['addAccount'] = async (acc, onDuplicate) => {
    const existing = accounts.find(a => dupKey(a) === dupKey(acc));
    if (existing) {
      const decision = await onDuplicate(existing);
      if (decision === 'skip') return;

      // replace: mantener id previo
      const replacement: TotpMeta = {
        id: existing.id,
        label: acc.label,
        issuer: acc.issuer,
        period: acc.period ?? 30,
        digits: acc.digits ?? 6,
        algorithm: acc.algorithm ?? 'SHA1',
      };
      await saveSecret(existing.id, acc.secret);
      setAccounts(prev => prev.map(a => a.id === existing.id ? replacement : a));
      return;
    }

    const meta: TotpMeta = {
      id: acc.id,
      label: acc.label,
      issuer: acc.issuer,
      period: acc.period ?? 30,
      digits: acc.digits ?? 6,
      algorithm: acc.algorithm ?? 'SHA1',
    };
    await saveSecret(acc.id, acc.secret);
    setAccounts(prev => [meta, ...prev]);
  };

  const deleteAccount: TotpContextType['deleteAccount'] = async (id) => {
    await deleteSecret(id);
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const editAccount: TotpContextType['editAccount'] = async (id, patch) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
  };

  const value = useMemo(() => ({ accounts, addAccount, deleteAccount, editAccount }), [accounts]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTotp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTotp debe usarse dentro de TotpProvider');
  return ctx;
}
