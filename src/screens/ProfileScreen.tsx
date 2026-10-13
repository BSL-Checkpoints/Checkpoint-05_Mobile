/**
 * Perfil (CP5): quem está logado e o estado das notificações.
 *
 * RF-60: com a permissão NEGADA o app continua inteiro, e esta tela EXPLICA o estado
 * e COMO reativar. Cada desfecho tem o seu texto e o seu caminho:
 *   granted      -> tudo certo (e dá para buscar os avisos agora)
 *   undetermined -> ainda não decidiu: botão para ativar
 *   denied       -> recusou: botão para tentar de novo
 *   blocked      -> bloqueada de vez: só nas configurações do aparelho
 */
import { useCallback, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Loading } from '@/components/ui';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useNotificationPermission } from '@/hooks/useNotificationPermission';
import { presentNewStoreMessages } from '@/lib/storeMessages';
import { useSession } from '@/session/session';
import { BACKGROUND, COLORS } from '@/styles/style';
import type { NotificationPermission } from '@/types/notifications';

const COPY: Record<NotificationPermission, { title: string; text: string }> = {
  granted: {
    title: 'Notificações ativadas',
    text: 'Você será avisado sobre novidades da loja.',
  },
  undetermined: {
    title: 'Notificações desativadas',
    text: 'Ative para ser avisado sobre novidades da loja. O app funciona normalmente sem isso.',
  },
  denied: {
    title: 'Você recusou as notificações',
    text: 'Tudo continua funcionando, mas você não receberá avisos de novidades e mudanças de preço. Se mudar de ideia, toque abaixo para tentar de novo.',
  },
  blocked: {
    title: 'Notificações bloqueadas',
    text: 'Tudo continua funcionando, mas o aparelho não deixa mais o app perguntar. Para receber avisos, abra as configurações do aparelho, entre em Notificações e permita para este app.',
  },
};

export function ProfileScreen() {
  const { customer, signOut } = useSession();
  const { favorites } = useFavorites();
  const { permission, request, refresh } = useNotificationPermission();
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Ao voltar para esta tela (ex.: das configurações), relê a permissão.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  async function checkNow() {
    if (!customer) return;
    setSyncing(true);
    setSyncMessage(null);
    try {
      const shown = await presentNewStoreMessages(customer.id);
      setSyncMessage(shown > 0 ? `${shown} aviso(s) novo(s) apresentado(s).` : 'Nenhum aviso novo da loja.');
    } catch {
      setSyncMessage('Não foi possível buscar os avisos agora. Tente de novo em instantes.');
    } finally {
      setSyncing(false);
    }
  }

  if (permission === null) return <Loading label="Carregando perfil…" />;
  const copy = COPY[permission];

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{customer?.name}</Text>
        <Text style={styles.muted}>{customer?.email}</Text>
        <Text style={styles.muted}>
          {favorites.length} {favorites.length === 1 ? 'produto favorito' : 'produtos favoritos'}
        </Text>
      </View>

      <View style={[styles.card, permission === 'granted' ? styles.cardOk : styles.cardWarn]}>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.text}>{copy.text}</Text>

        {(permission === 'undetermined' || permission === 'denied') && (
          <Button
            label={permission === 'undetermined' ? 'Ativar notificações' : 'Tentar de novo'}
            onPress={() => void request()}
          />
        )}
        {permission === 'blocked' && (
          <Button label="Abrir configurações" onPress={() => Linking.openSettings()} />
        )}
        {permission === 'granted' && (
          <>
            <Button
              label={syncing ? 'Buscando…' : 'Buscar avisos da loja agora'}
              variant="ghost"
              onPress={checkNow}
              disabled={syncing}
            />
            {syncMessage && <Text style={styles.text}>{syncMessage}</Text>}
          </>
        )}
      </View>

      <Button label="Sair da conta" variant="ghost" onPress={signOut} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: BACKGROUND.backgorundMain },
  container: { padding: 16, gap: 14 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  cardOk: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  cardWarn: { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
  name: { fontSize: 20, fontWeight: '800', color: COLORS.black },
  muted: { fontSize: 13, color: '#6b7280' },
  title: { fontSize: 15, fontWeight: '800', color: COLORS.black },
  text: { fontSize: 13, color: COLORS.black, lineHeight: 19 },
});
