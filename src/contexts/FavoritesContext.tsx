/**
 * FAVORITOS (CP5). Ficam no aparelho (AsyncStorage), separados POR CLIENTE:
 * quem entra com outra conta não vê os favoritos da anterior.
 *
 * `isReady` existe porque a leitura do disco é assíncrona: antes dela a lista
 * está vazia por falta de leitura, não porque a pessoa não tem favoritos.
 * Quem reage a "ganhou o primeiro favorito" (ex.: pedir permissão de
 * notificação) precisa esperar o `isReady`, senão dispara na carga.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSession } from '@/session/session';

export interface FavoriteItem {
  id: string;
  name: string;
}

interface FavoritesValue {
  favorites: FavoriteItem[];
  isReady: boolean;
  isFavorite: (productId: string) => boolean;
  toggle: (item: FavoriteItem) => void;
}

const FavoritesContext = createContext<FavoritesValue | null>(null);

const keyFor = (customerId: string) => `lojaturma.favorites.v1.${customerId}`;

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { customer } = useSession();
  const customerId = customer?.id ?? null;
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Carrega quando o cliente muda (login, logout, troca de conta).
  useEffect(() => {
    let cancelled = false;
    setIsReady(false);
    setFavorites([]);
    if (!customerId) return;

    AsyncStorage.getItem(keyFor(customerId))
      .then((raw) => {
        if (cancelled) return;
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        setFavorites(Array.isArray(parsed) ? (parsed as FavoriteItem[]) : []);
      })
      .catch(() => {
        // Disco ilegível: segue com lista vazia, sem quebrar o app.
      })
      .finally(() => {
        if (!cancelled) setIsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [customerId]);

  const toggle = useCallback(
    (item: FavoriteItem) => {
      if (!customerId) return;
      setFavorites((current) => {
        const next = current.some((f) => f.id === item.id)
          ? current.filter((f) => f.id !== item.id)
          : [...current, item];
        AsyncStorage.setItem(keyFor(customerId), JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [customerId],
  );

  const value = useMemo<FavoritesValue>(
    () => ({
      favorites,
      isReady,
      isFavorite: (productId) => favorites.some((f) => f.id === productId),
      toggle,
    }),
    [favorites, isReady, toggle],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites precisa estar dentro de <FavoritesProvider>.');
  return ctx;
}
