/**
 * Estado da permissão de notificação, sempre ATUAL.
 *
 * A pessoa pode ir às configurações do aparelho, mudar a permissão e voltar. Por isso
 * relemos ao voltar para o app (AppState 'active'): sem isso a tela de perfil
 * mostraria "negada" para uma permissão que já foi concedida.
 */
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { readPermission, requestPermission } from '@/lib/notifications';
import type { NotificationPermission } from '@/types/notifications';

export function useNotificationPermission() {
  // null = ainda lendo (não decide nada enquanto não souber).
  const [permission, setPermission] = useState<NotificationPermission | null>(null);

  const refresh = useCallback(async () => {
    try {
      setPermission(await readPermission());
    } catch {
      setPermission('undetermined');
    }
  }, []);

  const request = useCallback(async () => {
    try {
      const next = await requestPermission();
      setPermission(next);
      return next;
    } catch {
      await refresh();
      return 'undetermined' as const;
    }
  }, [refresh]);

  useEffect(() => {
    refresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  return { permission, request, refresh };
}
