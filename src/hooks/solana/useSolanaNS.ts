import { getAllDomains, resolve, reverseLookup } from '@bonfida/spl-name-service';
import { PublicKey } from '@solana/web3.js';

import { fetchWithFailover } from '@/utils/fetch/fetchWithFailover';
import { parseCoinId } from '@/utils/queryParamGenerator';
import { SolanaRpcClient } from '@/utils/solana/connection';
import { isSolanaNSDomain } from '@/utils/solana/nameService';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useChainList } from '../useChainList';

type UseSolanaResolveDomainProps = {
  coinId: string;
  domain: string;
  config?: UseFetchConfig;
};

export function useSolanaResolveDomain({ coinId, domain, config }: UseSolanaResolveDomainProps) {
  const { chainList } = useChainList();

  const { chainId: parsedChainId, chainType: parsedChainType } = parseCoinId(coinId);
  const rpcURLs =
    chainList.solanaChains?.find((chain) => chain.id === parsedChainId && chain.chainType === parsedChainType)?.rpcUrls.map((item) => item.url) || [];

  const fetcher = async () => {
    if (!domain) return null;

    const fetchFromUrl = async (url: string) => {
      const connection = SolanaRpcClient.getInstance({ rpcUrl: url }).getConnection();

      const resolvedAddress = await resolve(connection, domain);

      return resolvedAddress.toBase58();
    };
    return await fetchWithFailover(rpcURLs, fetchFromUrl);
  };

  return useFetch({
    queryKey: ['useSolanaResolveDomain', coinId, domain],
    fetchFunction: fetcher,
    config: {
      enabled: !!coinId && rpcURLs.length > 0 && !!domain && isSolanaNSDomain(domain),
      ...config,
    },
  });
}

type UseSolanaReverseLookupProps = {
  coinId: string;
  targetAddress: string;
  config?: UseFetchConfig;
};

export function useSolanaReverseLookup({ coinId, targetAddress, config }: UseSolanaReverseLookupProps) {
  const { chainList } = useChainList();

  const { chainId: parsedChainId, chainType: parsedChainType } = parseCoinId(coinId);
  const rpcURLs =
    chainList.solanaChains?.find((chain) => chain.id === parsedChainId && chain.chainType === parsedChainType)?.rpcUrls.map((item) => item.url) || [];

  const fetcher = async () => {
    if (!targetAddress) return null;

    const fetchFromUrl = async (url: string) => {
      try {
        const connection = SolanaRpcClient.getInstance({ rpcUrl: url }).getConnection();

        const ownerPublicKey = new PublicKey(targetAddress);

        const domains = await getAllDomains(connection, ownerPublicKey);

        if (!domains || domains.length === 0) {
          return null;
        }

        const domainName = await reverseLookup(connection, domains[0]);

        return domainName ? `${domainName}.sol` : null;
      } catch {
        return null;
      }
    };

    return await fetchWithFailover(rpcURLs, fetchFromUrl);
  };

  return useFetch({
    queryKey: ['useSolanaReverseLookup', coinId, targetAddress],
    fetchFunction: fetcher,
    config: {
      enabled: !!coinId && rpcURLs.length > 0 && !!targetAddress,
      ...config,
    },
  });
}

type UseSolanaGetAllDomainsProps = {
  coinId: string;
  targetAddress: string;
  config?: UseFetchConfig;
};

export function useSolanaGetAllDomains({ coinId, targetAddress, config }: UseSolanaGetAllDomainsProps) {
  const { chainList } = useChainList();

  const { chainId: parsedChainId, chainType: parsedChainType } = parseCoinId(coinId);
  const rpcURLs =
    chainList.solanaChains?.find((chain) => chain.id === parsedChainId && chain.chainType === parsedChainType)?.rpcUrls.map((item) => item.url) || [];

  const fetcher = async () => {
    if (!targetAddress) return [];

    const fetchFromUrl = async (url: string) => {
      try {
        const connection = SolanaRpcClient.getInstance({ rpcUrl: url }).getConnection();

        const ownerPublicKey = new PublicKey(targetAddress);
        const domainKeys = await getAllDomains(connection, ownerPublicKey);

        if (!domainKeys || domainKeys.length === 0) {
          return [];
        }

        const domainNames = await Promise.all(domainKeys.map((key) => reverseLookup(connection, key).catch(() => null)));

        return domainNames.filter((name): name is string => name !== null).map((name) => `${name}.sol`);
      } catch {
        return [];
      }
    };

    return await fetchWithFailover(rpcURLs, fetchFromUrl);
  };

  return useFetch({
    queryKey: ['useSolanaGetAllDomains', coinId, targetAddress],
    fetchFunction: fetcher,
    config: {
      enabled: !!coinId && rpcURLs.length > 0 && !!targetAddress,
      ...config,
    },
  });
}
