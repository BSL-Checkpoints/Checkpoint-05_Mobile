/**
 * Sessão do comprador. A identidade vem do BACKEND: signIn -> /auth/login,
 * signUp -> /auth/register. Ambos guardam o customerToken (via setCustomerToken)
 * e o cliente, e alimentam a guarda de rotas (isLoggedIn).
 *
 * CP5: a sessão agora é PERSISTIDA no SecureStore (cofre do sistema). Sem isso,
 * fechar o app apagaria o login — e a notificação que abre o app fechado não
 * teria cliente para mostrar o produto.
 *
 * `isRestoring` é true enquanto lemos o cofre. Sem ele a tela de login piscaria
 * por um instante para quem JÁ estava logado.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useQueryClient } from '@tanstack/react-query';
import { setCustomerToken, setUnauthorizedHandler } from '@/services/http';
import { login as loginService, register as registerService } from '@/services/auth';
import { queryKeys } from '@/lib/queryKeys';
import type { AuthResponse, Customer } from '@/types/api';

const STORAGE_KEY = 'lojaturma.session.v1';

interface SessionValue {
  customer: Customer | null;
  isLoggedIn: boolean;
  /** true enquanto a sessão salva está sendo lida do cofre (início do app). */
  isRestoring: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const queryClient = useQueryClient();

  const clearSession = useCallback(() => {
    setCustomerToken(null);
    setCustomer(null);
    SecureStore.deleteItemAsync(STORAGE_KEY).catch(() => {});
    // O carrinho era daquele cliente — some do cache.
    queryClient.removeQueries({ queryKey: queryKeys.cart.all });
  }, [queryClient]);

  const startSession = useCallback((res: AuthResponse) => {
    setCustomerToken(res.token); // passa a ir em toda request
    setCustomer(res.customer);
    // Melhor esforço: se o cofre falhar, o login vale só até fechar o app.
    SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify({ token: res.token, customer: res.customer })).catch(() => {});
  }, []);

  // Restaura a sessão salva ao abrir o app.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(STORAGE_KEY);
        if (!raw || cancelled) return;
        const saved = JSON.parse(raw) as Partial<AuthResponse>;
        if (saved.token && saved.customer) {
          setCustomerToken(saved.token);
          setCustomer(saved.customer);
        }
      } catch {
        // Sessão ilegível: segue deslogado, sem quebrar.
      } finally {
        if (!cancelled) setIsRestoring(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Token expirado/revogado: qualquer 401 com sessão ativa derruba o login.
  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const value = useMemo<SessionValue>(
    () => ({
      customer,
      isLoggedIn: customer !== null,
      isRestoring,
      async signIn(email, password) {
        startSession(await loginService(email, password));
      },
      async signUp(name, email, password) {
        startSession(await registerService(name, email, password));
      },
      signOut: clearSession,
    }),
    [customer, isRestoring, startSession, clearSession],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession precisa estar dentro de <SessionProvider>.');
  return ctx;
}
