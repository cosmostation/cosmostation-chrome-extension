import type { EVM_NFT_STANDARD } from '@/constants/evm/token';
import type { ETHEREUM_CONTRACT_KIND, ETHEREUM_TX_TYPE } from '@/constants/evm/tx';

export type EthereumTxType = ValueOf<typeof ETHEREUM_TX_TYPE>;

export type EthereumContractKind = ValueOf<typeof ETHEREUM_CONTRACT_KIND>;

export type EVMNFTStandard = ValueOf<typeof EVM_NFT_STANDARD>;
