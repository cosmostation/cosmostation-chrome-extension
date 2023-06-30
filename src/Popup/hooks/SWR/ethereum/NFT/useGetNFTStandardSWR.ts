import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import { ethers } from 'ethers';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ERC721_ABI, ERC1155_ABI } from '~/constants/abi';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { ERC721_INTERFACE_ID, ERC1155_INTERFACE_ID, TOKEN_TYPE } from '~/constants/ethereum';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { isAxiosError } from '~/Popup/utils/axios';
import { ethersProvider } from '~/Popup/utils/ethereum';
import type { EthereumNetwork } from '~/types/chain';
import type { ERC721SupportInterfacePayload, ERC1155SupportInterfacePayload } from '~/types/ethereum/contract';
import type { GetNFTStandardPayload } from '~/types/ethereum/nft';

type FetcherParams = {
  rpcURL: string;
  contractAddress: string;
  erc721InterfaceId: string;
  erc1155InterfaceId: string;
};

type UseGetNFTStandardSWR = {
  network?: EthereumNetwork;
  contractAddress?: string;
};

export function useGetNFTStandardSWR({ network, contractAddress }: UseGetNFTStandardSWR, config?: SWRConfiguration) {
  const { currentChain } = useCurrentChain();
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const rpcURL = useMemo(() => network?.rpcURL || currentEthereumNetwork.rpcURL, [currentEthereumNetwork.rpcURL, network?.rpcURL]);

  const fetcher = async (params: FetcherParams) => {
    const provider = ethersProvider(rpcURL);

    try {
      const erc721Contract = new ethers.Contract(params.contractAddress, ERC721_ABI, provider);

      const erc721ContractCall = erc721Contract.supportsInterface(params.erc721InterfaceId) as Promise<ERC721SupportInterfacePayload>;
      const erc721ContractCallResponse = await erc721ContractCall;

      if (erc721ContractCallResponse) {
        return TOKEN_TYPE.ERC721;
      }

      const erc1155Contract = new ethers.Contract(params.contractAddress, ERC1155_ABI, provider);

      const erc1155ContractCall = erc1155Contract.supportsInterface(params.erc1155InterfaceId) as Promise<ERC1155SupportInterfacePayload>;
      const erc1155ContractResponse = await erc1155ContractCall;

      if (erc1155ContractResponse) {
        return TOKEN_TYPE.ERC1155;
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

  const { data, isValidating, error, mutate } = useSWR<GetNFTStandardPayload | null, AxiosError>(
    { rpcURL, contractAddress, erc721InterfaceId: ERC721_INTERFACE_ID, erc1155InterfaceId: ERC1155_INTERFACE_ID },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      isPaused: () => currentChain.id !== ETHEREUM.id || !contractAddress || !rpcURL,
      ...config,
    },
  );

  return { data, isValidating, error, mutate };
}
