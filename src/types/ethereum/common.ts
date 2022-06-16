import type { ETHEREUM_TX_TYPE, FEE_TYPE, TOKEN_TYPE } from '~/constants/ethereum';

import type { EthereumToken } from '../chain';

export type FeeType = ValueOf<typeof FEE_TYPE>;

export type TokenType = ValueOf<typeof TOKEN_TYPE>;

export type EthereumTxType = ValueOf<typeof ETHEREUM_TX_TYPE>;

export type Token = EthereumToken | null;
