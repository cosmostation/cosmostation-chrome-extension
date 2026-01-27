import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

import { isAptosNSDomain } from '@/utils/aptos/nameService';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';

type UseAptosResolveDomainProps = {
  domain?: string;
  config?: UseFetchConfig;
};

export function useAptosResolveDomain({ domain, config }: UseAptosResolveDomainProps) {
  const fetcher = async () => {
    if (!domain) {
      return null;
    }

    const aptosClient = new Aptos(new AptosConfig({ network: Network.MAINNET }));

    const resolvedAddress = await aptosClient.getName({ name: domain });

    return resolvedAddress;
  };

  const { data, isLoading, isFetching, error, refetch } = useFetch({
    queryKey: ['useAptosResolveDomain', domain],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!domain && isAptosNSDomain(domain),
      ...config,
    },
  });

  return { data, isLoading, isFetching, error, refetch };
}
