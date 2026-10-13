/**
 * Serviço de PEDIDOS (SEMANA 3). Exige comprador logado (o interceptor já injeta
 * o Authorization). É o fecho do fluxo de compra: carrinho -> pedido -> pagamento.
 */
import { http } from './http';
import type { Order, PaymentMethod, TimelineEntry } from '@/types/api';

/**
 * POST /orders/checkout — cria o pedido a partir do carrinho ativo (status PENDING).
 * CP5: com `pickupPointId` o pedido é RETIRADA naquele ponto; sem ele, é entrega.
 */
export async function checkout(pickupPointId?: string): Promise<Order> {
  const { data } = await http.post<Order>('/orders/checkout', { pickupPointId });
  return data;
}

/** GET /orders — histórico do cliente logado. */
export async function listOrders(): Promise<Order[]> {
  const { data } = await http.get<Order[]>('/orders');
  return data;
}

/** GET /orders/:id */
export async function getOrder(id: string): Promise<Order> {
  const { data } = await http.get<Order>(`/orders/${id}`);
  return data;
}

/** POST /orders/:id/pay — pagamento SIMULADO (approve/decline). */
export async function payOrder(
  id: string,
  method: PaymentMethod,
  simulate: 'approve' | 'decline',
): Promise<Order> {
  const { data } = await http.post<Order>(`/orders/${id}/pay`, { method, simulate });
  return data;
}

/** POST /orders/:id/cancel — cancela um pedido pendente e libera a reserva. */
export async function cancelOrder(id: string): Promise<Order> {
  const { data } = await http.post<Order>(`/orders/${id}/cancel`);
  return data;
}

/** GET /orders/:id/timeline — transições de status do pedido. */
export async function getOrderTimeline(id: string): Promise<TimelineEntry[]> {
  const { data } = await http.get<TimelineEntry[]>(`/orders/${id}/timeline`);
  return data;
}
