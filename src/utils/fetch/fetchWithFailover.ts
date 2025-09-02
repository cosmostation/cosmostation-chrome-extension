import type { EthersProviderParam } from '@/types/evm/api';

export async function fetchWithFailover<T>(urls: string[], fetcher: (url: string) => Promise<T>): Promise<T> {
  for (const url of urls) {
    try {
      return await fetcher(url);
    } catch {
      continue;
    }
  }
  throw new Error('All endpoints failed');
}

export async function fetchWithFailoverEVM<T>(params: EthersProviderParam[], fetcher: (param: EthersProviderParam) => Promise<T>): Promise<T> {
  for (const param of params) {
    try {
      return await fetcher(param);
    } catch {
      continue;
    }
  }
  throw new Error('All endpoints failed');
}
