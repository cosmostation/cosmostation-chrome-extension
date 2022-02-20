import { CHAINS, ETHEREUM_NETWORKS } from '~/constants/chain';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import type { Chain, EthereumNetwork } from '~/types/chain';
import type { SelectedEthereumNetworkId } from '~/types/chromeStorage';

export function useCurrentNetwork() {
  const { currentAccount } = useCurrentAccount();
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { selectedEthereumNetworkId, additionalEthereumNetworks } = chromeStorage;

  const allNetworks = [...ETHEREUM_NETWORKS, ...additionalEthereumNetworks];

  const currentAccountSelectedNetworkId = selectedEthereumNetworkId[currentAccount.id] ?? ETHEREUM_NETWORKS[0].id;

  const currentNetwork = allNetworks.find((network) => network.id === currentAccountSelectedNetworkId)!;

  const setCurrentNetwork = async (network: EthereumNetwork) => {
    const newSelecteNetworkId: SelectedEthereumNetworkId = { ...selectedEthereumNetworkId, [currentAccount.id]: network.id };

    await setChromeStorage('selectedEthereumNetworkId', newSelecteNetworkId);
  };

  return { currentNetwork, setCurrentNetwork };
}
