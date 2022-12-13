import { SUI_NETWORKS } from '~/constants/chain';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import type { SuiNetwork } from '~/types/chain';

export function useCurrentShownSuiNetworks() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { shownSuiNetworkIds } = chromeStorage;

  const currentShownSuiNetwork = SUI_NETWORKS.filter((network) => shownSuiNetworkIds.includes(network.id));

  const addShownSuiNetwork = async (network: SuiNetwork) => {
    if (shownSuiNetworkIds.find((shownSuiNetworkId) => shownSuiNetworkId === network.id)) {
      return;
    }

    await setChromeStorage('shownSuiNetworkIds', [...shownSuiNetworkIds, network.id]);
  };

  const removeShownSuiNetwork = async (network: SuiNetwork) => {
    if (!shownSuiNetworkIds.find((shownSuiNetworkId) => shownSuiNetworkId === network.id)) {
      return;
    }

    const newShownSuiNetworkIds = shownSuiNetworkIds.filter((shownSuiNetworkId) => shownSuiNetworkId !== network.id);

    await setChromeStorage('shownSuiNetworkIds', newShownSuiNetworkIds);
  };

  return {
    currentShownSuiNetwork,
    addShownSuiNetwork,
    removeShownSuiNetwork,
  };
}
