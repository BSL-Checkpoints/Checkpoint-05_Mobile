/**
 * Tipos de LOCALIZAÇÃO e RETIRADA (CP5).
 * A API já devolve coordenada como { latitude, longitude } — exatamente o que o
 * <Marker coordinate={...} /> do react-native-maps espera. Nada a converter.
 */
export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface PickupAddress {
  cep: string | null;
  street: string | null;
  number: string | null;
  complement?: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
}

export interface PickupPoint {
  id: string;
  name: string;
  address: PickupAddress;
  coordinate: Coordinate;
  /** Texto livre: "Seg a Sex, 9h às 18h". */
  hours: string | null;
  active: boolean;
  /**
   * Distância até a posição enviada na busca.
   * É `null` sempre que o app NÃO mandou a posição (permissão negada, GPS sem sinal).
   * Isso não é erro: a tela precisa saber lidar com os dois casos.
   */
  distanceKm: number | null;
}

export interface PickupPointsResponse {
  data: PickupPoint[];
  /** A posição que a API usou para ordenar, ou null se não foi informada. */
  origin: Coordinate | null;
}

/** O ponto escolhido, no formato mínimo que viaja entre as telas (Retirada -> Checkout). */
export interface PickupSelection {
  id: string;
  name: string;
}

/** O que o pedido devolve quando é RETIRADA (null quando é entrega). */
export interface OrderPickup {
  id: string;
  name: string;
  hours: string | null;
  coordinate: Coordinate;
  address: PickupAddress;
}
