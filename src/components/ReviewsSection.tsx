/**
 * Seção de avaliações da tela do produto.
 *  - Média e contagem vêm do PRÓPRIO produto (`rating`), sem requisição extra (RF-35).
 *  - A lista tem os 4 estados: carregando, erro, vazio, conteúdo (RF-36).
 *  - Antes de oferecer o formulário, pergunta can-review e trata cada motivo (RF-37).
 */
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { Stars } from '@/components/Stars';
import { Button } from '@/components/ui';
import { useCanReview, useReviews } from '@/hooks/useReviews';
import { shortDate } from '@/lib/format';
import { COLORS } from '@/styles/style';
import type { RatingSummary, Review } from '@/types/reviews';

interface Props {
  productId: string;
  rating?: RatingSummary | null;
  onWriteReview: () => void;
}

export function ReviewsSection({ productId, rating, onWriteReview }: Props) {
  const reviews = useReviews(productId);
  const canReview = useCanReview(productId);

  const average = rating?.average ?? 0;
  const count = rating?.count ?? 0;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Avaliações</Text>

      {/* Resumo: vem do produto, não da lista. */}
      {count > 0 ? (
        <View style={styles.summary}>
          <Text style={styles.average}>{average.toFixed(1).replace('.', ',')}</Text>
          <View style={styles.summaryRight}>
            <Stars value={average} size={20} />
            <Text style={styles.muted}>
              {count} {count === 1 ? 'avaliação' : 'avaliações'}
            </Text>
          </View>
        </View>
      ) : (
        <Text style={styles.muted}>Ainda sem nota.</Text>
      )}

      {/* Quem pode avaliar? Cada motivo tem o seu texto. */}
      {canReview.isLoading ? (
        <Text style={styles.muted}>Verificando se você pode avaliar…</Text>
      ) : canReview.isError ? (
        <Text style={styles.muted}>Não foi possível verificar se você pode avaliar agora.</Text>
      ) : canReview.data?.canReview ? (
        <Button label="Avaliar este produto" onPress={onWriteReview} />
      ) : canReview.data?.reason === 'NOT_PURCHASED' ? (
        <Text style={styles.notice}>
          Você ainda não comprou este produto. Depois que o pagamento do pedido for aprovado, a opção de avaliar aparece aqui.
        </Text>
      ) : canReview.data?.reason === 'ALREADY_REVIEWED' ? (
        <Text style={styles.notice}>Você já avaliou este produto. Sua avaliação está na lista abaixo.</Text>
      ) : canReview.data ? (
        <Text style={styles.notice}>{canReview.data.message}</Text>
      ) : null}

      {/* Lista: carregando / erro / vazio / conteúdo. */}
      {reviews.isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator />
          <Text style={styles.muted}>Carregando avaliações…</Text>
        </View>
      ) : reviews.isError ? (
        <View style={styles.state}>
          <Text style={styles.error}>Não foi possível carregar as avaliações.</Text>
          <Button label="Tentar de novo" variant="ghost" onPress={() => reviews.refetch()} />
        </View>
      ) : reviews.data && reviews.data.data.length === 0 ? (
        <Text style={styles.muted}>Este produto ainda não tem avaliações. Seja a primeira pessoa a avaliar!</Text>
      ) : (
        reviews.data?.data.map((review) => <ReviewCard key={review.id} review={review} />)
      )}
    </View>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.author}>{review.isMine ? 'Você' : review.author.name}</Text>
        <Text style={styles.date}>{shortDate(review.createdAt)}</Text>
      </View>
      <Stars value={review.rating} size={14} />
      {review.verifiedPurchase && <Text style={styles.verified}>✓ Compra verificada</Text>}
      {review.comment ? <Text style={styles.comment}>{review.comment}</Text> : null}
      {review.images.length > 0 && (
        <View style={styles.photos}>
          {review.images.map((image) => (
            <Image key={image.id} source={{ uri: image.url }} style={styles.photo} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12, marginTop: 16 },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.black },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  summaryRight: { gap: 2 },
  average: { fontSize: 36, fontWeight: '800', color: COLORS.primary },
  muted: { fontSize: 13, color: '#6b7280' },
  notice: {
    fontSize: 13,
    color: COLORS.black,
    backgroundColor: COLORS.primarySoft,
    borderRadius: 12,
    padding: 12,
    lineHeight: 19,
  },
  state: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  error: { fontSize: 14, fontWeight: '700', color: '#b91c1c' },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between' },
  author: { fontSize: 14, fontWeight: '700', color: COLORS.black },
  date: { fontSize: 12, color: '#6b7280' },
  verified: { fontSize: 12, color: '#15803d', fontWeight: '600' },
  comment: { fontSize: 14, color: COLORS.black, lineHeight: 20 },
  photos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photo: { width: 72, height: 72, borderRadius: 10, backgroundColor: COLORS.background },
});
