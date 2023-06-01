import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import { ethers, FetchRequest } from 'ethers';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ERC721_ABI, ERC1155_ABI } from '~/constants/abi';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { TOKEN_TYPE as ETHEREUM_TOKEN_TYPE } from '~/constants/ethereum';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { get } from '~/Popup/utils/axios';
import { convertIpfs } from '~/Popup/utils/sui';
import type { EthereumNetwork } from '~/types/chain';
import type { ERC721URIPayload, ERC1155URIPayload } from '~/types/ethereum/contract';
import type { GetNFTMetaPayload, GetNFTURIPayload } from '~/types/ethereum/nft';

import { useGetNFTStandardSWR } from './useGetNFTStandardSWR';

type FetcherParams = {
  rpcURL: string;
  contractAddress: string;
  tokenId: string;
};

type UseGetNFTMetaSWR = {
  network?: EthereumNetwork;
  contractAddress?: string;
  tokenId?: string;
};

export function useGetNFTMetaSWR({ network, contractAddress, tokenId }: UseGetNFTMetaSWR, config?: SWRConfiguration) {
  const { currentChain } = useCurrentChain();
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const { data: currentNFTStandard } = useGetNFTStandardSWR({ contractAddress });

  const rpcURL = network?.rpcURL || currentEthereumNetwork.rpcURL;

  const nftMetaURIfetcher = async (params: FetcherParams) => {
    const customFetchRequest = new FetchRequest(rpcURL);

    customFetchRequest.setHeader('Cosmostation', `extension/${String(process.env.VERSION)}`);

    const provider = new ethers.JsonRpcProvider(customFetchRequest);

    if (currentNFTStandard === ETHEREUM_TOKEN_TYPE.ERC721) {
      const erc721Contract = new ethers.Contract(params.contractAddress, ERC721_ABI, provider);

      const erc721ContractCall = erc721Contract.tokenURI(params.tokenId) as Promise<ERC721URIPayload>;
      const erc721ContractCallResponse = await erc721ContractCall;
      return erc721ContractCallResponse;
    }

    if (currentNFTStandard === ETHEREUM_TOKEN_TYPE.ERC1155) {
      const erc1155Contract = new ethers.Contract(params.contractAddress, ERC1155_ABI, provider);

      const erc1155ContractCall = erc1155Contract.uri(params.tokenId) as Promise<ERC1155URIPayload>;
      const erc1155ContractCallResponse = await erc1155ContractCall;
      return erc1155ContractCallResponse;
    }
    return undefined;
  };

  const { data: nftMetaURI } = useSWR<GetNFTURIPayload | undefined, AxiosError>({ rpcURL, contractAddress, tokenId }, nftMetaURIfetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 0,
    isPaused: () => currentChain.id !== ETHEREUM.id || !contractAddress || !tokenId || !rpcURL,
    ...config,
  });

  const paramURL = useMemo(() => {
    if (nftMetaURI?.includes('ipfs:')) {
      return convertIpfs(nftMetaURI);
    }

    if (nftMetaURI?.includes('api.opensea.io')) {
      return nftMetaURI.replace('0x{id}', tokenId || '');
    }
    return nftMetaURI || '';
  }, [nftMetaURI, tokenId]);

  const fetcher = (fetchUrl: string) => get<GetNFTMetaPayload>(fetchUrl);

  const { data, error, mutate } = useSWR<GetNFTMetaPayload, AxiosError>(paramURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 0,
    isPaused: () => !paramURL,
    ...config,
  });

  const returnData = data
    ? {
        ...data,
        image: convertIpfs(data.image),
        metaURI: paramURL,
      }
    : undefined;

  return { data: returnData, error, mutate };
}
