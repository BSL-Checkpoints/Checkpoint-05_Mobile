/**
 * NAVEGAR DE FORA DA ÁRVORE DE COMPONENTES.
 *
 * O toque numa notificação acontece no sistema operacional e chega por um
 * listener — ali não existe `useNavigation()`. A saída oficial é uma REFERÊNCIA
 * ao container de navegação.
 *
 * O caso chato é o app FECHADO: o toque abre o app e o listener dispara ANTES do
 * navegador existir (e antes do login ser restaurado). Navegar nesse instante
 * não faz nada e não avisa. Por isso o destino fica PENDENTE e só é consumido
 * quando as duas coisas forem verdade: navegador pronto E cliente logado
 * (a tela ProductDetail só existe no stack de quem está logado).
 */
import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

let pendingProduct: { id: string; name: string } | null = null;
let appStackAvailable = false;

/** O NotificationsBootstrap avisa quando o stack do app (logado) passa a existir. */
export function setAppStackAvailable(available: boolean): void {
  appStackAvailable = available;
  flushPendingNavigation();
}

/** Abre a tela do produto, agora ou assim que der. */
export function openProduct(id: string, name = 'Produto'): void {
  pendingProduct = { id, name };
  flushPendingNavigation();
}

/** Também é passado ao `onReady` do NavigationContainer. */
export function flushPendingNavigation(): void {
  if (!pendingProduct || !appStackAvailable || !navigationRef.isReady()) return;
  const target = pendingProduct;
  pendingProduct = null;
  // setTimeout 0: deixa o React terminar de montar o stack recém-criado antes de navegar.
  setTimeout(() => {
    if (navigationRef.isReady()) navigationRef.navigate('ProductDetail', target);
  }, 0);
}
