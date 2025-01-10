import { BITCOIN_CHAINS } from '~/constants/chain';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import type { BitcoinChain } from '~/types/chain';

export function useCurrentBitcoinNetwork() {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();

  const { selectedBitcoinChainId } = extensionStorage;

  const allNetworks = [...BITCOIN_CHAINS];

  const currentAccountSelectedBitcoinNetworkId = allNetworks.find((network) => network.id === selectedBitcoinChainId)?.id ?? allNetworks[0].id;

  const currentBitcoinNetwork = allNetworks.find((network) => network.id === currentAccountSelectedBitcoinNetworkId)!;

  const setCurrentBitcoinNetwork = async (chain: BitcoinChain) => {
    const newSelectedEthereumNetworkId = chain.id;

    await setExtensionStorage('selectedBitcoinChainId', newSelectedEthereumNetworkId);
  };

  return {
    bitcoinNetworks: allNetworks,
    currentBitcoinNetwork,
    setCurrentBitcoinNetwork,
  };
}
