import { ETHEREUM_NETWORKS } from '~/constants/chain';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import type { EthereumNetwork } from '~/types/chain';

export function useCurrentShownEthereumNetworks() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { shownEthereumNetworkIds } = chromeStorage;

  const currentShownEthereumNetwork = ETHEREUM_NETWORKS.filter((network) => shownEthereumNetworkIds.includes(network.id));

  const addShownEthereumNetwork = async (network: EthereumNetwork) => {
    if (shownEthereumNetworkIds.find((shownEthereumNetworkId) => shownEthereumNetworkId === network.id)) {
      return;
    }

    await setChromeStorage('shownEthereumNetworkIds', [...shownEthereumNetworkIds, network.id]);
  };

  const removeShownEthereumNetwork = async (network: EthereumNetwork) => {
    if (!shownEthereumNetworkIds.find((shownEthereumNetworkId) => shownEthereumNetworkId === network.id)) {
      return;
    }

    const newShownEthereumNetworkIds = shownEthereumNetworkIds.filter((shownEthereumNetworkId) => shownEthereumNetworkId !== network.id);

    await setChromeStorage('shownEthereumNetworkIds', newShownEthereumNetworkIds);
  };

  return {
    currentShownEthereumNetwork,
    addShownEthereumNetwork,
    removeShownEthereumNetwork,
  };
}
