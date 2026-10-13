/**
 * Mapa dos pontos de retirada (RF-46) — e da loja, quando a coordenada dela estiver disponível.
 * `showsUserLocation` só liga com permissão; sem ela o mapa simplesmente não desenha o
 * ponto azul, sem quebrar nada.
 */
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { formatKm } from '@/lib/format';
import type { Coordinate, PickupPoint } from '@/types/pickup';

// São Paulo: usado só se não houver posição, nem pontos, nem loja.
const FALLBACK: Coordinate = { latitude: -23.5505, longitude: -46.6333 };

interface Props {
  points: PickupPoint[];
  userPosition: Coordinate | null;
  /** Coordenada da loja (origem). Opcional: confira no Swagger de onde a API devolve. */
  store?: Coordinate | null;
  selectedId?: string;
  onSelect?: (point: PickupPoint) => void;
}

export function PickupMap({ points, userPosition, store, selectedId, onSelect }: Props) {
  // `initialRegion` só é lido no primeiro render, então calculamos uma vez.
  const region = useMemo(() => {
    const target = userPosition ?? points[0]?.coordinate ?? store ?? FALLBACK;
    return { ...target, latitudeDelta: 0.08, longitudeDelta: 0.08 };
  }, [userPosition, points, store]);

  return (
    <MapView style={styles.map} initialRegion={region} showsUserLocation={userPosition !== null}>
      {store && <Marker coordinate={store} title="Nossa loja" pinColor="#7E61D5" />}
      {points.map((point) => (
        <Marker
          key={point.id}
          coordinate={point.coordinate}
          title={point.name}
          description={point.distanceKm !== null ? `${formatKm(point.distanceKm)} de você` : (point.hours ?? undefined)}
          pinColor={point.id === selectedId ? '#16a34a' : undefined}
          onCalloutPress={onSelect ? () => onSelect(point) : undefined}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({ map: { flex: 1 } });
