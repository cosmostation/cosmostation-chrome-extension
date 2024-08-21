import { BITCOIN_NETWORKS } from '~/constants/chain';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import type { BitcoinNetwork } from '~/types/chain';

export function useCurrentShownBitcoinNetworks() {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();

  const { shownBitcoinNetworkIds } = extensionStorage;

  const currentShownBitcoinNetwork = BITCOIN_NETWORKS.filter((network) => shownBitcoinNetworkIds.includes(network.id));

  const addShownBitcoinNetwork = async (network: BitcoinNetwork) => {
    if (shownBitcoinNetworkIds.find((shownBitcoinNetworkId) => shownBitcoinNetworkId === network.id)) {
      return;
    }

    await setExtensionStorage('shownBitcoinNetworkIds', [...shownBitcoinNetworkIds, network.id]);
  };

  const addShownBitcoinNetworks = async (networks: BitcoinNetwork[]) => {
    const networkIds = networks.map((network) => network.id);

    const newShownBitcoinNetworkIds = Array.from(new Set([...shownBitcoinNetworkIds, ...networkIds]));

    await setExtensionStorage('shownBitcoinNetworkIds', newShownBitcoinNetworkIds);
  };

  const removeShownBitcoinNetwork = async (network: BitcoinNetwork) => {
    if (!shownBitcoinNetworkIds.find((shownBitcoinNetworkId) => shownBitcoinNetworkId === network.id)) {
      return;
    }

    const newShownBitcoinNetworkIds = shownBitcoinNetworkIds.filter((shownBitcoinNetworkId) => shownBitcoinNetworkId !== network.id);

    await setExtensionStorage('shownBitcoinNetworkIds', newShownBitcoinNetworkIds);
  };

  const removeShownBitcoinNetworks = async (networks: BitcoinNetwork[]) => {
    const networkIds = networks.map((network) => network.id);

    const newShownBitcoinNetworkIds = shownBitcoinNetworkIds.filter((shownBitcoinNetworkId) => !networkIds.includes(shownBitcoinNetworkId));

    await setExtensionStorage('shownBitcoinNetworkIds', newShownBitcoinNetworkIds);
  };

  return {
    currentShownBitcoinNetwork,
    addShownBitcoinNetwork,
    addShownBitcoinNetworks,
    removeShownBitcoinNetwork,
    removeShownBitcoinNetworks,
  };
}
