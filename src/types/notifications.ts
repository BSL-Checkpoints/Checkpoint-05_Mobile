/**
 * Tipos de NOTIFICAÇÕES (CP5, Caminho B — notificação local).
 *
 * REGRA DE OURO: o `data` de uma notificação é um mapa de STRING para STRING.
 * Se o servidor manda `precoNovo: 149.9`, o aparelho recebe "149.9". Por isso o
 * tipo declara string e a conversão para número é explícita, na hora de usar.
 */

/** Uma mensagem de GET /push/messages (o histórico de avisos da loja). */
export interface StorePushMessage {
  id: string;
  /** Texto para o HUMANO. */
  title: string;
  body: string;
  /** Dados para o APP (ex.: produtoId). Nunca mostrados ao usuário. */
  data: Record<string, string>;
  createdAt: string | null;
}

/** O que o app entende dentro de `data`. Tudo opcional: o servidor pode mandar campos novos. */
export interface NotificationData {
  produtoId?: string;
  produtoNome?: string;
  [key: string]: string | undefined;
}

/**
 * Os desfechos da permissão (RF-56):
 *  - undetermined: ainda não perguntamos
 *  - granted:      concedida
 *  - denied:       negada, mas o sistema ainda aceita perguntar de novo
 *  - blocked:      negada de vez — só nas configurações do aparelho
 */
export type NotificationPermission = 'undetermined' | 'granted' | 'denied' | 'blocked';