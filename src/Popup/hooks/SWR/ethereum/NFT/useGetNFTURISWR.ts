import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import { ethers, FetchRequest } from 'ethers';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ERC721_ABI, ERC1155_ABI } from '~/constants/abi';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { TOKEN_TYPE } from '~/constants/ethereum';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { isAxiosError } from '~/Popup/utils/axios';
import { convertIpfs } from '~/Popup/utils/sui';
import type { EthereumNetwork } from '~/types/chain';
import type { ERC721URIPayload, ERC1155URIPayload } from '~/types/ethereum/contract';
import type { GetNFTURIPayload } from '~/types/ethereum/nft';

import { useGetNFTStandardSWR } from './useGetNFTStandardSWR';

type FetcherParams = {
  rpcURL: string;
  contractAddress: string;
  tokenId: string;
};

type UseGetNFTURISWR = {
  network?: EthereumNetwork;
  contractAddress?: string;
  tokenId?: string;
};

export function useGetNFTURISWR({ network, contractAddress, tokenId }: UseGetNFTURISWR, config?: SWRConfiguration) {
  const { currentChain } = useCurrentChain();
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const getNFTStandard = useGetNFTStandardSWR({ contractAddress }, config);

  // NOTE 서스펜스가 안걸려 있어서 나중에 값이 들어오면 실행이 안되나?

  const rpcURL = network?.rpcURL || currentEthereumNetwork.rpcURL;

  const fetcher = async (params: FetcherParams) => {
    const customFetchRequest = new FetchRequest(rpcURL);

    customFetchRequest.setHeader('Cosmostation', `extension/${String(process.env.VERSION)}`);

    const provider = new ethers.JsonRpcProvider(customFetchRequest);
    try {
      if (getNFTStandard.error) {
        throw getNFTStandard.error;
      }

      if (getNFTStandard.data === TOKEN_TYPE.ERC721) {
        const erc721Contract = new ethers.Contract(params.contractAddress, ERC721_ABI, provider);

        const erc721ContractCall = erc721Contract.tokenURI(params.tokenId) as Promise<ERC721URIPayload>;
        const erc721ContractCallResponse = await erc721ContractCall;

        return erc721ContractCallResponse;
      }

      if (getNFTStandard.data === TOKEN_TYPE.ERC1155) {
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

  const { data, error, mutate } = useSWR<GetNFTURIPayload | null, AxiosError>({ id: 'uri', rpcURL, contractAddress, tokenId }, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 5,
    errorRetryInterval: 5000,
    isPaused: () => currentChain.id !== ETHEREUM.id || !contractAddress || !tokenId || !getNFTStandard.data || !rpcURL,
    ...config,
  });

  const returnData = useMemo(() => {
    if (data) {
      if (data?.includes('ipfs:')) {
        return convertIpfs(data);
      }

      if (data?.includes('api.opensea.io')) {
        return data.replace('0x{id}', tokenId || '');
      }
      return data;
    }
    return '';
  }, [data, tokenId]);

  return { data: returnData, error, mutate };
}
