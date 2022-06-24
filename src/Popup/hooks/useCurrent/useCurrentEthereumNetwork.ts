import { v4 as uuidv4 } from 'uuid';

import { ETHEREUM_NETWORKS } from '~/constants/chain';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { emitToWeb } from '~/Popup/utils/message';
import type { EthereumNetwork } from '~/types/chain';

export function useCurrentEthereumNetwork() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { selectedEthereumNetworkId, additionalEthereumNetworks, allowedOrigins } = chromeStorage;

  const allNetworks = [...ETHEREUM_NETWORKS, ...additionalEthereumNetworks];

  const currentAccountSelectedEthereumNetworkId = allNetworks.find((network) => network.id === selectedEthereumNetworkId)?.id ?? allNetworks[0].id;

  const currentEthereumNetwork = allNetworks.find((network) => network.id === currentAccountSelectedEthereumNetworkId)!;

  const setCurrentEthereumNetwork = async (network: EthereumNetwork) => {
    const newSelectedEthereumNetworkId = network.id;

    await setChromeStorage('selectedEthereumNetworkId', newSelectedEthereumNetworkId);

    const origins = Array.from(new Set(allowedOrigins.map((item) => item.origin)));
    emitToWeb({ line: 'ETHEREUM', type: 'chainChanged', message: { result: network.chainId } }, origins);
  };

  const removeEthereumNetwork = async (network: EthereumNetwork) => {
    if (currentEthereumNetwork.id === network.id) {
      await setCurrentEthereumNetwork(ETHEREUM_NETWORKS[0]);
    }

    const newAdditionalEthereumNetworks = additionalEthereumNetworks.filter((item) => item.id !== network.id);

    await setChromeStorage('additionalEthereumNetworks', newAdditionalEthereumNetworks);
  };

  const addEthereumNetwork = async (network: Omit<EthereumNetwork, 'id'>) => {
    const officialChainId = ETHEREUM_NETWORKS.map((item) => item.chainId);

    if (officialChainId.includes(network.chainId)) return;

    const beforeNetwork = additionalEthereumNetworks.find((item) => item.chainId === network.chainId);

    const newAdditionalEthereumNetworks: EthereumNetwork[] = [
      ...additionalEthereumNetworks.filter((item) => item.chainId !== network.chainId),
      { ...network, id: beforeNetwork?.id || uuidv4() },
    ];

    await setChromeStorage('additionalEthereumNetworks', newAdditionalEthereumNetworks);
  };

  return {
    ethereumNetworks: allNetworks,
    additionalEthereumNetworks,
    currentEthereumNetwork,
    setCurrentEthereumNetwork,
    removeEthereumNetwork,
    addEthereumNetwork,
  };
}
