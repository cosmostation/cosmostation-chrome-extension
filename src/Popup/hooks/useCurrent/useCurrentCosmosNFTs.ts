import { v4 as uuidv4 } from 'uuid';

import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { CosmosNFT } from '~/types/cosmos/nft';

import { useCurrentChain } from './useCurrentChain';

type AddCosmosNFTParams = Omit<CosmosNFT, 'id' | 'chainUniqueId'>;

export function useCurrentCosmosNFTs() {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();

  const { currentChain } = useCurrentChain();

  const { cosmosNFTs } = extensionStorage;

  const currentCosmosNFTs = cosmosNFTs.filter((item) => item.chainUniqueId === currentChain.id);

  const addCosmosNFT = async (nft: AddCosmosNFTParams) => {
    const newCosmosNFTs = [
      ...cosmosNFTs.filter(
        (item) =>
          !(
            isEqualsIgnoringCase(item.tokenId, nft.tokenId) &&
            isEqualsIgnoringCase(item.address, nft.address) &&
            isEqualsIgnoringCase(item.ownerAddress, nft.ownerAddress) &&
            item.chainUniqueId === currentChain.id
          ),
      ),
      { ...nft, id: uuidv4(), chainUniqueId: currentChain.id },
    ];

    await setExtensionStorage('cosmosNFTs', newCosmosNFTs);
  };

  const addCosmosNFTs = async (nfts: AddCosmosNFTParams[]) => {
    const filteredNFTs = nfts.filter(
      (nft, idx, self) =>
        self.findIndex(
          (item) =>
            isEqualsIgnoringCase(item.tokenId, nft.tokenId) &&
            isEqualsIgnoringCase(item.address, nft.address) &&
            isEqualsIgnoringCase(item.ownerAddress, nft.ownerAddress),
        ) === idx,
    );

    const newNFTs = filteredNFTs.map((nft) => ({ ...nft, id: uuidv4(), chainUniqueId: currentChain.id }));

    const newCosmosNFTs = [
      ...cosmosNFTs.filter(
        (item) =>
          !(
            filteredNFTs.find(
              (nft) =>
                isEqualsIgnoringCase(item.tokenId, nft.tokenId) &&
                isEqualsIgnoringCase(item.address, nft.address) &&
                isEqualsIgnoringCase(item.ownerAddress, nft.ownerAddress),
            ) && item.chainUniqueId === currentChain.id
          ),
      ),
      ...newNFTs,
    ];

    await setExtensionStorage('cosmosNFTs', newCosmosNFTs);
  };

  const removeCosmosNFT = async (nft: CosmosNFT) => {
    const newCosmosNFTs = cosmosNFTs.filter((item) => !(item.id === nft.id));

    await setExtensionStorage('cosmosNFTs', newCosmosNFTs);
  };

  return { currentCosmosNFTs, addCosmosNFT, removeCosmosNFT, addCosmosNFTs };
}
