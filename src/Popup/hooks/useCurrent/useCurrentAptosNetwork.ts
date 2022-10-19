import { v4 as uuidv4 } from 'uuid';

import { APTOS_NETWORKS } from '~/constants/chain';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { emitToWeb } from '~/Popup/utils/message';
// import { emitToWeb } from '~/Popup/utils/message';
import type { AptosNetwork } from '~/types/chain';

export function useCurrentAptosNetwork() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { selectedAptosNetworkId, additionalAptosNetworks, allowedOrigins } = chromeStorage;

  const allNetworks = [...APTOS_NETWORKS, ...additionalAptosNetworks];

  const currentAccountSelectedAptosNetworkId = allNetworks.find((network) => network.id === selectedAptosNetworkId)?.id ?? allNetworks[0].id;

  const currentAptosNetwork = allNetworks.find((network) => network.id === currentAccountSelectedAptosNetworkId)!;

  const setCurrentAptosNetwork = async (network: AptosNetwork) => {
    const newSelectedAptosNetworkId = network.id;

    await setChromeStorage('selectedAptosNetworkId', newSelectedAptosNetworkId);

    const origins = Array.from(new Set(allowedOrigins.map((item) => item.origin)));

    emitToWeb({ line: 'APTOS', type: 'networkChange', message: { result: network.networkName } }, origins);
  };

  const removeAptosNetwork = async (network: AptosNetwork) => {
    if (currentAptosNetwork.id === network.id) {
      await setCurrentAptosNetwork(APTOS_NETWORKS[0]);
    }

    const newAdditionalAptosNetworks = additionalAptosNetworks.filter((item) => item.id !== network.id);

    await setChromeStorage('additionalAptosNetworks', newAdditionalAptosNetworks);
  };

  const addAptosNetwork = async (network: Omit<AptosNetwork, 'id'>) => {
    const officialChainId = APTOS_NETWORKS.map((item) => item.chainId);

    if (officialChainId.includes(network.chainId)) return;

    const beforeNetwork = additionalAptosNetworks.find((item) => item.chainId === network.chainId);

    const newAdditionalAptosNetworks: AptosNetwork[] = [
      ...additionalAptosNetworks.filter((item) => item.chainId !== network.chainId),
      { ...network, id: beforeNetwork?.id || uuidv4() },
    ];

    await setChromeStorage('additionalAptosNetworks', newAdditionalAptosNetworks);
  };

  return {
    aptosNetworks: allNetworks,
    additionalAptosNetworks,
    currentAptosNetwork,
    setCurrentAptosNetwork,
    removeAptosNetwork,
    addAptosNetwork,
  };
}
