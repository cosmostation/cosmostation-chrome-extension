import { ETHEREUM_NETWORKS } from '~/constants/chain';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import type { EthereumNetwork } from '~/types/chain';

export function useCurrentShownEthereumNetworks() {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();

  const { shownEthereumNetworkIds } = extensionStorage;

  const currentShownEthereumNetwork = ETHEREUM_NETWORKS.filter((network) => shownEthereumNetworkIds.includes(network.id));

  const addShownEthereumNetwork = async (network: EthereumNetwork) => {
    if (shownEthereumNetworkIds.find((shownEthereumNetworkId) => shownEthereumNetworkId === network.id)) {
      return;
    }

    await setExtensionStorage('shownEthereumNetworkIds', [...shownEthereumNetworkIds, network.id]);
  };

  const addShownEthereumNetworks = async (networks: EthereumNetwork[]) => {
    const networkIds = networks.map((network) => network.id);

    const newShownEthereumNetworkIds = Array.from(new Set([...shownEthereumNetworkIds, ...networkIds]));

    await setExtensionStorage('shownEthereumNetworkIds', newShownEthereumNetworkIds);
  };

  const removeShownEthereumNetwork = async (network: EthereumNetwork) => {
    if (!shownEthereumNetworkIds.find((shownEthereumNetworkId) => shownEthereumNetworkId === network.id)) {
      return;
    }

    const newShownEthereumNetworkIds = shownEthereumNetworkIds.filter((shownEthereumNetworkId) => shownEthereumNetworkId !== network.id);

    await setExtensionStorage('shownEthereumNetworkIds', newShownEthereumNetworkIds);
  };

  const removeShownEthereumNetworks = async (networks: EthereumNetwork[]) => {
    const networkIds = networks.map((network) => network.id);

    const newShownEthereumNetworkIds = shownEthereumNetworkIds.filter((shownEthereumNetworkId) => !networkIds.includes(shownEthereumNetworkId));

    await setExtensionStorage('shownEthereumNetworkIds', newShownEthereumNetworkIds);
  };

  return {
    currentShownEthereumNetwork,
    addShownEthereumNetwork,
    addShownEthereumNetworks,
    removeShownEthereumNetwork,
    removeShownEthereumNetworks,
  };
}
