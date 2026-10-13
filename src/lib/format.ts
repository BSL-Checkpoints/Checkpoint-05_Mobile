/**
 * Formata um número em reais. Preços da API vêm como number (ex.: 79.9).
 * Formatação manual (sem Intl) para funcionar igual em qualquer device/Hermes.
 */
export function money(value: number): string {
  const fixed = (Math.round(value * 100) / 100).toFixed(2); // 2 casas
  const [intPart, decPart] = fixed.split('.');
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${withThousands},${decPart}`;
}

/** "2026-10-08T14:30:00Z" -> "08/10/2026" (sem Intl, igual em qualquer device). */
export function shortDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split('-');
  if (!year || !month || !day) return '';
  return `${day}/${month}/${year}`;
}

/** 0.4 -> "400 m"; 2.34 -> "2,3 km". */
export function formatKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1).replace('.', ',')} km`;
}
