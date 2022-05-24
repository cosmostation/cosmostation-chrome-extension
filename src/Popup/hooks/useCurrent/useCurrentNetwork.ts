import { ETHEREUM_NETWORKS } from '~/constants/chain';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import type { EthereumChain, EthereumNetwork } from '~/types/chain';

export function useCurrentNetwork(chain: EthereumChain) {
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { selectedNetworkId, additionalNetworks } = chromeStorage;

  const parentId = chain.id;

  const allNetworks = [...ETHEREUM_NETWORKS, ...additionalNetworks].filter((item) => item.parentId === parentId);

  const currentAccountSelectedNetworkId = selectedNetworkId?.[parentId] ?? allNetworks[0].id;

  const currentNetwork = allNetworks.find((network) => network.id === currentAccountSelectedNetworkId)!;

  const setCurrentNetwork = async (network: EthereumNetwork) => {
    const newSelectedNetworkId = { ...selectedNetworkId, [network.parentId]: network.id };
    await setChromeStorage('selectedNetworkId', newSelectedNetworkId);
  };

  return { currentNetwork, setCurrentNetwork };
}
