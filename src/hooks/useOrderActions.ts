/**
 * Mutations de PEDIDOS (SEMANA 3): checkout, pagar, cancelar.
 *
 * Aqui a gente NÃO faz otimista (como no carrinho): pedido e pagamento são ações
 * críticas — a gente espera a resposta real do servidor e reconcilia o cache.
 * Isso é de propósito: "otimismo é bom pra micro-interação, não pra pagar".
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelOrder, checkout, payOrder } from '@/services/orders';
import { queryKeys } from '@/lib/queryKeys';
import type { Order, PaymentMethod } from '@/types/api';

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    // `pickupPointId` opcional: undefined = entrega, id = retirada naquele ponto.
    mutationFn: (pickupPointId?: string) => checkout(pickupPointId),
    onSuccess: () => {
      // O carrinho virou pedido: ele esvaziou no servidor, e há um pedido novo.
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}

export function usePayOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; method: PaymentMethod; simulate: 'approve' | 'decline' }) =>
      payOrder(v.id, v.method, v.simulate),
    onSuccess: (order: Order) => {
      // Já temos o pedido atualizado na resposta: escreve direto no cache do detalhe.
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order);
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.timeline(order.id) });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelOrder(id),
    onSuccess: (order: Order) => {
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order);
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.timeline(order.id) });
    },
  });
}
