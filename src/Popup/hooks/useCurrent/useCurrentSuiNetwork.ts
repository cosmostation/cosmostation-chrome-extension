import { v4 as uuidv4 } from 'uuid';

import { SUI_NETWORKS } from '~/constants/chain';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { emitToWeb } from '~/Popup/utils/message';
// import { emitToWeb } from '~/Popup/utils/message';
import type { SuiNetwork } from '~/types/chain';

export function useCurrentSuiNetwork() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { selectedSuiNetworkId, additionalSuiNetworks, allowedOrigins } = chromeStorage;

  const allNetworks = [...SUI_NETWORKS, ...additionalSuiNetworks];

  const currentAccountSelectedSuiNetworkId = allNetworks.find((network) => network.id === selectedSuiNetworkId)?.id ?? allNetworks[0].id;

  const currentSuiNetwork = allNetworks.find((network) => network.id === currentAccountSelectedSuiNetworkId)!;

  const setCurrentSuiNetwork = async (network: SuiNetwork) => {
    const newSelectedSuiNetworkId = network.id;

    await setChromeStorage('selectedSuiNetworkId', newSelectedSuiNetworkId);

    const origins = Array.from(new Set(allowedOrigins.map((item) => item.origin)));

    emitToWeb({ line: 'SUI', type: 'networkChange', message: { result: network.networkName } }, origins);
  };

  const removeSuiNetwork = async (network: SuiNetwork) => {
    if (currentSuiNetwork.id === network.id) {
      await setCurrentSuiNetwork(SUI_NETWORKS[0]);
    }

    const newAdditionalSuiNetworks = additionalSuiNetworks.filter((item) => item.id !== network.id);

    await setChromeStorage('additionalSuiNetworks', newAdditionalSuiNetworks);
  };

  const addSuiNetwork = async (network: Omit<SuiNetwork, 'id'>) => {
    const officialChainId = SUI_NETWORKS.map((item) => item.rpcURL);

    if (officialChainId.includes(network.rpcURL)) return;

    const beforeNetwork = additionalSuiNetworks.find((item) => item.rpcURL === network.rpcURL);

    const newAdditionalSuiNetworks: SuiNetwork[] = [
      ...additionalSuiNetworks.filter((item) => item.rpcURL !== network.rpcURL),
      { ...network, id: beforeNetwork?.id || uuidv4() },
    ];

    await setChromeStorage('additionalSuiNetworks', newAdditionalSuiNetworks);
  };

  return {
    suiNetworks: allNetworks,
    additionalSuiNetworks,
    currentSuiNetwork,
    setCurrentSuiNetwork,
    removeSuiNetwork,
    addSuiNetwork,
  };
}
