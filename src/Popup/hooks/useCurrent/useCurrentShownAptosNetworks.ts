import { APTOS_NETWORKS } from '~/constants/chain';
import { useChromeStorage } from '~/Popup/hooks/useExtensionStorage';
import type { AptosNetwork } from '~/types/chain';

export function useCurrentShownAptosNetworks() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { shownAptosNetworkIds } = chromeStorage;

  const currentShownAptosNetwork = APTOS_NETWORKS.filter((network) => shownAptosNetworkIds.includes(network.id));

  const addShownAptosNetwork = async (network: AptosNetwork) => {
    if (shownAptosNetworkIds.find((shownAptosNetworkId) => shownAptosNetworkId === network.id)) {
      return;
    }

    await setChromeStorage('shownAptosNetworkIds', [...shownAptosNetworkIds, network.id]);
  };

  const addShownAptosNetworks = async (networks: AptosNetwork[]) => {
    const networkIds = networks.map((network) => network.id);

    const newShownAptosNetworkIds = Array.from(new Set([...shownAptosNetworkIds, ...networkIds]));

    await setChromeStorage('shownAptosNetworkIds', newShownAptosNetworkIds);
  };

  const removeShownAptosNetwork = async (network: AptosNetwork) => {
    if (!shownAptosNetworkIds.find((shownAptosNetworkId) => shownAptosNetworkId === network.id)) {
      return;
    }

    const newShownAptosNetworkIds = shownAptosNetworkIds.filter((shownAptosNetworkId) => shownAptosNetworkId !== network.id);

    await setChromeStorage('shownAptosNetworkIds', newShownAptosNetworkIds);
  };

  const removeShownAptosNetworks = async (networks: AptosNetwork[]) => {
    const networkIds = networks.map((network) => network.id);

    const newShownAptosNetworkIds = shownAptosNetworkIds.filter((shownAptosNetworkId) => !networkIds.includes(shownAptosNetworkId));

    await setChromeStorage('shownAptosNetworkIds', newShownAptosNetworkIds);
  };

  return {
    currentShownAptosNetwork,
    addShownAptosNetwork,
    addShownAptosNetworks,
    removeShownAptosNetwork,
    removeShownAptosNetworks,
  };
}
