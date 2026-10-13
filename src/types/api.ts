/**
 * Tipos da API do e-commerce da turma.
 * Espelham EXATAMENTE o JSON que o backend devolve — confira no Swagger (/docs).
 *
 * Conceito-chave: a UNIDADE VENDÁVEL é a VARIANTE.
 *   - Produto SIMPLE  -> tem 1 variante (default).
 *   - Produto VARIABLE -> tem N variantes (ex.: Cor x Tamanho).
 *   - Carrinho e pedido operam sobre `variantId`, NUNCA sobre o id do produto.
 */

export type ProductType = 'SIMPLE' | 'VARIABLE';
export type ProductState = 'DRAFT' | 'PUBLISHED' | 'HIDDEN';

/** Envelope de listagem paginada usado pela API. */
export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

/** Item retornado na LISTAGEM (GET /products) — é um resumo. */
export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  state: ProductState;
  brand: string | null;
  categoryId: string | null;
  priceFrom: number; // menor preço entre as variantes
  priceTo: number; //   maior preço entre as variantes
  stock: number; //     soma do estoque das variantes
  image: string | null; // URL da imagem primária
  variantsCount: number;
}

export interface ProductImage {
  id: string;
  url: string;
  position: number;
  isPrimary: boolean;
}

/** Variante: onde vivem PREÇO e ESTOQUE. `id` é o variantId do carrinho. */
export interface ProductVariant {
  id: string;
  sku: string;
  barcode: string | null;
  price: number;
  stock: number;
  minStock: number;
  isDefault: boolean;
  active: boolean;
  label: string | null; // ex.: "Preto / P"
  options: { option: string; value: string }[];
  images: ProductImage[];
}

/** Produto DETALHADO (GET /products/:id). */
export interface Product {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  state: ProductState;
  description: string | null;
  category: { id: string; name: string } | null;
  brand: { id: string; name: string } | null;
  tags: string[];
  options: { id: string; name: string; values: { id: string; value: string }[] }[];
  variants: ProductVariant[];
  images: ProductImage[];
  createdAt: string;
}

/** Item do carrinho (GET /cart). Note: usa `variantId`, não productId. */
export interface CartItem {
  variantId: string;
  name: string; // "Nome do produto (Preto / P)"
  sku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  customer: Customer;
}

// --- PEDIDOS (SEMANA 3) ----------------------------------------------------

/** Formas de pagamento aceitas pelo backend. */
export type PaymentMethod = 'CREDIT_CARD' | 'PIX' | 'BOLETO';

/** Item do pedido. Note: aqui o nome vem em `productName` (no carrinho é `name`). */
export interface OrderItem {
  variantId: string;
  productName: string;
  variantName: string | null;
  sku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Payment {
  status: string;
  method: string;
  amount: number;
  transactionId: string;
}

/** Pedido. `status` é o estado da máquina: PENDING -> PAID / CANCELLED / ... */
export interface Order {
  id: string;
  status: string;
  total: number;
  items: OrderItem[];
  payment: Payment | null;
  createdAt: string;
}

/** Uma transição na linha do tempo do pedido. */
export interface TimelineEntry {
  from: string | null;
  to: string;
  actor: string;
  rm: string | null;
  note: string | null;
  at: string;
}

// Tipagens do shipping
export interface ShippingOption {
  name: string;
  price: number;
  deliveryDays: number;
}

export interface ShippingQuoteRequest {
  cepDestino: string;
  orderId?: string;
  items: Array<{
    weightGr: number;
    quantity: number;
  }>;
}

/** Erro normalizado que a camada de serviços SEMPRE lança (ver http.ts). */
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
