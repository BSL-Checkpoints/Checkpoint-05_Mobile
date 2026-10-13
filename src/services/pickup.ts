/**
 * Serviço de RETIRADA (CP5): GET /pickup-points.
 *
 *   COM latitude/longitude -> a lista volta ORDENADA por proximidade, com `distanceKm`
 *   SEM posição            -> a lista volta na ordem de cadastro, com `distanceKm = null`
 *
 * O segundo caso NÃO é erro: é o que acontece quando o usuário nega o GPS.
 */
import { http } from './http';
import type { Coordinate, PickupPointsResponse } from '@/types/pickup';

export async function listPickupPoints(position: Coordinate | null): Promise<PickupPointsResponse> {
  const { data } = await http.get<PickupPointsResponse>('/pickup-points', {
    // Parâmetro `undefined` é simplesmente omitido pelo Axios.
    params: { latitude: position?.latitude, longitude: position?.longitude },
  });
  return data;
}
