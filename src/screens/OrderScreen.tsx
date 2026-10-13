/**
 * Tela do PEDIDO (SEMANA 3) — status, pagamento simulado e linha do tempo.
 *
 * É aqui que a "máquina de estados" fica visível: PENDING -> (pagar) -> PAID,
 * ou PENDING -> (cancelar) -> CANCELLED. O switch "aprovar/recusar" existe de
 * propósito, para o aluno ver os DOIS caminhos e tratar os estados de UI.
 */
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useOrder, useOrderTimeline } from '@/hooks/useOrders';
import { useCancelOrder, usePayOrder } from '@/hooks/useOrderActions';
import { statusColor, statusLabel } from '@/lib/orders';
import { money } from '@/lib/format';
import { Badge, Button, ErrorState, Loading } from '@/components/ui';
import type { RootStackParamList } from '@/navigation';
import type { ApiError, PaymentMethod } from '@/types/api';
import { BACKGROUND, COLORS } from '@/styles/style';

type Props = NativeStackScreenProps<RootStackParamList, 'Order'>;

const METHODS: { key: PaymentMethod; label: string }[] = [
  { key: 'PIX', label: 'PIX' },
  { key: 'CREDIT_CARD', label: 'Cartão' },
  { key: 'BOLETO', label: 'Boleto' },
];

export function OrderScreen({ route }: Props) {
  const { id } = route.params;
  const { data: order, isLoading, isError, error, refetch } = useOrder(id);
  const { data: timeline } = useOrderTimeline(id);
  const pay = usePayOrder();
  const cancel = useCancelOrder();

  const [method, setMethod] = useState<PaymentMethod>('PIX');
  const [simulate, setSimulate] = useState<'approve' | 'decline'>('approve');

  if (isLoading) return <Loading label="Carregando pedido…" />;
  if (isError || !order) return <ErrorState message={(error as ApiError)?.message ?? 'Falha'} onRetry={() => refetch()} />;

  const pending = order.status === 'PENDING';
  const paid = order.status === 'PAID';
  // Pagamento processou mas não aprovou (recusado): continua PENDING.
  const recusado = pay.isSuccess && pay.data?.status === 'PENDING';

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.head}>
        <Text style={styles.pedido}>Pedido #{order.id.slice(-6)}</Text>
        <Badge label={statusLabel(order.status)} color={statusColor(order.status)} />
      </View>

      {order.items.map((it) => (
        <View key={it.variantId} style={styles.row}>
          <Text style={styles.name} numberOfLines={2}>
            {it.quantity}× {it.productName}
            {it.variantName ? ` (${it.variantName})` : ''}
          </Text>
          <Text style={styles.sub}>{money(it.subtotal)}</Text>
        </View>
      ))}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.total}>{money(order.total)}</Text>
      </View>

      {/* CP5: o pedido reflete a escolha — retirada num ponto ou entrega. */}
      {order.pickup ? (
        <View style={styles.pickup}>
          <Text style={styles.section}>Retirada</Text>
          <Text style={styles.pickupName}>{order.pickup.name}</Text>
          <Text style={styles.pickupText}>
            {[order.pickup.address.street, order.pickup.address.number].filter(Boolean).join(', ')}
            {order.pickup.address.city ? ` · ${order.pickup.address.city}` : ''}
          </Text>
          {order.pickup.hours ? <Text style={styles.pickupText}>{order.pickup.hours}</Text> : null}
        </View>
      ) : null}

      {paid && <Text style={styles.ok}>✓ Pagamento aprovado. Obrigado!</Text>}

      {pending && (
        <View style={styles.pay}>
          <Text style={styles.section}>Pagamento</Text>

          <View style={styles.chips}>
            {METHODS.map((m) => (
              <Text
                key={m.key}
                onPress={() => setMethod(m.key)}
                style={[styles.chip, method === m.key && styles.chipActive]}
              >
                {m.label}
              </Text>
            ))}
          </View>

          {/* Simulação: aprovar x recusar — para exercitar os dois caminhos. */}
          <View style={styles.chips}>
            <Text
              onPress={() => setSimulate('approve')}
              style={[styles.chip, simulate === 'approve' && styles.chipActive]}
            >
              simular: aprovar
            </Text>
            <Text
              onPress={() => setSimulate('decline')}
              style={[styles.chip, simulate === 'decline' && styles.chipActive]}
            >
              simular: recusar
            </Text>
          </View>

          {recusado && <Text style={styles.erro}>Pagamento recusado. Tente outro método ou aprove a simulação.</Text>}
          {pay.isError && <Text style={styles.erro}>{(pay.error as ApiError).message}</Text>}

          <Button
            label={pay.isPending ? 'Processando…' : 'Pagar'}
            onPress={() => pay.mutate({ id: order.id, method, simulate })}
            disabled={pay.isPending}
          />
          
          <Button
            label={cancel.isPending ? 'Cancelando…' : 'Cancelar pedido'}
            variant="ghost"
            onPress={() => cancel.mutate(order.id)}
            disabled={cancel.isPending}
          />
        </View>
      )}

      {timeline && timeline.length > 0 && (
        <View style={styles.timeline}>
          <Text style={styles.section}>Linha do tempo</Text>
          {timeline.map((t, i) => (
            <View key={i} style={styles.tl}>
              <Text style={styles.tlDot}>•</Text>
              <Text style={styles.tlText}>
                {statusLabel(t.to)}
                {t.note ? ` — ${t.note}` : ''}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: BACKGROUND.backgorundMain },
  container: { padding: 16, gap: 10 },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  pedido: { fontSize: 18, fontWeight: '800', color: COLORS.black },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  name: { flex: 1, fontSize: 14, color: COLORS.black },
  sub: { fontSize: 14, fontWeight: '600', color: COLORS.black },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    padding: 14,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  totalLabel: { fontSize: 16, color: COLORS.gray },
  total: { fontSize: 20, fontWeight: '800', color: COLORS.black },
  ok: { fontSize: 15, fontWeight: '700', color: '#15803d', marginTop: 8 },
  pay: { marginTop: 4, gap: 10, backgroundColor: COLORS.white, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.primaryBorder },
  section: { fontSize: 13, fontWeight: '700', color: COLORS.gray, textTransform: 'uppercase' },
  pickup: { marginTop: 8, gap: 2 },
  pickupName: { fontSize: 15, fontWeight: '700', color: COLORS.black },
  pickupText: { fontSize: 13, color: COLORS.black },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    overflow: 'hidden',
    color: COLORS.black,
    backgroundColor: COLORS.background,
  },
  chipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary, color: COLORS.white },
  erro: { color: '#b91c1c', fontSize: 13 },
  timeline: { marginTop: 4, gap: 4, backgroundColor: COLORS.white, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.primaryBorder },
  tl: { flexDirection: 'row', gap: 8 },
  tlDot: { color: COLORS.primary },
  tlText: { flex: 1, fontSize: 13, color: COLORS.black },
});
