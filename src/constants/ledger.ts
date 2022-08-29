import { COSMOS } from './chain/cosmos/cosmos';
import { ETHEREUM } from './chain/ethereum/ethereum';

export const TRANSPORT_TYPE = {
  USB: 'USB',
  HID: 'HID',
  // BLUETOOTH: 'Bluetooth',
} as const;

export const LEDGER_SUPPORT_COIN_TYPE = {
  ETHEREUM: ETHEREUM.bip44.coinType,
  COSMOS: COSMOS.bip44.coinType,
} as const;
