import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { CosmosNFT } from '~/types/cosmos/nft';

import { useCurrentChain } from './useCurrentChain';

type AddCosmosNFTParams = Omit<CosmosNFT, 'id' | 'baseChainUUID'>;

export function useCurrentCosmosNFTs() {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();

  const { currentChain } = useCurrentChain();

  const { cosmosNFTs } = extensionStorage;

  const currentCosmosNFTs = useMemo(() => cosmosNFTs.filter((item) => item.baseChainUUID === currentChain.id), [cosmosNFTs, currentChain.id]);

  const addCosmosNFT = async (nft: AddCosmosNFTParams) => {
    const newCosmosNFTs = cosmosNFTs.find(
      (item) =>
        isEqualsIgnoringCase(item.tokenId, nft.tokenId) &&
        isEqualsIgnoringCase(item.address, nft.address) &&
        isEqualsIgnoringCase(item.ownerAddress, nft.ownerAddress) &&
        item.baseChainUUID === currentChain.id,
    )
      ? cosmosNFTs
      : [...cosmosNFTs, { ...nft, id: uuidv4(), baseChainUUID: currentChain.id }];

    await setExtensionStorage('cosmosNFTs', newCosmosNFTs);
  };

  const addCosmosNFTs = async (nfts: AddCosmosNFTParams[]) => {
    const filteredNFTs = nfts
      .filter(
        (nft, idx, self) =>
          self.findIndex(
            (item) =>
              isEqualsIgnoringCase(item.tokenId, nft.tokenId) &&
              isEqualsIgnoringCase(item.address, nft.address) &&
              isEqualsIgnoringCase(item.ownerAddress, nft.ownerAddress),
          ) === idx,
      )
      .filter(
        (item) =>
          !cosmosNFTs.find(
            (nft) =>
              isEqualsIgnoringCase(item.tokenId, nft.tokenId) &&
              isEqualsIgnoringCase(item.address, nft.address) &&
              isEqualsIgnoringCase(item.ownerAddress, nft.ownerAddress),
          ),
      );

    const newNFTs = filteredNFTs.map((nft) => ({ ...nft, id: uuidv4(), baseChainUUID: currentChain.id }));

    const newCosmosNFTs = [...cosmosNFTs, ...newNFTs];

    await setExtensionStorage('cosmosNFTs', newCosmosNFTs);
  };

  const removeCosmosNFT = async (nft: CosmosNFT) => {
    const newCosmosNFTs = cosmosNFTs.filter((item) => !(item.id === nft.id));

    await setExtensionStorage('cosmosNFTs', newCosmosNFTs);
  };

  return { currentCosmosNFTs, addCosmosNFT, removeCosmosNFT, addCosmosNFTs };
}
