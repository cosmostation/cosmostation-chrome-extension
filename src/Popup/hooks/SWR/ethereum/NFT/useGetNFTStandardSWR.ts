import { useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

import { TOKEN_TYPE } from '~/constants/ethereum';
import type { EthereumNetwork } from '~/types/chain';

import { useNFT721CheckSWR } from './ERC721/useNFT721CheckSWR';
import { useNFT1155CheckSWR } from './ERC1155/useNFT1155CheckSWR';

type UseGetNFTStandardSWR = {
  network?: EthereumNetwork;
  contractAddress?: string;
};

export function useGetNFTStandardSWR({ network, contractAddress }: UseGetNFTStandardSWR, config?: SWRConfiguration) {
  const { data: isNFT721 } = useNFT721CheckSWR({ network, contractAddress }, config);

  const { data: isNFT1155 } = useNFT1155CheckSWR({ network, contractAddress }, config);

  const tokenType = useMemo(() => {
    if (isNFT721 && !isNFT1155) {
      return TOKEN_TYPE.ERC721;
    }
    if (!isNFT721 && isNFT1155) {
      return TOKEN_TYPE.ERC1155;
    }
    return undefined;
  }, [isNFT1155, isNFT721]);

  return { data: tokenType };
}
