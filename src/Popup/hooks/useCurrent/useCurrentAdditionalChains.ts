import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import type { Chain, CosmosChain, EthereumChain } from '~/types/chain';

export function useCurrentAdditionalChains() {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();

  const { additionalChains } = extensionStorage;

  const cosmosAdditionalChains = additionalChains.filter((chain) => chain.line === 'COSMOS') as CosmosChain[];
  const ethereumAdditionalChains = additionalChains.filter((chain) => chain.line === 'ETHEREUM') as EthereumChain[];

  const addAdditionalChains = (chain: Chain) => setExtensionStorage('additionalChains', [...additionalChains, chain]);
  const removeAdditionalChains = (chain: Chain) =>
    setExtensionStorage(
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
