/**
 * Tipos de AVALIAÇÕES e UPLOAD (CP5).
 * Espelham o JSON da API — confira no Swagger (/docs).
 *
 * A nota do produto chega de DUAS formas:
 *   GET /products/:id          -> `rating` (média + contagem)  <- use ESTA na tela do produto
 *   GET /products/:id/reviews  -> as avaliações uma a uma (+ o mesmo resumo)
 * Baixar a lista só para calcular a média custa uma requisição e ainda sai errada
 * (você tem 20 de 300). Por isso a média NUNCA é calculada no app.
 */

/** Média, total e (quando vier) quantas notas de cada estrela. */
export interface RatingSummary {
  average: number;
  count: number;
  distribution?: Partial<Record<'1' | '2' | '3' | '4' | '5', number>>;
}

export interface ReviewImage {
  id: string;
  url: string;
  mediaId: string | null;
}

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  images: ReviewImage[];
  /** A API devolve "Maria S.", nunca o nome completo. */
  author: { name: string; id: string | null };
  /** Ligada a um pedido pago: o selo de "compra verificada". */
  verifiedPurchase: boolean;
  /** Ocultada pela loja no painel. Só aparece para o próprio autor. */
  hidden: boolean;
  isMine: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse {
  data: Review[];
  page: number;
  pageSize: number;
  total: number;
  summary: RatingSummary;
}

/** Motivos que a API devolve em can-review. É o MOTIVO que escolhe o texto da tela. */
export type CanReviewReason = 'ALREADY_REVIEWED' | 'NOT_PURCHASED';

export interface CanReview {
  canReview: boolean;
  reason: CanReviewReason | null;
  message: string;
  /** Quando já avaliou, o id da avaliação dele. */
  reviewId: string | null;
}

/** Corpo de POST /products/:id/reviews. `mediaIds` são ids vindos de POST /uploads (máx. 5). */
export interface NewReview {
  rating: number;
  title?: string | null;
  comment?: string;
  mediaIds?: string[];
}

/** Resposta de POST /uploads. A avaliação referencia o `id`, NÃO a url. */
export interface UploadedMedia {
  id: string;
  kind: 'IMAGE' | 'VIDEO';
  url: string;
  mimeType: string;
  sizeBytes: number;
}

/**
 * Arquivo local no formato que o FormData do React Native aceita.
 * No RN não existe Blob/File como no navegador: você entrega a `uri` local
 * (a que o ImagePicker devolve) e a plataforma lê o arquivo na hora de enviar.
 */
export interface LocalFile {
  uri: string;
  name: string;
  type: string;
}
