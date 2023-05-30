import { useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

import { gt } from '~/Popup/utils/big';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { EthereumNetwork } from '~/types/chain';

import { useNFT721OwnerSWR } from './ERC721/useNFT721OwnerSWR';
import { useNFT1155BalanceSWR } from './ERC1155/useNFT1155BalanceSWR';
import { useGetNFTStandardSWR } from './useGetNFTStandardSWR';

type UseGetNFTOwnerSWR = {
  network?: EthereumNetwork;
  ownerAddress?: string;
  contractAddress?: string;
  tokenId?: string;
};

export function useGetNFTOwnerSWR({ network, contractAddress, ownerAddress, tokenId }: UseGetNFTOwnerSWR, config?: SWRConfiguration) {
  const { data: tokenType } = useGetNFTStandardSWR({ contractAddress });

  const { data: nft721OwnerAddress } = useNFT721OwnerSWR({ network, contractAddress, tokenId }, config);
  const { data: nft1155Balance } = useNFT1155BalanceSWR({ network, contractAddress, ownerAddress, tokenId }, config);

  const isOwnedNFT = useMemo(() => {
    if (tokenType === 'ERC721' && nft721OwnerAddress) {
      return isEqualsIgnoringCase(nft721OwnerAddress, ownerAddress);
    }
    if (tokenType === 'ERC1155' && nft1155Balance) {
      return gt(nft1155Balance, '0');
    }
    return undefined;
  }, [nft1155Balance, nft721OwnerAddress, ownerAddress, tokenType]);

  return { data: isOwnedNFT };
}
