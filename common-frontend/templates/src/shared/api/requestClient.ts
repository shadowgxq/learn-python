import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';

import { normalizeApiError } from './api-error';

const DEFAULT_REQUEST_TIMEOUT_MS = 10000;

export type RequestConfig<TData = unknown> = AxiosRequestConfig<TData>;
export type RequestClient = AxiosInstance;

function getApiTimeout() {
  const timeout = Number(import.meta.env.VITE_API_TIMEOUT_MS);
  return Number.isFinite(timeout) && timeout > 0 ? timeout : DEFAULT_REQUEST_TIMEOUT_MS;
}

export function createRequestClient(config: AxiosRequestConfig = {}): AxiosInstance {
  return axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || undefined,
    timeout: getApiTimeout(),
    ...config,
  });
}

export function createRequest(client: AxiosInstance) {
  return async function request<TResponse = unknown, TData = unknown>(
    config: RequestConfig<TData>,
  ): Promise<TResponse> {
    try {
      const response = await client.request<TResponse, AxiosResponse<TResponse>, TData>(config);
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  };
}

export const requestClient = createRequestClient();

export const request = createRequest(requestClient);

export type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
