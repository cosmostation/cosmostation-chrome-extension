import { APTOS_NETWORKS } from '~/constants/chain';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import type { AptosNetwork } from '~/types/chain';

export function useCurrentShownAptosNetworks() {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();

  const { shownAptosNetworkIds } = extensionStorage;

  const currentShownAptosNetwork = APTOS_NETWORKS.filter((network) => shownAptosNetworkIds.includes(network.id));

  const addShownAptosNetwork = async (network: AptosNetwork) => {
    if (shownAptosNetworkIds.find((shownAptosNetworkId) => shownAptosNetworkId === network.id)) {
      return;
    }

    await setExtensionStorage('shownAptosNetworkIds', [...shownAptosNetworkIds, network.id]);
  };

  const addShownAptosNetworks = async (networks: AptosNetwork[]) => {
    const networkIds = networks.map((network) => network.id);

    const newShownAptosNetworkIds = Array.from(new Set([...shownAptosNetworkIds, ...networkIds]));

    await setExtensionStorage('shownAptosNetworkIds', newShownAptosNetworkIds);
  };

  const removeShownAptosNetwork = async (network: AptosNetwork) => {
    if (!shownAptosNetworkIds.find((shownAptosNetworkId) => shownAptosNetworkId === network.id)) {
      return;
    }

    const newShownAptosNetworkIds = shownAptosNetworkIds.filter((shownAptosNetworkId) => shownAptosNetworkId !== network.id);

    await setExtensionStorage('shownAptosNetworkIds', newShownAptosNetworkIds);
  };

  const removeShownAptosNetworks = async (networks: AptosNetwork[]) => {
    const networkIds = networks.map((network) => network.id);

    const newShownAptosNetworkIds = shownAptosNetworkIds.filter((shownAptosNetworkId) => !networkIds.includes(shownAptosNetworkId));

    await setExtensionStorage('shownAptosNetworkIds', newShownAptosNetworkIds);
  };

  return {
    currentShownAptosNetwork,
    addShownAptosNetwork,
    addShownAptosNetworks,
    removeShownAptosNetwork,
    removeShownAptosNetworks,
  };
}
