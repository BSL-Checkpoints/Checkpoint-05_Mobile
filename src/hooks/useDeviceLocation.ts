/**
 * Posição do aparelho, com os TRÊS desfechos que o CP5 exige (RF-43):
 *
 *   'ok'          permissão concedida E posição obtida
 *   'denied'      permissão negada
 *   'no-position' permissão concedida, mas sem posição (GPS desligado, sem sinal, demorou demais)
 *
 * O terceiro é o que quase todo mundo esquece: o usuário aceita, o GPS nunca
 * responde e a tela fica presa em "Obtendo localização". Por isso a leitura tem
 * TIMEOUT e o hook sempre termina em um status que a tela sabe explicar.
 *
 * REGRA: a tela precisa funcionar SEM a permissão. Aqui isso significa listar os
 * pontos sem ordenar por distância.
 */
import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import type { Coordinate } from '@/types/pickup';

export type LocationStatus = 'loading' | 'ok' | 'denied' | 'no-position';

const POSITION_TIMEOUT_MS = 8000;

/** Rejeita se a promessa não resolver a tempo (getCurrentPositionAsync pode nunca voltar). */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export function useDeviceLocation() {
  const [position, setPosition] = useState<Coordinate | null>(null);
  const [status, setStatus] = useState<LocationStatus>('loading');
  // Se for false, o sistema não mostra mais o diálogo: só nas configurações do aparelho.
  const [canAskAgain, setCanAskAgain] = useState(true);

  const locate = useCallback(async () => {
    setStatus('loading');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      setCanAskAgain(permission.canAskAgain);

      if (!permission.granted) {
        setPosition(null);
        setStatus('denied');
        return;
      }

      // Balanced = ~100 m, resposta rápida e pouca bateria. Basta para "qual ponto é o mais perto".
      const current = await withTimeout(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        POSITION_TIMEOUT_MS,
      ).catch(() => null);

      // Plano B: a última posição conhecida do aparelho.
      const fix = current ?? (await Location.getLastKnownPositionAsync().catch(() => null));

      if (!fix) {
        setPosition(null);
        setStatus('no-position');
        return;
      }

      setPosition({ latitude: fix.coords.latitude, longitude: fix.coords.longitude });
      setStatus('ok');
    } catch {
      setPosition(null);
      setStatus('no-position');
    }
  }, []);

  useEffect(() => {
    locate();
  }, [locate]);

  return { position, status, canAskAgain, retry: locate };
}
