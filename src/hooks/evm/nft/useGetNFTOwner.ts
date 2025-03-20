import { useMemo } from 'react';
import { ethers } from 'ethers';

import { ERC721_ABI, ERC1155_ABI } from '@/constants/evm/abi';
import { EVM_NFT_STANDARD } from '@/constants/evm/token';
import type { UseFetchConfig } from '@/hooks/common/useFetch';
import { useFetch } from '@/hooks/common/useFetch';
import { useChainList } from '@/hooks/useChainList';
import type { UniqueChainId } from '@/types/chain';
import type { EVMNFTStandard } from '@/types/evm/common';
import type { ERC721OwnerPayload, ERC1155BalanceOfPayload } from '@/types/evm/contract';
import { isAxiosError } from '@/utils/axios';
import { ethersProvider } from '@/utils/ethereum/ethers';
import { gt } from '@/utils/numbers';
import { isMatchingUniqueChainId } from '@/utils/queryParamGenerator';
import { isEqualsIgnoringCase } from '@/utils/string';

type UseGetNFTOwnerProps = {
  chainId?: UniqueChainId;
  ownerAddress?: string;
  contractAddress?: string;
  tokenId?: string;
  tokenStandard?: EVMNFTStandard;
  config?: UseFetchConfig;
};

export function useGetNFTOwner({ chainId, contractAddress, tokenId, ownerAddress, tokenStandard, config }: UseGetNFTOwnerProps) {
  const { chainList } = useChainList();

  const chain = useMemo(() => chainList.evmChains?.find((chain) => isMatchingUniqueChainId(chain, chainId)), [chainId, chainList]);

  const rpcURLs = chain?.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      if (!contractAddress || !tokenId || !tokenStandard) {
        return null;
      }

      const rpcURL = rpcURLs[index];

      const provider = ethersProvider(rpcURL);

      if (tokenStandard === EVM_NFT_STANDARD.ERC721) {
        const erc721Contract = new ethers.Contract(contractAddress, ERC721_ABI, provider);

        const erc721ContractCall = erc721Contract.ownerOf(tokenId) as Promise<ERC721OwnerPayload>;
        const erc721ContractCallResponse = await erc721ContractCall;

        return isEqualsIgnoringCase(erc721ContractCallResponse, ownerAddress);
      }
      if (tokenStandard === EVM_NFT_STANDARD.ERC1155) {
        const erc1155Contract = new ethers.Contract(contractAddress, ERC1155_ABI, provider);

        const erc1155ContractCall = erc1155Contract.balanceOf(ownerAddress, tokenId) as Promise<ERC1155BalanceOfPayload>;
        const erc1155ContractCallResponse = await erc1155ContractCall;

        return gt(BigInt(erc1155ContractCallResponse).toString(10), '0');
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
    queryKey: ['useGetNFTOwner', contractAddress, tokenId, ownerAddress, tokenStandard, chainId],
    fetchFunction: () => fetcher(),
    config: {
      retry: 3,
      refetchInterval: 1000 * 15,
      retryDelay: 1000 * 5,
      enabled: !!chainId && !!contractAddress && !!tokenId && !!ownerAddress && !!tokenStandard && !!rpcURLs.length,
      ...config,
    },
  });

  return { data, isLoading, isFetching, error, refetch };
}
