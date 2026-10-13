/**
 * Tela de LISTA de produtos.
 * Demonstra: useQuery (via useProducts), estados isLoading/isError/data,
 * pull-to-refresh (refetch), busca que vira parte da query key, e
 * isFetching (spinner discreto de "revalidando" sem apagar a lista).
 */
import { useState } from 'react';
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useProducts } from '@/hooks/useProducts';
import { money } from '@/lib/format';
import { Button, ErrorState, Loading } from '@/components/ui';
import type { RootStackParamList } from '@/navigation';
import type { ApiError } from '@/types/api';
import { BACKGROUND, COLORS } from '@/styles/style';

type Props = NativeStackScreenProps<RootStackParamList, 'Products'>;

export function ProductsScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, error, refetch, isFetching } = useProducts({ search });

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarIcon}>👜</Text>
          </View>

          <View style={styles.headerTexts}>
            <Text style={styles.headerTitle}>Tech Lab</Text>
            <Text style={styles.headerSubtitle}>Ache os produtos favoritos do grupo</Text>
          </View>

          <Pressable
            style={styles.iconButtonWrapper}
            onPress={() => navigation.navigate('PickupPoints', { mode: 'browse' })}
            accessibilityLabel="Pontos de retirada"
          >
            <Text style={styles.iconButtonEmoji}>📍</Text>
          </Pressable>
          <Pressable style={styles.iconButtonWrapper} onPress={() => navigation.navigate('Orders')}>
            <Text style={styles.iconButtonEmoji}>📦</Text>
          </Pressable>
          <Pressable style={styles.iconButtonWrapper} onPress={() => navigation.navigate('Cart')}>
            <Text style={styles.iconButtonEmoji}>🛒</Text>
          </Pressable>
        </View>

        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.search}
            placeholder="Buscar produto…"
            placeholderTextColor={COLORS.gray}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
        </View>
      </View>

      {isLoading ? (
        <Loading label="Buscando produtos…" />
      ) : isError ? (
        <ErrorState message={(error as ApiError).message} onRetry={() => refetch()} />
      ) : (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Produtos em destaque</Text>
          </View>

          <FlatList
            data={data?.data ?? []}
            keyExtractor={(p) => p.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.list}
            // Spinner de topo enquanto revalida (isFetching), sem sumir com a lista.
            refreshControl={
              <RefreshControl
                refreshing={isFetching && !isLoading}
                onRefresh={() => refetch()}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
            ListEmptyComponent={<Text style={styles.empty}>Nenhum produto encontrado.</Text>}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => navigation.navigate('ProductDetail', { id: item.id, name: item.name })}
              >
                <View style={styles.thumbWrapper}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.thumb} />
                  ) : (
                    <View style={[styles.thumb, styles.thumbEmpty]}>
                      <Text style={styles.thumbEmptyIcon}>🛍</Text>
                    </View>
                  )}
                  <View style={styles.favBadge}>
                    <Text style={styles.favIcon}>♡</Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  {item.brand && (
                    <Text style={styles.brand} numberOfLines={1}>
                      {item.brand}
                    </Text>
                  )}
                  <Text style={styles.name} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.price}>
                    {item.priceFrom === item.priceTo
                      ? money(item.priceFrom)
                      : `${money(item.priceFrom)} – ${money(item.priceTo)}`}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BACKGROUND.backgorundMain },

  headerCard: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryBorder,
    gap: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: { fontSize: 18 },

  headerTexts: { flex: 1, gap: 2 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.black },
  headerSubtitle: { fontSize: 12, color: COLORS.gray },

  iconButtonWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonEmoji: { fontSize: 16 },

  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  searchIcon: { fontSize: 16, color: COLORS.gray, marginRight: 6 },
  search: { flex: 1, paddingVertical: 10, color: COLORS.black, fontSize: 14 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 4,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.black },

  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  row: { gap: 12 },

  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
    gap: 8,
  },
  cardPressed: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primary,
  },

  thumbWrapper: { position: 'relative' },
  thumb: { width: '100%', height: 120, borderRadius: 14, backgroundColor: COLORS.background },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  thumbEmptyIcon: { fontSize: 28, color: COLORS.gray },

  favBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  favIcon: { fontSize: 14, color: COLORS.primary },

  cardBody: { gap: 2 },
  brand: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  name: { fontSize: 13, fontWeight: '600', color: COLORS.black, minHeight: 34 },
  price: { fontSize: 15, fontWeight: '700', color: COLORS.black, marginTop: 2 },

  empty: { textAlign: 'center', color: COLORS.gray, marginTop: 40, fontSize: 14 },
});