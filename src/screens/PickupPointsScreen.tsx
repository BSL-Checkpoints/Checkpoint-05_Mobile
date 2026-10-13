/**
 * Pontos de retirada (CP5): lista ordenada por distância + mapa.
 *
 * O critério do RF-45: se a permissão de localização for NEGADA, a tela precisa
 * continuar útil — a lista aparece, sem ordenação, e um aviso diz por quê e como
 * tentar de novo. Nunca tela branca, nunca presa em "Obtendo localização".
 *
 * Dois modos (param `mode`):
 *   browse -> só consultar
 *   select -> escolher um ponto e voltar para o Checkout com ele
 */
import { useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PickupMap } from '@/components/PickupMap';
import { Button, ErrorState, Loading } from '@/components/ui';
import { usePickupPoints } from '@/hooks/usePickupPoints';
import { formatKm } from '@/lib/format';
import type { RootStackParamList } from '@/navigation';
import type { ApiError } from '@/types/api';
import type { PickupAddress, PickupPoint } from '@/types/pickup';
import { BACKGROUND, COLORS } from '@/styles/style';

type Props = NativeStackScreenProps<RootStackParamList, 'PickupPoints'>;

/** Endereço em uma linha, pulando o que a loja deixou em branco. */
function addressLine(address: PickupAddress): string {
  const street = [address.street, address.number].filter(Boolean).join(', ');
  const city = [address.city, address.state].filter(Boolean).join(' - ');
  return [street, address.district, city].filter(Boolean).join(' · ');
}

export function PickupPointsScreen({ navigation, route }: Props) {
  const mode = route.params?.mode ?? 'browse';
  const selectedId = route.params?.selectedId;
  const { query, location } = usePickupPoints();
  const [view, setView] = useState<'list' | 'map'>('list');

  const points = query.data?.data ?? [];

  function choose(point: PickupPoint) {
    // Volta para o Checkout levando o ponto escolhido nos params.
    navigation.popTo('Checkout', { pickupPoint: { id: point.id, name: point.name } });
  }

  if (query.isPending) return <Loading label="Buscando pontos de retirada…" />;
  if (query.isError) {
    return (
      <ErrorState
        message={(query.error as ApiError).message ?? 'Não foi possível carregar os pontos.'}
        onRetry={() => query.refetch()}
      />
    );
  }

  return (
    <View style={styles.container}>
      <LocationBanner
        status={location.status}
        canAskAgain={location.canAskAgain}
        onRetry={location.retry}
      />

      <View style={styles.toggle}>
        {(['list', 'map'] as const).map((option) => (
          <Pressable
            key={option}
            onPress={() => setView(option)}
            style={[styles.toggleItem, view === option && styles.toggleItemActive]}
          >
            <Text style={[styles.toggleText, view === option && styles.toggleTextActive]}>
              {option === 'list' ? 'Lista' : 'Mapa'}
            </Text>
          </Pressable>
        ))}
      </View>

      {points.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nenhum ponto de retirada</Text>
          <Text style={styles.muted}>Esta loja ainda não cadastrou pontos de retirada.</Text>
        </View>
      ) : view === 'map' ? (
        <PickupMap
          points={points}
          userPosition={location.position}
          selectedId={selectedId}
          onSelect={mode === 'select' ? choose : undefined}
        />
      ) : (
        <FlatList
          data={points}
          keyExtractor={(point) => point.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.card, item.id === selectedId && styles.cardSelected]}>
              <View style={styles.cardHead}>
                <Text style={styles.name}>{item.name}</Text>
                {item.distanceKm !== null && <Text style={styles.distance}>{formatKm(item.distanceKm)}</Text>}
              </View>
              <Text style={styles.muted}>{addressLine(item.address)}</Text>
              {item.hours && <Text style={styles.hours}>{item.hours}</Text>}
              {mode === 'select' && (
                <Button
                  label={item.id === selectedId ? 'Ponto escolhido' : 'Retirar aqui'}
                  onPress={() => choose(item)}
                  variant={item.id === selectedId ? 'ghost' : 'primary'}
                />
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

/** Explica o estado da localização e oferece o caminho para tentar de novo (RF-45). */
function LocationBanner({
  status,
  canAskAgain,
  onRetry,
}: {
  status: 'loading' | 'ok' | 'denied' | 'no-position';
  canAskAgain: boolean;
  onRetry: () => void;
}) {
  if (status === 'ok') {
    return (
      <View style={[styles.banner, styles.bannerOk]}>
        <Text style={styles.bannerText}>Ordenados do mais perto para o mais longe de você.</Text>
      </View>
    );
  }

  if (status === 'loading') {
    return (
      <View style={styles.banner}>
        <ActivityIndicator size="small" />
        <Text style={styles.bannerText}>Obtendo sua localização… A lista já está abaixo.</Text>
      </View>
    );
  }

  const text =
    status === 'denied'
      ? 'Sem acesso à sua localização, não dá para ordenar por distância. Os pontos estão na ordem de cadastro da loja.'
      : 'Não conseguimos obter sua posição agora (GPS desligado ou sem sinal). Os pontos estão na ordem de cadastro da loja.';

  return (
    <View style={[styles.banner, styles.bannerWarn]}>
      <Text style={styles.bannerText}>{text}</Text>
      {status === 'denied' && !canAskAgain ? (
        <Button label="Abrir configurações" variant="ghost" onPress={() => Linking.openSettings()} />
      ) : (
        <Button
          label={status === 'denied' ? 'Permitir localização' : 'Tentar de novo'}
          variant="ghost"
          onPress={onRetry}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BACKGROUND.backgorundMain },
  banner: { margin: 12, marginBottom: 0, padding: 12, borderRadius: 12, gap: 8, backgroundColor: COLORS.primarySoft },
  bannerOk: { backgroundColor: '#dcfce7' },
  bannerWarn: { backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a' },
  bannerText: { fontSize: 13, color: COLORS.black, lineHeight: 19 },
  toggle: {
    flexDirection: 'row',
    margin: 12,
    backgroundColor: COLORS.white,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    padding: 3,
  },
  toggleItem: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 999 },
  toggleItemActive: { backgroundColor: COLORS.primary },
  toggleText: { fontWeight: '700', color: COLORS.black },
  toggleTextActive: { color: COLORS.white },
  list: { padding: 12, paddingTop: 0, gap: 10 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  cardSelected: { borderColor: COLORS.primary, borderWidth: 2 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  name: { flex: 1, fontSize: 16, fontWeight: '800', color: COLORS.black },
  distance: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
  muted: { fontSize: 13, color: '#6b7280', lineHeight: 19 },
  hours: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 6 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: COLORS.black },
});
