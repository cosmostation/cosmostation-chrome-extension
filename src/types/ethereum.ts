import type {
  ETHEREUM_METHOD_TYPE,
  ETHEREUM_NO_POPUP_METHOD_TYPE,
  ETHEREUM_POPUP_METHOD_TYPE,
} from '~/constants/ethereum';

export type EthereumNoPopupMethodType = ValueOf<typeof ETHEREUM_NO_POPUP_METHOD_TYPE>;
export type EthereumPopupMethodType = ValueOf<typeof ETHEREUM_POPUP_METHOD_TYPE>;

export type BaseChain = 'mainnet' | 'goerli' | 'kovan' | 'rinkeby' | 'ropsten';

export type HardFork =
  | 'chainstart'
  | 'homestead'
  | 'dao'
  | 'tangerineWhistle'
  | 'spuriousDragon'
  | 'byzantium'
  | 'constantinople'
  | 'petersburg'
  | 'istanbul';

export interface CustomChainParams {
  name?: string;
  networkId: number;
  chainId: number;
}

export interface Common {
  customChain: CustomChainParams;
  baseChain?: BaseChain;
  hardfork?: HardFork;
}

export type EthereumTxParams = {
  from?: string;
  to?: string;
  value?: string;
  gas?: string;
  gasPrice?: string;
  maxPriorityFeePerGas?: string;
  maxFeePerGas?: string;
  data?: string;
  nonce?: number;
  chainId?: number;
  common?: Common;
  chain?: string;
  hardfork?: string;
};

export type EthSignRequestMessage = {
  method: typeof ETHEREUM_METHOD_TYPE.ETH__SIGN | typeof ETHEREUM_METHOD_TYPE.PERSONAL_SIGN;
  params: string[];
  id?: number | string;
};

export type EthSendTransactionRequestMessage = {
  method: typeof ETHEREUM_METHOD_TYPE.ETH__SEND_TRANSACTION;
  params: [EthereumTxParams];
  id?: number | string;
};

export type EthGetBalanceRequestMessage = {
  method: typeof ETHEREUM_METHOD_TYPE.ETH__GET_BALANCE;
  params: string[];
  id?: number | string;
};

export type EthRPCRequestMessage = {
  method: Exclude<EthereumNoPopupMethodType, typeof ETHEREUM_METHOD_TYPE.ETH__GET_BALANCE>;
  params: unknown;
  id?: number | string;
};
