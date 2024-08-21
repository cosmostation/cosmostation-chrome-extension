import { ALTHEA as COSMOS_ALTHEA } from '~/constants/chain/cosmos/althea';
import { MINTSCAN_URL } from '~/constants/common';
import type { BitcoinNetwork } from '~/types/chain';

export const BITCOIN: BitcoinNetwork = {
  id: '656bebf4-9f02-462e-8d35-61991c89fa8e',
  networkName: 'BITCOIN',
  rpcURL: 'https://rpc-office.cosmostation.io/bitcoin/',
  tokenImageURL: COSMOS_ALTHEA.tokenImageURL,
  imageURL: COSMOS_ALTHEA.imageURL,
  displayDenom: COSMOS_ALTHEA.displayDenom,
  decimals: 8,
  explorerURL: `${MINTSCAN_URL}/althea`,
  coinGeckoId: 'bitcoin',
  utxoURL: 'https://mempool.space/api/address/{address}/utxo',
};
