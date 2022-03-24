import { CHAINS } from '~/constants/chain';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import type { Chain, TendermintChain } from '~/types/chain';

export function useCurrentAdditionalChains() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { additionalChains } = chromeStorage;

  const tendermintAdditionalChains = additionalChains.filter((chain) => chain.line === 'TENDERMINT') as TendermintChain[];
  const ethereumAdditionalChains = additionalChains.filter((chain) => chain.line === 'ETHEREUM') as TendermintChain[];

  const addAdditionalChains = (chain: Chain) => setChromeStorage('additionalChains', [...additionalChains, chain]);
  const removeAdditionalChains = (chain: Chain) =>
    setChromeStorage(
      'additionalChains',
      additionalChains.filter((item) => item.id !== chain.id),
    );

  return {
    currentAdditionalChains: additionalChains,
    currentTendermintAdditionalChains: tendermintAdditionalChains,
    currentEthereumAdditionalChains: ethereumAdditionalChains,
    addAdditionalChains,
    removeAdditionalChains,
  };
}
