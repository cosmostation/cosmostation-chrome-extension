import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';

function getCommonConfig(config?: AxiosRequestConfig): AxiosRequestConfig {
  return {
    ...config,
    headers: {
      Cosmostation: `extension/${__APP_VERSION__}`,
      ...config?.headers,
    },
  };
}

export async function get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await axios.get<T>(path, getCommonConfig(config));
  return data;
}

export async function getWithFullResponse<T>(path: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  const response = await axios.get<T>(path, getCommonConfig(config));

  return response;
}

export async function post<T>(path: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await axios.post<T>(path, body, {
    ...config,
    headers: {
      Cosmostation: `extension/${__APP_VERSION__}`,
      ...config?.headers,
    },
  });
  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isAxiosError(e: any): e is AxiosError {
  return typeof e?.response?.status === 'number';
}
