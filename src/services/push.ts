/**
 * Serviço de AVISOS DA LOJA (CP5, Caminho B): GET /push/messages.
 *
 * É o histórico do que a loja mandou pelo painel. O app busca ao abrir e
 * apresenta como notificação local.
 */
import { http } from './http';
import type { StorePushMessage } from '@/types/notifications';

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json => typeof value === 'object' && value !== null && !Array.isArray(value);

function extractList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (isObject(payload)) {
    for (const key of ['data', 'messages', 'items']) {
      const candidate = payload[key];
      if (Array.isArray(candidate)) return candidate;
    }
  }
  return [];
}

function toMessage(raw: unknown): StorePushMessage | null {
  if (!isObject(raw)) return null;
  const id = raw.id;
  if (typeof id !== 'string' && typeof id !== 'number') return null;

  const title = typeof raw.title === 'string' ? raw.title : '';
  const body = typeof raw.body === 'string' ? raw.body : '';
  if (!title && !body) return null;

  // `data` do servidor pode vir com números; o app trata tudo como string (como no FCM).
  const rawData = isObject(raw.data) ? raw.data : isObject(raw.payload) ? raw.payload : {};
  const data: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawData)) {
    if (value !== null && value !== undefined) data[key] = String(value);
  }

  return {
    id: String(id),
    title,
    body,
    data,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : null,
  };
}

export async function listStoreMessages(): Promise<StorePushMessage[]> {
  const { data } = await http.get<unknown>('/push/messages');
  return extractList(data)
    .map(toMessage)
    .filter((message): message is StorePushMessage => message !== null);
}
