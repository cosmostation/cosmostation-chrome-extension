import type { ETHEREUM_CONTRACT_KIND, ETHEREUM_NFT_STANDARD, ETHEREUM_TX_TYPE, FEE_TYPE, TOKEN_TYPE } from '~/constants/ethereum';

import type { EthereumToken } from '../chain';

export type FeeType = ValueOf<typeof FEE_TYPE>;

export type TokenType = ValueOf<typeof TOKEN_TYPE>;

export type EthereumTxType = ValueOf<typeof ETHEREUM_TX_TYPE>;

export type EthereumContractKind = ValueOf<typeof ETHEREUM_CONTRACT_KIND>;

export type Token = EthereumToken | null;

export type EthereumNFTStandard = ValueOf<typeof ETHEREUM_NFT_STANDARD>;

export type GasRateKeyConfigurations = {
  tiny: EIP1559Configuration;
  low: EIP1559Configuration;
  average: EIP1559Configuration;
};

export type EIP1559Configuration = {
  maxBaseFeePerGas: string;
  maxPriorityFeePerGas: string;
};
