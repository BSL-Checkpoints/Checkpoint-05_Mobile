/**
 * Hooks de AVALIAÇÕES (CP5).
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { canReview, createReview, listReviews } from '@/services/reviews';
import { uploadImage } from '@/services/uploads';
import { queryKeys } from '@/lib/queryKeys';
import { useSession } from '@/session/session';
import type { LocalFile } from '@/types/reviews';

/** Lista de avaliações. Avaliação ocultada pela loja não é exibida (RF-42). */
export function useReviews(productId: string) {
  return useQuery({
    queryKey: queryKeys.reviews.list(productId),
    queryFn: () => listReviews(productId),
    enabled: Boolean(productId),
    // A API só devolve avaliação oculta para o próprio autor — mesmo assim, o app não a mostra.
    select: (response) => ({ ...response, data: response.data.filter((review) => !review.hidden) }),
  });
}

/** Pode avaliar? Exige login — por isso só dispara com sessão. */
export function useCanReview(productId: string) {
  const { isLoggedIn } = useSession();
  return useQuery({
    queryKey: queryKeys.reviews.can(productId),
    queryFn: () => canReview(productId),
    enabled: isLoggedIn && Boolean(productId),
  });
}

export interface SubmitReviewInput {
  rating: number;
  comment: string;
  photos: LocalFile[];
}

/**
 * Envia a avaliação: 1) sobe as fotos (POST /uploads) -> mediaIds, 2) cria a avaliação.
 * A orquestração mora aqui, não na tela.
 */
export function useSubmitReview(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ rating, comment, photos }: SubmitReviewInput) => {
      const uploaded = await Promise.all(photos.map((photo) => uploadImage(photo)));
      return createReview(productId, {
        rating,
        comment: comment.trim(),
        mediaIds: uploaded.map((media) => media.id),
      });
    },
    onSuccess: () => {
      // Três caches ficaram velhos de uma vez:
      //  1. a lista de avaliações (falta a nova)
      //  2. o can-review (agora é ALREADY_REVIEWED)
      //  3. o PRODUTO (a média mudou — ela vem de GET /products/:id)
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) });
    },
  });
}
