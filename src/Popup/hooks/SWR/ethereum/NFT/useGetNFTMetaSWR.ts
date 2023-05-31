import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { TOKEN_TYPE as ETHEREUM_TOKEN_TYPE } from '~/constants/ethereum';
import { get } from '~/Popup/utils/axios';
import { convertIpfs } from '~/Popup/utils/sui';
import type { EthereumNetwork } from '~/types/chain';
import type { GetNFTMetaPayload } from '~/types/ethereum/nft';

import { useNFT721URISWR } from './ERC721/useNFT721URISWR';
import { useNFT1155URISWR } from './ERC1155/useNFT1155URISWR';
import { useGetNFTStandardSWR } from './useGetNFTStandardSWR';

type UseNFT721URISWR = {
  network?: EthereumNetwork;
  contractAddress?: string;
  tokenId?: string;
};

export function useGetNFTMetaSWR({ network, contractAddress, tokenId }: UseNFT721URISWR, config?: SWRConfiguration) {
  const { data: currentNFTStandard } = useGetNFTStandardSWR({ contractAddress });

  const { data: nft721MetaURI } = useNFT721URISWR({ network, contractAddress, tokenId });
  const { data: nft1155MetaURI } = useNFT1155URISWR({ network, contractAddress, tokenId });

  const paramURL = useMemo(() => {
    if (currentNFTStandard === ETHEREUM_TOKEN_TYPE.ERC721) {
      if (nft721MetaURI?.includes('ipfs:')) {
        return convertIpfs(nft721MetaURI);
      }
      return nft721MetaURI;
    }

    if (currentNFTStandard === ETHEREUM_TOKEN_TYPE.ERC1155) {
      if (nft1155MetaURI?.includes('ipfs:')) {
        return convertIpfs(nft1155MetaURI);
      }
      if (nft1155MetaURI?.includes('api.opensea.io')) {
        return nft1155MetaURI.replace('0x{id}', tokenId || '');
      }
      return nft1155MetaURI;
    }

    return '';
  }, [currentNFTStandard, nft1155MetaURI, nft721MetaURI, tokenId]);

  const fetcher = (fetchUrl: string) => get<GetNFTMetaPayload>(fetchUrl);

  const { data, error, mutate } = useSWR<GetNFTMetaPayload, AxiosError>(paramURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 0,
    isPaused: () => !contractAddress || !tokenId,
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
