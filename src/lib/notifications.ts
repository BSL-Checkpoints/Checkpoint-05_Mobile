/**
 * CONFIGURAÇÃO GLOBAL DE NOTIFICAÇÕES (CP5, Caminho B: notificação local).
 *
 * O `setNotificationHandler` roda UMA VEZ, no import, antes de qualquer
 * notificação chegar — senão a primeira é engolida em silêncio. Por isso este
 * arquivo é importado pelo NotificationsBootstrap, que monta junto com o app.
 *
 * ATENÇÃO (SDK 54): a API de notificações mudou. Muito tutorial e muita IA ainda
 * sugerem `shouldShowAlert` (removido) e `getExpoPushTokenAsync` (para o nosso
 * backend o certo é o token NATIVO, e só vale no Caminho A). Aqui usamos
 * `shouldShowBanner` / `shouldShowList`.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { COLORS } from '@/styles/style';
import type { NotificationPermission } from '@/types/notifications';

export const NOTIFICATION_CHANNEL_ID = 'default';

/**
 * Com o app ABERTO a notificação, por padrão, NÃO aparece (o usuário já está olhando
 * para o app). Escolha de produto nossa: "o preço do que você salvou mudou" merece
 * interromper mesmo quem está navegando.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false, // sem regra de "não lidas", o número só acumularia
  }),
});

/**
 * Canal do Android (obrigatório no Android 8+). Precisa existir ANTES de pedir a
 * permissão no Android 13+. Criar de novo com o mesmo id não duplica. No iOS não faz nada.
 */
export async function prepareAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
    name: 'Avisos da loja',
    description: 'Mudanças de preço dos produtos que você salvou e novidades da loja.',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: COLORS.primary,
  });
}

/** Lê a permissão SEM perguntar nada ao usuário. */
export async function readPermission(): Promise<NotificationPermission> {
  const permission = await Notifications.getPermissionsAsync();
  if (permission.granted) return 'granted';
  if (permission.status === Notifications.PermissionStatus.UNDETERMINED) return 'undetermined';
  // Negada. Se o sistema não aceita mais perguntar, só as configurações resolvem.
  return permission.canAskAgain ? 'denied' : 'blocked';
}

/** Mostra o diálogo do sistema (quando ainda permitido) e devolve o desfecho. */
export async function requestPermission(): Promise<NotificationPermission> {
  await prepareAndroidChannel();
  await Notifications.requestPermissionsAsync();
  return readPermission();
}

/** Apresenta uma notificação LOCAL agora. `data` vai para o app, não para o humano. */
export async function presentLocalNotification(
  title: string,
  body: string,
  data: Record<string, string>,
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data },
    // null = imediata. No Android o canal precisa ir junto, senão cai no canal padrão do sistema.
    trigger: Platform.OS === 'android' ? { channelId: NOTIFICATION_CHANNEL_ID } : null,
  });
}

/** O `data` chega como mapa de string para string, mas o tipo da biblioteca é solto: normaliza. */
export function toStringMap(data: Record<string, unknown> | null | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!data) return result;
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined) result[key] = String(value);
  }
  return result;
}
