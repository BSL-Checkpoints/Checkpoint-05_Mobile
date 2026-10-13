/**
 * Pontos de retirada = POSIÇÃO do aparelho (demora e pode nunca vir) + LISTA da API
 * (que depende da posição).
 *
 * Decisão de desenho: NÃO esperamos o GPS para buscar a lista.
 *   - GPS negado/sem posição -> busca sem posição (ordem de cadastro)
 *   - GPS ok                 -> busca de novo, agora ordenada por distância
 * A pessoa vê os pontos na hora e a ordem melhora quando a posição chega.
 */
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listPickupPoints } from '@/services/pickup';
import { queryKeys } from '@/lib/queryKeys';
import { useDeviceLocation } from './useDeviceLocation';

export function usePickupPoints() {
  const location = useDeviceLocation();
  const latitude = location.position?.latitude ?? null;
  const longitude = location.position?.longitude ?? null;

  const query = useQuery({
    queryKey: queryKeys.pickup.list(latitude, longitude),
    queryFn: () => listPickupPoints(location.position),
    // Quando a posição chega e a chave muda, mantém a lista anterior na tela (sem piscar).
    placeholderData: keepPreviousData,
  });

  return { query, location };
}