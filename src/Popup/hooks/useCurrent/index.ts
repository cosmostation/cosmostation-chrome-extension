import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useCurrentNetwork } from '~/Popup/hooks/useCurrent/useCurrentNetwork';
import { useInMemory } from '~/Popup/hooks/useInMemory';
import { getKeyPair } from '~/Popup/utils/common';
import { getAddress as getCosmosAddress } from '~/Popup/utils/cosmos';
import { getAddress as getEthereumAddress } from '~/Popup/utils/ethereum';
import type { Chain } from '~/types/chain';

export function useCurrent() {
  const { currentAccount, setCurrentAccount } = useCurrentAccount();
  const { currentChain, setCurrentChain } = useCurrentChain();
  const { currentNetwork, setCurrentNetwork } = useCurrentNetwork();
  const { inMemory } = useInMemory();

  const currentKeyPair = getKeyPair(currentAccount, currentChain, inMemory.password);
  const currentAddress = currentKeyPair?.publicKey ? getAddress(currentKeyPair.publicKey, currentChain) : null;

  return { currentAccount, currentChain, currentKeyPair, currentAddress, currentNetwork, setCurrentNetwork, setCurrentAccount, setCurrentChain };
}

function getAddress(publicKey: Buffer, chain: Chain) {
  if (chain.line === 'COSMOS') {
    return getCosmosAddress(publicKey, chain.bech32Prefix.address);
  }

  if (chain.line === 'ETHEREUM') {
    return getEthereumAddress(publicKey);
  }

  return null;
}
