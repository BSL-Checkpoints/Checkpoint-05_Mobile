/**
 * Busca os avisos da loja e apresenta os que o aparelho ainda não mostrou.
 *
 * Decisões de produto:
 *  - "já mostrado" fica salvo por cliente, para não repetir o mesmo aviso a cada abertura;
 *  - se houver muitos novos de uma vez (primeira abertura com o histórico cheio), mostra só
 *    os 3 mais recentes e marca todos como vistos — para não encher a tela de avisos velhos.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { listStoreMessages } from '@/services/push';
import { presentLocalNotification } from './notifications';
import type { StorePushMessage } from '@/types/notifications';

const MAX_PER_SYNC = 3;
const MAX_REMEMBERED = 200;
const seenKey = (customerId: string) => `lojaturma.push.seen.v1.${customerId}`;

async function readSeen(customerId: string): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(seenKey(customerId));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function newestFirst(messages: StorePushMessage[]): StorePushMessage[] {
  return [...messages].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
}

/** Devolve quantas notificações foram apresentadas. */
export async function presentNewStoreMessages(customerId: string): Promise<number> {
  const messages = await listStoreMessages();
  const seen = await readSeen(customerId);
  const seenSet = new Set(seen);

  const unseen = messages.filter((message) => !seenSet.has(message.id));
  if (unseen.length === 0) return 0;

  const toShow = newestFirst(unseen).slice(0, MAX_PER_SYNC).reverse(); // mais antigo primeiro
  for (const message of toShow) {
    await presentLocalNotification(message.title, message.body, message.data);
  }

  const remembered = [...seen, ...unseen.map((message) => message.id)].slice(-MAX_REMEMBERED);
  await AsyncStorage.setItem(seenKey(customerId), JSON.stringify(remembered)).catch(() => {});
  return toShow.length;
}