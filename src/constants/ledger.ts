import { COSMOS } from './chain/cosmos/cosmos';
import { CRYPTO_ORG } from './chain/cosmos/cryptoOrg';
import { MEDIBLOC } from './chain/cosmos/medibloc';
import { ETHEREUM } from './chain/ethereum/ethereum';

export const TRANSPORT_TYPE = {
  USB: 'USB',
  HID: 'HID',
  // BLUETOOTH: 'Bluetooth',
} as const;

export const LEDGER_SUPPORT_COIN_TYPE = {
  ETHEREUM: ETHEREUM.bip44.coinType,
  COSMOS: COSMOS.bip44.coinType,
  MEDIBLOC: MEDIBLOC.bip44.coinType,
  CRYPTO_ORG: CRYPTO_ORG.bip44.coinType,
} as const;
