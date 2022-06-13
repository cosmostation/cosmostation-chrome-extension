import { ETHEREUM_NETWORKS } from '~/constants/chain';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import type { EthereumNetwork } from '~/types/chain';

export function useCurrentEthereumNetwork() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { selectedEthereumNetworkId, additionalEthereumNetworks } = chromeStorage;

  const allNetworks = [...ETHEREUM_NETWORKS, ...additionalEthereumNetworks];

  const currentAccountSelectedEthereumNetworkId = allNetworks.find((network) => network.id === selectedEthereumNetworkId)?.id ?? allNetworks[0].id;

  const currentNetwork = allNetworks.find((network) => network.id === currentAccountSelectedEthereumNetworkId)!;

  const setCurrentNetwork = async (network: EthereumNetwork) => {
    const newselectedEthereumNetworkId = network.id;
    await setChromeStorage('selectedEthereumNetworkId', newselectedEthereumNetworkId);
  };

  return { currentNetwork, setCurrentNetwork };
}
