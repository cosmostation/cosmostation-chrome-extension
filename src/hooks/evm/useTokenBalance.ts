import { Contract, ethers } from 'ethers';

import { ERC20_ABI } from '@/constants/evm/abi';
import type { EvmChain } from '@/types/chain';
import { isAxiosError } from '@/utils/axios';

import { useCurrentEVMNetwork } from './useCurrentEvmNetwork';
import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';

type UseTokenBalanceProps = {
  tokenContractAddress: string;
  address?: string;
  chain?: EvmChain;
  config?: UseFetchConfig;
};

export function useTokenBalance({ address, tokenContractAddress, chain, config }: UseTokenBalanceProps) {
  const { currentEVMNetwork } = useCurrentEVMNetwork();

  const selectedChain = chain || currentEVMNetwork;

  const rpcURLs = selectedChain?.rpcUrls.map((item) => item.url) || [];

  const providers = rpcURLs.map(
    (rpcUrl) =>
      new ethers.JsonRpcProvider(rpcUrl, undefined, {
        batchMaxCount: 1,
        polling: false,
        staticNetwork: true,
      }),
  );

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      const provider = providers[index];

      const contract = new Contract(tokenContractAddress, ERC20_ABI, provider);
      const response: bigint = await contract.balanceOf(address);

      const balance = response.toString();

      return balance;
    } catch (e) {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }

      return fetcher(index + 1);
    }
  };

  const { data, isLoading, isFetching, error, refetch } = useFetch({
    queryKey: ['useEvmTokenBalance', address, tokenContractAddress, selectedChain],
    fetchFunction: () => fetcher(),
    config: {
      refetchInterval: 1000 * 20,
      enabled: !!selectedChain && !!address && !!tokenContractAddress && !!rpcURLs.length,
      ...config,
    },
  });

  return { data, isLoading, isFetching, error, refetch };
}
