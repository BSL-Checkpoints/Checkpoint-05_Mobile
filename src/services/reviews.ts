/**
 * Serviço de AVALIAÇÕES (CP5).
 */
import { http } from './http';
import type { CanReview, NewReview, Review, ReviewsResponse } from '@/types/reviews';

/** GET /products/:id/reviews — não exige login. Vem com o resumo (média + contagem). */
export async function listReviews(productId: string): Promise<ReviewsResponse> {
  const { data } = await http.get<ReviewsResponse>(`/products/${productId}/reviews`, {
    params: { page: 1, pageSize: 20, sort: 'recent' },
  });
  return data;
}

/** GET /products/:id/reviews/can-review — exige login. Devolve o MOTIVO, não só true/false. */
export async function canReview(productId: string): Promise<CanReview> {
  const { data } = await http.get<CanReview>(`/products/${productId}/reviews/can-review`);
  return data;
}

/** POST /products/:id/reviews — `mediaIds` vêm de POST /uploads. */
export async function createReview(productId: string, body: NewReview): Promise<Review> {
  const { data } = await http.post<Review>(`/products/${productId}/reviews`, body);
  return data;
}
