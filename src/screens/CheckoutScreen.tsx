/**
 * Tela de CHECKOUT (SEMANA 3) — revisão + criar o pedido.
 * Confirma o carrinho, chama POST /orders/checkout (pedido vira PENDING) e leva
 * para a tela do pedido, onde o pagamento acontece.
 *
 * CP5: o cliente escolhe ENTREGA ou RETIRADA. Na retirada, o ponto é escolhido na tela
 * PickupPoints e volta para cá pelos params da rota (`pickupPoint`).
 */
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useOrderActions';
import { money } from '@/lib/format';
import { Button, ErrorState, Loading } from '@/components/ui';
import type { RootStackParamList } from '@/navigation';
import type { ApiError } from '@/types/api';
import { BACKGROUND, COLORS } from '@/styles/style';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export function CheckoutScreen({ navigation, route }: Props) {
  const { data: cart, isLoading, isError, error, refetch } = useCart();
  const checkout = useCheckout();
  // Hooks sempre ANTES de qualquer return antecipado.
  const [receiveMode, setReceiveMode] = useState<'delivery' | 'pickup'>('delivery');
  const pickupPoint = route.params?.pickupPoint;

  if (isLoading) return <Loading label="Carregando carrinho…" />;
  if (isError) return <ErrorState message={(error as ApiError).message} onRetry={() => refetch()} />;

  const items = cart?.items ?? [];
  const vazio = items.length === 0;
  const faltaPonto = receiveMode === 'pickup' && !pickupPoint;

  function confirmar() {
    checkout.mutate(receiveMode === 'pickup' ? pickupPoint?.id : undefined, {
      // Ao criar o pedido, substituímos a tela de checkout pela do pedido
      // (replace: não dá pra "voltar" para um carrinho que já virou pedido).
      onSuccess: (order) => navigation.replace('Order', { id: order.id }),
    });
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.variantId}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <Text style={styles.h}>Revise seu pedido</Text>

            <Text style={styles.sectionLabel}>Como você quer receber?</Text>
            <View style={styles.modeRow}>
              {(['delivery', 'pickup'] as const).map((option) => (
                <Pressable
                  key={option}
                  onPress={() => setReceiveMode(option)}
                  style={[styles.modeChip, receiveMode === option && styles.modeChipActive]}
                >
                  <Text style={[styles.modeText, receiveMode === option && styles.modeTextActive]}>
                    {option === 'delivery' ? 'Entrega' : 'Retirada'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {receiveMode === 'pickup' && (
              <View style={styles.pickupCard}>
                {pickupPoint ? (
                  <>
                    <Text style={styles.pickupLabel}>Retirar em</Text>
                    <Text style={styles.pickupName}>{pickupPoint.name}</Text>
                  </>
                ) : (
                  <Text style={styles.pickupLabel}>Escolha onde retirar o seu pedido.</Text>
                )}
                <Button
                  label={pickupPoint ? 'Trocar ponto' : 'Escolher ponto de retirada'}
                  variant="ghost"
                  onPress={() => navigation.navigate('PickupPoints', { mode: 'select', selectedId: pickupPoint?.id })}
                />
              </View>
            )}
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>Seu carrinho está vazio.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.qtyBadge}>
              <Text style={styles.qtyBadgeText}>{item.quantity}×</Text>
            </View>
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.sub}>{money(item.subtotal)}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.total}>{money(cart?.total ?? 0)}</Text>
        </View>
        {checkout.isError && (
          <Text style={styles.erro}>{(checkout.error as ApiError).message}</Text>
        )}
        {faltaPonto && <Text style={styles.erro}>Escolha um ponto de retirada para continuar.</Text>}
        <Button
          label={checkout.isPending ? 'Criando pedido…' : 'Confirmar pedido'}
          onPress={confirmar}
          disabled={vazio || faltaPonto || checkout.isPending}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BACKGROUND.backgorundMain },
  list: { padding: 16, paddingBottom: 8, gap: 10 },
  headerBlock: { marginBottom: 4 },
  sectionLabel: { marginTop: 12, fontSize: 13, fontWeight: '700', color: COLORS.gray, textTransform: 'uppercase' },
  modeRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  modeChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    backgroundColor: COLORS.white,
  },
  modeChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  modeText: { fontWeight: '700', color: COLORS.black },
  modeTextActive: { color: COLORS.white },
  pickupCard: { marginTop: 10, gap: 6, padding: 12, borderRadius: 12, backgroundColor: COLORS.primarySoft },
  pickupLabel: { fontSize: 13, color: COLORS.black },
  pickupName: { fontSize: 16, fontWeight: '800', color: COLORS.black },
  eyebrow: { fontSize: 12, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 1 },
  h: { fontSize: 22, fontWeight: '800', color: COLORS.black, marginTop: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  qtyBadge: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  qtyBadgeText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  name: { flex: 1, fontSize: 14, color: COLORS.black },
  sub: { fontSize: 14, fontWeight: '700', color: COLORS.black },
  empty: { color: COLORS.gray, textAlign: 'center', marginTop: 24 },
  footer: {
    padding: 20,
    gap: 10,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, color: COLORS.gray },
  total: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  erro: { color: '#b91c1c', fontSize: 13 },
});