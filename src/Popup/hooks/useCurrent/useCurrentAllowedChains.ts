import { CHAINS } from '~/constants/chain';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';

export function useCurrentAllowedChains() {
  const { chromeStorage } = useChromeStorage();

  const { additionalChains, allowedChainIds } = chromeStorage;

  const allChains = [...CHAINS, ...additionalChains];

  const currentAllowedChains = allChains.filter((chain) => allowedChainIds.includes(chain.id));

  return { currentAllowedChains };
}
