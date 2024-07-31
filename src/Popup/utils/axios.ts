import type { AxiosError, AxiosRequestConfig } from 'axios';
import axios from 'axios';

export async function get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await axios.get<T>(path, {
    ...config,
    headers: {
      Cosmostation: `extension/${String(process.env.VERSION)}`,
      ...config?.headers,
    },
  });
  return data;
}

export async function post<T>(path: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await axios.post<T>(path, body, {
    ...config,
    headers: {
      Cosmostation: `extension/${String(process.env.VERSION)}`,
      ...config?.headers,
    },
  });
  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isAxiosError(e: any): e is AxiosError {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return typeof e?.response?.status === 'number';
}
