import { getAddress as getBech32Address } from '~/Popup/utils/cosmos';
import { getAddress as getEthereumAddress } from '~/Popup/utils/ethereum';
import type { Chain } from '~/types/chain';

export function getAddress(chain: Chain, publicKey?: Buffer) {
  if (!publicKey) {
    return '';
  }
  if (chain.line === 'COSMOS') {
    return getBech32Address(publicKey, chain.bech32Prefix.address);
  }

  if (chain.line === 'ETHEREUM') {
    return getEthereumAddress(publicKey);
  }

  return '';
}
