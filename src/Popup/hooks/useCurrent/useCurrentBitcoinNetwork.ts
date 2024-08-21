import { BITCOIN_NETWORKS } from '~/constants/chain';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import type { BitcoinNetwork } from '~/types/chain';

export function useCurrentBitcoinNetwork() {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();

  const { selectedBitcoinNetworkId } = extensionStorage;

  const allNetworks = [...BITCOIN_NETWORKS];

  const currentAccountSelectedBitcoinNetworkId = allNetworks.find((network) => network.id === selectedBitcoinNetworkId)?.id ?? allNetworks[0].id;

  const currentBitcoinNetwork = allNetworks.find((network) => network.id === currentAccountSelectedBitcoinNetworkId)!;

  const setCurrentBitcoinNetwork = async (network: BitcoinNetwork) => {
    const newSelectedBitcoinNetworkId = network.id;

    await setExtensionStorage('selectedBitcoinNetworkId', newSelectedBitcoinNetworkId);
  };

  return {
    bitcoinNetworks: allNetworks,
    currentBitcoinNetwork,
    setCurrentBitcoinNetwork,
  };
}
