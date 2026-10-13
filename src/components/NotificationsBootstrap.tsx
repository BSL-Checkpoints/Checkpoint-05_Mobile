/**
 * Liga as notificações ao app. Não desenha nada: só reage.
 *
 *  1. Cria o canal do Android (sem pedir nada ao usuário).
 *  2. Toque na notificação -> abre o produto, inclusive com o app FECHADO (RF-59).
 *  3. Ao abrir o app (e ao voltar para ele), busca os avisos da loja e apresenta (RF-57, Caminho B).
 *  4. Pede a permissão NO MOMENTO CERTO: quando a pessoa favorita o primeiro produto,
 *     que é quando ela entende o que ganha com o aviso (RF-56). Nunca na abertura.
 *
 * A permissão pode ser negada, e o app continua inteiro: nada aqui é obrigatório.
 */
import { useEffect, useRef } from 'react';
import { Alert, AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useNotificationPermission } from '@/hooks/useNotificationPermission';
import { prepareAndroidChannel, toStringMap } from '@/lib/notifications';
import { setAppStackAvailable, openProduct } from '@/lib/navigationRef';
import { presentNewStoreMessages } from '@/lib/storeMessages';
import { useSession } from '@/session/session';
import type { NotificationData } from '@/types/notifications';

const PROMPTED_KEY = 'lojaturma.push.prompted.v1';

// Toque já tratado (o hook entrega a mesma resposta de novo se o componente remontar).
const handledResponses = new Set<string>();

export function NotificationsBootstrap() {
  const { isLoggedIn, customer } = useSession();
  const { favorites, isReady: favoritesReady } = useFavorites();
  const { permission, request } = useNotificationPermission();
  // undefined = ainda carregando; null = o app não foi aberto por uma notificação.
  const lastResponse = Notifications.useLastNotificationResponse();
  const hadFavorites = useRef<boolean | null>(null);

  // 1. Canal do Android.
  useEffect(() => {
    prepareAndroidChannel().catch(() => {});
  }, []);

  // 2a. Avisa o navegador se o stack do app (logado) existe.
  useEffect(() => {
    setAppStackAvailable(isLoggedIn);
  }, [isLoggedIn]);

  // 2b. Toque na notificação (app aberto, em segundo plano OU fechado).
  useEffect(() => {
    if (!lastResponse) return;
    if (lastResponse.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;

    const requestId = lastResponse.notification.request.identifier;
    if (handledResponses.has(requestId)) return;
    handledResponses.add(requestId);

    // O `data` é para o APP: título e corpo já foram para o humano.
    const data: NotificationData = toStringMap(lastResponse.notification.request.content.data);
    if (data.produtoId) openProduct(data.produtoId, data.produtoNome);
  }, [lastResponse]);

  // 3. Busca os avisos da loja ao abrir e ao voltar para o app — só com permissão e login.
  const customerId = customer?.id ?? null;
  useEffect(() => {
    if (!customerId || permission !== 'granted') return;

    const sync = () => {
      presentNewStoreMessages(customerId).catch(() => {
        // Sem rede ou erro da API: tenta de novo na próxima abertura. Nunca quebra o app.
      });
    };
    sync();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') sync();
    });
    return () => subscription.remove();
  }, [customerId, permission]);

  // 4. Momento certo para pedir: o PRIMEIRO favorito.
  useEffect(() => {
    if (!isLoggedIn || !favoritesReady || permission === null) return;
    const hasFavorites = favorites.length > 0;

    // Primeira leitura depois de carregar: só memoriza (não é uma ação da pessoa).
    if (hadFavorites.current === null) {
      hadFavorites.current = hasFavorites;
      return;
    }
    const gotFirstFavorite = !hadFavorites.current && hasFavorites;
    hadFavorites.current = hasFavorites;

    if (gotFirstFavorite && permission === 'undetermined') {
      askAtTheRightMoment(request);
    }
  }, [favorites, favoritesReady, isLoggedIn, permission, request]);

  // Trocar de conta reinicia a "memória" do primeiro favorito.
  useEffect(() => {
    hadFavorites.current = null;
  }, [customerId]);

  return null;
}

/** Explica o ganho ANTES do diálogo do sistema. E só pergunta uma vez. */
async function askAtTheRightMoment(request: () => Promise<unknown>): Promise<void> {
  const alreadyAsked = await AsyncStorage.getItem(PROMPTED_KEY).catch(() => null);
  if (alreadyAsked) return;
  await AsyncStorage.setItem(PROMPTED_KEY, '1').catch(() => {});

  Alert.alert(
    'Quer ser avisado?',
    'Avisamos quando houver novidade nos produtos da loja, como mudança de preço. Você pode mudar isso a qualquer momento no seu perfil.',
    [
      { text: 'Agora não', style: 'cancel' },
      { text: 'Ativar avisos', onPress: () => void request() },
    ],
  );
}