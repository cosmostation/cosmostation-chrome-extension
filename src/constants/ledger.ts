import { COSMOS } from './chain/cosmos/cosmos';
import { CRYPTO_ORG } from './chain/cosmos/cryptoOrg';
import { MEDIBLOC } from './chain/cosmos/medibloc';
import { ETHEREUM } from './chain/ethereum/ethereum';
import { SUI } from './chain/sui/sui';

export const TRANSPORT_TYPE = {
  HID: 'HID',
  USB: 'USB',
  // BLUETOOTH: 'Bluetooth',
} as const;

export const LEDGER_SUPPORT_COIN_TYPE = {
  ETHEREUM: ETHEREUM.bip44.coinType,
  COSMOS: COSMOS.bip44.coinType,
  MEDIBLOC: MEDIBLOC.bip44.coinType,
  CRYPTO_ORG: CRYPTO_ORG.bip44.coinType,
  SUI: SUI.bip44.coinType,
} as const;
