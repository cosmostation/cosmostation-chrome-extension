import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import { ethers } from 'ethers';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ERC721_ABI, ERC1155_ABI } from '~/constants/abi';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { TOKEN_TYPE } from '~/constants/ethereum';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { isAxiosError } from '~/Popup/utils/axios';
import { ethersProvider } from '~/Popup/utils/ethereum';
import type { EthereumNetwork } from '~/types/chain';
import type { EthereumNFTStandard } from '~/types/ethereum/common';
import type { ERC721URIPayload, ERC1155URIPayload } from '~/types/ethereum/contract';
import type { GetNFTURIPayload } from '~/types/ethereum/nft';

type FetcherParams = {
  rpcURL: string;
  contractAddress: string;
  tokenId: string;
  tokenStandard: EthereumNFTStandard;
};

type UseGetNFTURISWR = {
  network?: EthereumNetwork;
  contractAddress?: string;
  tokenId?: string;
  tokenStandard?: EthereumNFTStandard;
};

export function useGetNFTURISWR({ network, contractAddress, tokenId, tokenStandard }: UseGetNFTURISWR, config?: SWRConfiguration) {
  const { currentChain } = useCurrentChain();
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const rpcURL = useMemo(() => network?.rpcURL || currentEthereumNetwork.rpcURL, [currentEthereumNetwork.rpcURL, network?.rpcURL]);

  const fetcher = async (params: FetcherParams) => {
    const provider = ethersProvider(rpcURL);

    try {
      if (params.tokenStandard === TOKEN_TYPE.ERC721) {
        const erc721Contract = new ethers.Contract(params.contractAddress, ERC721_ABI, provider);

        const erc721ContractCall = erc721Contract.tokenURI(params.tokenId) as Promise<ERC721URIPayload>;
        const erc721ContractCallResponse = await erc721ContractCall;

        return erc721ContractCallResponse;
      }

      if (params.tokenStandard === TOKEN_TYPE.ERC1155) {
        const erc1155Contract = new ethers.Contract(params.contractAddress, ERC1155_ABI, provider);

        const erc1155ContractCall = erc1155Contract.uri(params.tokenId) as Promise<ERC1155URIPayload>;
        const erc1155ContractCallResponse = await erc1155ContractCall;

        return erc1155ContractCallResponse;
      }
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }
      throw e;
    }
    return null;
  };

  const { data, isValidating, error, mutate } = useSWR<GetNFTURIPayload | null, AxiosError>(
    { id: 'uri', rpcURL, contractAddress, tokenId, tokenStandard },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      isPaused: () => currentChain.id !== ETHEREUM.id || !contractAddress || !tokenId || !tokenStandard || !rpcURL,
      ...config,
    },
  );

  return { data, isValidating, error, mutate };
}
