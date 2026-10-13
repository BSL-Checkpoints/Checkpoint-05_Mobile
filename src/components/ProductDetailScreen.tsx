/**
 * Tela de DETALHE do produto.
 * Demonstra: useQuery de item único (useProduct), escolha de VARIANTE, e a
 * MUTATION otimista de "adicionar ao carrinho" — o item aparece no carrinho
 * antes da resposta do servidor.
 */
import { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useProduct } from '@/hooks/useProduct';
import { useCartMutations } from '@/hooks/useCartMutations';
import { useSession } from '@/session/session';
import { money } from '@/lib/format';
import { Button, ErrorState, Loading } from '@/components/ui';
import { ReviewsSection } from '@/components/ReviewsSection';
import type { RootStackParamList } from '@/navigation';
import type { ApiError, ProductVariant } from '@/types/api';
import { BACKGROUND, COLORS } from '@/styles/style';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

export function ProductDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { data: product, isLoading, isError, error, refetch } = useProduct(id);
  const { isLoggedIn } = useSession();
  const { addItem } = useCartMutations();

  const [variantId, setVariantId] = useState<string | null>(null);

  // Variante escolhida (ou a default/primeira quando o produto chega).
  const selected: ProductVariant | undefined = useMemo(() => {
    if (!product) return undefined;
    return (
      product.variants.find((v) => v.id === variantId) ??
      product.variants.find((v) => v.isDefault) ??
      product.variants[0]
    );
  }, [product, variantId]);

  if (isLoading) return <Loading label="Carregando produto…" />;
  if (isError || !product) return <ErrorState message={(error as ApiError)?.message ?? 'Falha'} onRetry={() => refetch()} />;

  const outOfStock = !selected || selected.stock <= 0;

  function handleAdd() {
    // Narrowing do early-return não entra em closures — reconferimos aqui.
    if (!product || !selected) return;
    addItem.mutate(
      {
        variantId: selected.id,
        quantity: 1,
        name: selected.label ? `${product.name} (${selected.label})` : product.name,
        unitPrice: selected.price,
      },
      { onSuccess: () => navigation.navigate('Cart') },
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {product.images[0] ? (
          <Image source={{ uri: product.images[0].url }} style={styles.hero} />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Text style={styles.heroPlaceholderIcon}>🛍️</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.name}>{product.name}</Text>
          {selected && <Text style={styles.price}>{money(selected.price)}</Text>}
          {product.description && <Text style={styles.desc}>{product.description}</Text>}
        </View>

        {/* Produto VARIABLE: deixa escolher a variante. SIMPLE já usa a única. */}
        {product.type === 'VARIABLE' && (
          <View style={styles.variants}>
            <Text style={styles.label}>Opções</Text>
            <View style={styles.variantRow}>
              {product.variants.map((v) => {
                const active = v.id === selected?.id;
                return (
                  <Text
                    key={v.id}
                    onPress={() => setVariantId(v.id)}
                    style={[styles.chip, active && styles.chipActive, v.stock <= 0 && styles.chipDisabled]}
                  >
                    {v.label ?? v.sku}
                  </Text>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Disponibilidade</Text>
          <Text style={styles.rowValue}>{outOfStock ? 'Sem estoque' : `${selected?.stock} em estoque`}</Text>
        </View>

        {!isLoggedIn && (
          <Text style={styles.loginHint}>Você precisa estar logado para comprar (veja a tela do carrinho).</Text>
        )}

        <Button
          label={addItem.isPending ? 'Adicionando…' : 'Adicionar ao carrinho'}
          onPress={handleAdd}
          disabled={outOfStock || !isLoggedIn || addItem.isPending}
        />

        {/* CP5: média (vem do próprio produto) + lista + formulário de avaliação. */}
        <ReviewsSection
          productId={product.id}
          rating={product.rating}
          onWriteReview={() => navigation.navigate('ReviewForm', { productId: product.id, productName: product.name })}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: BACKGROUND.backgorundMain },
  container: { padding: 16, flexGrow: 1 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  hero: { width: '100%', height: 220, borderRadius: 18, backgroundColor: COLORS.background },
  heroPlaceholder: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlaceholderIcon: { fontSize: 48 },
  info: { gap: 4, alignItems: 'center' },
  name: { fontSize: 20, fontWeight: '700', color: COLORS.black, textAlign: 'center' },
  price: { fontSize: 20, fontWeight: '800', color: COLORS.primary, textAlign: 'center' },
  desc: { fontSize: 14, color: COLORS.gray, lineHeight: 20, textAlign: 'center', marginTop: 4 },
  variants: { gap: 6, marginTop: 4 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.gray },
  variantRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    overflow: 'hidden',
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  chipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary, color: COLORS.white },
  chipDisabled: { opacity: 0.4 },
  divider: { height: 1, backgroundColor: COLORS.grayBorder, marginVertical: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 13, color: COLORS.gray },
  rowValue: { fontSize: 13, fontWeight: '700', color: COLORS.black },
  loginHint: { fontSize: 13, color: '#b45309', textAlign: 'center' },
});