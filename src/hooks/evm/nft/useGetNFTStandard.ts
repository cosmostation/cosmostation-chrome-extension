import { useMemo } from 'react';
import { ethers } from 'ethers';

import { ERC721_ABI, ERC1155_ABI } from '@/constants/evm/abi';
import { ERC721_INTERFACE_ID, ERC1155_INTERFACE_ID } from '@/constants/evm/common';
import { TOKEN_TYPE } from '@/constants/evm/token';
import type { UseFetchConfig } from '@/hooks/common/useFetch';
import { useFetch } from '@/hooks/common/useFetch';
import { useChainList } from '@/hooks/useChainList';
import type { UniqueChainId } from '@/types/chain';
import type { ERC721SupportInterfacePayload, ERC1155SupportInterfacePayload } from '@/types/evm/contract';
import { isAxiosError } from '@/utils/axios';
import { ethersProvider } from '@/utils/ethereum/ethers';
import { isMatchingUniqueChainId } from '@/utils/queryParamGenerator';

type UseGetNFTStandardProps = {
  chainId?: UniqueChainId;
  contractAddress?: string;
  config?: UseFetchConfig;
};

export function useGetNFTStandard({ chainId, contractAddress, config }: UseGetNFTStandardProps) {
  const { chainList } = useChainList();

  const chain = useMemo(() => chainList.evmChains?.find((chain) => isMatchingUniqueChainId(chain, chainId)), [chainId, chainList]);

  const rpcURLs = chain?.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      if (!contractAddress) {
        return null;
      }

      const rpcURL = rpcURLs[index];

      const provider = ethersProvider(rpcURL);

      const erc721Contract = new ethers.Contract(contractAddress, ERC721_ABI, provider);

      const erc721ContractCall = erc721Contract.supportsInterface(ERC721_INTERFACE_ID) as Promise<ERC721SupportInterfacePayload>;
      const erc721ContractCallResponse = await erc721ContractCall;

      if (erc721ContractCallResponse) {
        return TOKEN_TYPE.ERC721;
      }

      const erc1155Contract = new ethers.Contract(contractAddress, ERC1155_ABI, provider);

      const erc1155ContractCall = erc1155Contract.supportsInterface(ERC1155_INTERFACE_ID) as Promise<ERC1155SupportInterfacePayload>;
      const erc1155ContractResponse = await erc1155ContractCall;

      if (erc1155ContractResponse) {
        return TOKEN_TYPE.ERC1155;
      }
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
    queryKey: ['useGetNFTStandard', contractAddress, chainId],
    fetchFunction: () => fetcher(),
    config: {
      retry: 3,
      enabled: !!chainId && !!contractAddress && !!rpcURLs.length,
      ...config,
    },
  });

  return { data, isLoading, isFetching, error, refetch };
}
