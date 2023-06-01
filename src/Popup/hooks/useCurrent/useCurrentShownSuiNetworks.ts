import { SUI_NETWORKS } from '~/constants/chain';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import type { SuiNetwork } from '~/types/chain';

export function useCurrentShownSuiNetworks() {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();

  const { shownSuiNetworkIds } = extensionStorage;

  const currentShownSuiNetwork = SUI_NETWORKS.filter((network) => shownSuiNetworkIds.includes(network.id));

  const addShownSuiNetwork = async (network: SuiNetwork) => {
    if (shownSuiNetworkIds.find((shownSuiNetworkId) => shownSuiNetworkId === network.id)) {
      return;
    }

    await setExtensionStorage('shownSuiNetworkIds', [...shownSuiNetworkIds, network.id]);
  };

  const addShownSuiNetworks = async (networks: SuiNetwork[]) => {
    const networkIds = networks.map((network) => network.id);

    const newShownSuiNetworkIds = Array.from(new Set([...shownSuiNetworkIds, ...networkIds]));

    await setExtensionStorage('shownSuiNetworkIds', newShownSuiNetworkIds);
  };

  const removeShownSuiNetwork = async (network: SuiNetwork) => {
    if (!shownSuiNetworkIds.find((shownSuiNetworkId) => shownSuiNetworkId === network.id)) {
      return;
    }

    const newShownSuiNetworkIds = shownSuiNetworkIds.filter((shownSuiNetworkId) => shownSuiNetworkId !== network.id);

    await setExtensionStorage('shownSuiNetworkIds', newShownSuiNetworkIds);
  };

  const removeShownSuiNetworks = async (networks: SuiNetwork[]) => {
    const networkIds = networks.map((network) => network.id);

    const newShownSuiNetworkIds = shownSuiNetworkIds.filter((shownSuiNetworkId) => !networkIds.includes(shownSuiNetworkId));

    await setExtensionStorage('shownSuiNetworkIds', newShownSuiNetworkIds);
  };

  return {
    currentShownSuiNetwork,
    addShownSuiNetwork,
    addShownSuiNetworks,
    removeShownSuiNetwork,
    removeShownSuiNetworks,
  };
}
