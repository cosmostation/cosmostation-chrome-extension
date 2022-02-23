import { ETHEREUM_NETWORKS } from '~/constants/chain';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import type { EthereumNetwork } from '~/types/chain';

export function useCurrentNetwork() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { selectedEthereumNetworkId, additionalEthereumNetworks } = chromeStorage;

  const allNetworks = [...ETHEREUM_NETWORKS, ...additionalEthereumNetworks];

  const currentAccountSelectedNetworkId = selectedEthereumNetworkId ?? ETHEREUM_NETWORKS[0].id;

  const currentNetwork = allNetworks.find((network) => network.id === currentAccountSelectedNetworkId)!;

  const setCurrentNetwork = async (network: EthereumNetwork) => {
    await setChromeStorage('selectedEthereumNetworkId', network.id);
  };

  return { currentNetwork, setCurrentNetwork };
}
