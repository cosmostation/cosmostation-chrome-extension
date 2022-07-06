import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import type { Chain, CosmosChain, EthereumChain } from '~/types/chain';

export function useCurrentAdditionalChains() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { additionalChains } = chromeStorage;

  const cosmosAdditionalChains = additionalChains.filter((chain) => chain.line === 'COSMOS') as CosmosChain[];
  const ethereumAdditionalChains = additionalChains.filter((chain) => chain.line === 'ETHEREUM') as EthereumChain[];

  const addAdditionalChains = (chain: Chain) => setChromeStorage('additionalChains', [...additionalChains, chain]);
  const removeAdditionalChains = (chain: Chain) =>
    setChromeStorage(
      'additionalChains',
      additionalChains.filter((item) => item.id !== chain.id),
    );

  return {
    currentAdditionalChains: additionalChains,
    currentCosmosAdditionalChains: cosmosAdditionalChains,
    currentEthereumAdditionalChains: ethereumAdditionalChains,
    addAdditionalChains,
    removeAdditionalChains,
  };
}
