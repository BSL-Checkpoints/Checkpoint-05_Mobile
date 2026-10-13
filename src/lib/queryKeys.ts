/**
 * Fábrica central de query keys.
 *
 * Por que centralizar? Uma query key é a "identidade" de um dado no cache.
 * Se `useProduct` guarda em ['products','detail',id] e outro arquivo tenta
 * invalidar ['product',id], nada acontece — a chave não bate. Concentrar aqui
 * garante que quem LÊ e quem INVALIDA usam exatamente a mesma string.
 *
 * Hierarquia importa: invalidar ['products'] atinge lista E detalhes de uma vez,
 * porque o Query casa keys por PREFIXO.
 */
import type { ListProductsParams } from '@/services/products';

export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (params: ListProductsParams) => ['products', 'list', params] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
  },
  cart: {
    all: ['cart'] as const,
  },
  orders: {
    all: ['orders'] as const,
    list: () => ['orders', 'list'] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
    timeline: (id: string) => ['orders', 'timeline', id] as const,
  },
  // --- CP5 -----------------------------------------------------------------
  reviews: {
    all: ['reviews'] as const,
    list: (productId: string) => ['reviews', 'list', productId] as const,
    can: (productId: string) => ['reviews', 'can', productId] as const,
  },
  pickup: {
    all: ['pickup'] as const,
    list: (latitude: number | null, longitude: number | null) =>
      ['pickup', 'list', latitude, longitude] as const,
  },
};
