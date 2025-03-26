import { useMemo } from 'react';

import type { UseFetchConfig } from '@/hooks/common/useFetch';
import { useFetchFailover } from '@/hooks/common/useFetchFailover';
import { useChainList } from '@/hooks/useChainList';
import type { UniqueChainId } from '@/types/chain';
import type { ContractInfoResponse } from '@/types/cosmos/contract';
import { get, isAxiosError } from '@/utils/axios';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { isMatchingUniqueChainId, parseUniqueChainId } from '@/utils/queryParamGenerator';
import { getCosmosAddressRegex } from '@/utils/regex';

type UseContractsInfoParam = {
  contractAddress: string;
  chainId?: UniqueChainId;
};

type UseContractsInfoProps = {
  params?: UseContractsInfoParam[];
  config?: UseFetchConfig;
};

export function useContractsInfo({ params, config }: UseContractsInfoProps) {
  const { chainList } = useChainList();

  const isValidParams = useMemo(() => {
    return (
      !!params &&
      params.length > 0 &&
      params.every((param) => {
        const { chainId, contractAddress } = param;
        return !!chainId && !!contractAddress;
      })
    );
  }, [params]);

  const fetchContractInfo = async (param: UseContractsInfoParam) => {
    const { chainId: uniqueChainId, contractAddress } = param;

    if (!uniqueChainId) return null;

    const chain = chainList.cosmosChains?.find((chain) => isMatchingUniqueChainId(chain, uniqueChainId));
    if (!chain) return null;

    const regex = getCosmosAddressRegex(chain.accountPrefix || '', [39, 59]);
    if (!regex.test(contractAddress)) return null;

    const { id: chainlistChainId } = parseUniqueChainId(uniqueChainId);
    const cosmosEndpoints = chain.lcdUrls.map((chainEndpoint) => cosmosURL(chainEndpoint.url, chainlistChainId));
    const requestURLs = cosmosEndpoints.map((cosmosEndpoint) => cosmosEndpoint.getCW721ContractInfo(contractAddress));

    for (const requestURL of requestURLs) {
      try {
        const returnData = await get<ContractInfoResponse>(requestURL, { timeout: 1000 * 2 });
        return {
          contractAddress,
          chainId: uniqueChainId,
          contractInfo: returnData.data,
        };
      } catch (e) {
        if (isAxiosError(e) && e.response?.status === 404) {
          return null;
        }
        continue;
      }
    }

    throw new Error('All endpoints failed');
  };

  const contractsInfoQueryResponse = useFetchFailover({
    params: params || [],
    fetchFunction: fetchContractInfo,
    queryKey: 'useCosmosContractsInfo',
    config: {
      enabled: isValidParams && !!chainList.cosmosChains?.length,
      staleTime: Infinity,
      retry: 0,
      ...config,
    },
  });

  return contractsInfoQueryResponse;
}
