/**
 * Camada de serviços — instância Axios central (feita na SEMANA 1).
 *
 * Responsabilidades:
 *  - baseURL e headers fixos do grupo (X-API-Key, X-Student-RM).
 *  - injetar o token do cliente logado (Authorization) via interceptor.
 *  - normalizar TODO erro da API para a classe ApiError { code, message, status }.
 *
 * Na SEMANA 2 nada muda aqui: o TanStack Query chama estes serviços como estão.
 */
import axios, { AxiosError } from 'axios';
import { env } from '@/env';
import { ApiError } from '@/types/api';

export const http = axios.create({
  baseURL: `${env.apiUrl}/v1`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': env.apiKey,
    'X-Student-RM': env.studentRm,
  },
});

// --- Token do cliente final (comprador) -----------------------------------
// Guardamos em memória e injetamos no header a cada request via interceptor.
let customerToken: string | null = null;

export function setCustomerToken(token: string | null) {
  customerToken = token;
}

/**
 * Avisa a sessão quando o servidor responde 401 COM um cliente logado (token expirado
 * ou revogado). Só dispara se havia token: um 401 no login (senha errada) não conta.
 */
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

http.interceptors.request.use((config) => {
  if (customerToken) {
    config.headers.set('Authorization', `Bearer ${customerToken}`);
  } else {
    config.headers.delete('Authorization');
  }
  return config;
});

// --- Normalização de erro --------------------------------------------------
// A API responde erro no formato: { error: { code, message } }.
// Convertemos qualquer falha (rede, timeout, HTTP) numa ApiError previsível,
// para que as telas/hooks nunca precisem inspecionar o objeto cru do Axios.
http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: { code?: string; message?: string } }>) => {
    const status = error.response?.status ?? 0;
    const payload = error.response?.data?.error;

    if (status === 401 && customerToken) unauthorizedHandler?.();

    if (payload) {
      return Promise.reject(new ApiError(payload.code ?? 'ERROR', payload.message ?? 'Erro na API', status));
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new ApiError('TIMEOUT', 'A requisição demorou demais.', status));
    }
    return Promise.reject(
      new ApiError('NETWORK_ERROR', 'Sem conexão com o servidor. Confira a URL da API.', status),
    );
  },
);
