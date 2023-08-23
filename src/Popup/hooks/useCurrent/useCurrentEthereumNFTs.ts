import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { EthereumNFT } from '~/types/ethereum/nft';

import { useCurrentEthereumNetwork } from './useCurrentEthereumNetwork';

type AddEthereumNFTParams = Omit<EthereumNFT, 'id' | 'ethereumNetworkId'>;

export function useCurrentEthereumNFTs() {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const { ethereumNFTs } = extensionStorage;

  const currentEthereumNFTs = useMemo(
    () => ethereumNFTs.filter((item) => item.ethereumNetworkId === currentEthereumNetwork.id),
    [currentEthereumNetwork.id, ethereumNFTs],
  );

  const addEthereumNFT = async (nft: AddEthereumNFTParams) => {
    const newEthereumNFTs = [
      ...ethereumNFTs.filter(
        (item) =>
          !(
            isEqualsIgnoringCase(item.tokenId, nft.tokenId) &&
            isEqualsIgnoringCase(item.address, nft.address) &&
            isEqualsIgnoringCase(item.ownerAddress, nft.ownerAddress) &&
            item.ethereumNetworkId === currentEthereumNetwork.id
          ),
      ),
      { ...nft, id: uuidv4(), ethereumNetworkId: currentEthereumNetwork.id },
    ];

    await setExtensionStorage('ethereumNFTs', newEthereumNFTs);
  };

  const addEthereumNFTs = async (nfts: AddEthereumNFTParams[]) => {
    const filteredNFTs = nfts.filter(
      (nft, idx, self) =>
        self.findIndex(
          (item) =>
            isEqualsIgnoringCase(item.tokenId, nft.tokenId) &&
            isEqualsIgnoringCase(item.address, nft.address) &&
            isEqualsIgnoringCase(item.ownerAddress, nft.ownerAddress),
        ) === idx,
    );

    const newNFTs = filteredNFTs.map((nft) => ({ ...nft, id: uuidv4(), ethereumNetworkId: currentEthereumNetwork.id }));

    const newEthereumNFTs = [
      ...ethereumNFTs.filter(
        (item) =>
          !(
            filteredNFTs.find(
              (nft) =>
                isEqualsIgnoringCase(item.tokenId, nft.tokenId) &&
                isEqualsIgnoringCase(item.address, nft.address) &&
                isEqualsIgnoringCase(item.ownerAddress, nft.ownerAddress),
            ) && item.ethereumNetworkId === currentEthereumNetwork.id
          ),
      ),
      ...newNFTs,
    ];

    await setExtensionStorage('ethereumNFTs', newEthereumNFTs);
  };

  const removeEthereumNFT = async (nft: EthereumNFT) => {
    const newEthereumNFTs = ethereumNFTs.filter((item) => !(item.id === nft.id));

    await setExtensionStorage('ethereumNFTs', newEthereumNFTs);
  };

  return { currentEthereumNFTs, addEthereumNFT, removeEthereumNFT, addEthereumNFTs };
}
