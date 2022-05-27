import type { ETHEREUM_TX_TYPE, FEE_TYPE } from '~/constants/ethereum';

export type FeeType = ValueOf<typeof FEE_TYPE>;

export type EthereumTxType = ValueOf<typeof ETHEREUM_TX_TYPE>;
