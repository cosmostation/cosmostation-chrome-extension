import type { Common, CustomChainParams } from 'web3-core';
import type { MessageTypes } from '@metamask/eth-sig-util';

import type { ETHEREUM_METHOD_TYPE, ETHEREUM_NO_POPUP_METHOD_TYPE, ETHEREUM_POPUP_METHOD_TYPE } from '~/constants/message/ethereum';

import type { EthereumNetwork, EthereumToken } from '../chain';

export type EthereumPopupMethodType = ValueOf<typeof ETHEREUM_POPUP_METHOD_TYPE>;
export type EthereumNoPopupMethodType = ValueOf<typeof ETHEREUM_NO_POPUP_METHOD_TYPE>;

export type CustomChain = CustomChainParams;
export type EthereumTxCommon = Common;

export type EthereumTx = {
  value?: string | number;
  gasPrice?: string | number;
  maxPriorityFeePerGas?: string | number;
  maxFeePerGas?: string | number;
  from?: string | number;
  to?: string;
  gas?: number | string;
  data?: string;
  nonce?: number;
  v?: string | number;
  r?: string | number;
  s?: string | number;
};

export type EthRequestAccounts = {
  method: typeof ETHEREUM_METHOD_TYPE.ETH__REQUEST_ACCOUNTS;
  params: unknown;
  id?: number | string;
};

export type EthRequestAccountsResponse = string[];

export type EthRequestPermissions = {
  method: typeof ETHEREUM_METHOD_TYPE.WALLET__REQUEST_PERMISSIONS;
  params: unknown;
  id?: number | string;
};

export type EthRequestPermissionsResponse = string[];

export type EthCoinbaseResponse = string | null;

export type EthSignParams = [string, string];

export type EthSign = {
  method: typeof ETHEREUM_METHOD_TYPE.ETH__SIGN;
  params: EthSignParams;
  id?: number | string;
};

export type EthSignResponse = string;

export type PersonalSignParams = [string, string];

export type PersonalSign = {
  method: typeof ETHEREUM_METHOD_TYPE.PERSONAL_SIGN;
  params: EthSignParams;
  id?: number | string;
};

export type PersonalSignResponse = string;

export type EthSignTransactionParam1 = EthereumTx;

export type EthSignTransactionParams = [EthereumTx];

export type EthSignTransaction = {
  method: typeof ETHEREUM_METHOD_TYPE.ETH__SIGN_TRANSACTION;
  params: EthSignTransactionParams;
  id?: number | string;
};

export type EthSignTransactionResponse = {
  raw: string;
  tx: EthereumTx;
};

export type EthSendTransactionParam1 = EthereumTx;

export type EthSendTransactionParams = [EthereumTx];

export type EthSendTransaction = {
  method: typeof ETHEREUM_METHOD_TYPE.ETH__SEND_TRANSACTION;
  params: EthSendTransactionParams;
  id?: number | string;
};

export type EthSendTransactionResponse = string;

export type EthGetBalance = {
  method: typeof ETHEREUM_METHOD_TYPE.ETH__GET_BALANCE;
  params: string[];
  id?: number | string;
};

export type EthcAddNetworkParam1 = Omit<EthereumNetwork, 'id' | 'ethereumChainId'>;

export type EthcAddNetworkParams = [EthcAddNetworkParam1];

export type EthcAddNetwork = {
  method: typeof ETHEREUM_METHOD_TYPE.ETHC__ADD_NETWORK;
  params: EthcAddNetworkParams;
  id?: number | string;
};

export type EthcAddNetworkResponse = null;

export type WalletAddEthereumChainParam1 = {
  chainId: string;
  chainName: string;
  blockExplorerUrls?: string[];
  iconUrls?: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  coinGeckoId?: string;
};

export type WalletAddEthereumChainParams = [WalletAddEthereumChainParam1];

export type WalletAddEthereumChain = {
  method: typeof ETHEREUM_METHOD_TYPE.WALLET__ADD_ETHEREUM_CHAIN;
  params: WalletAddEthereumChainParams;
  id?: number | string;
};

export type WalletAddEthereumChainResponse = null;

export type EthcSwitchNetworkParams = [string];

export type EthcSwitchNetwork = {
  method: typeof ETHEREUM_METHOD_TYPE.ETHC__SWITCH_NETWORK;
  params: EthcSwitchNetworkParams;
  id?: number | string;
};

export type EthcSwitchNetworkResponse = null;

export type WalletSwitchEthereumChainParam1 = { chainId: string };

export type WalletSwitchEthereumChainParams = [WalletSwitchEthereumChainParam1];

export type WalletSwitchEthereumChain = {
  method: typeof ETHEREUM_METHOD_TYPE.WALLET__SWITCH_ETHEREUM_CHAIN;
  params: WalletSwitchEthereumChainParams;
  id?: number | string;
};

export type WalletSwitchEthereumChainResponse = null;

export type EthcAddTokensParam = Omit<EthereumToken, 'id' | 'ethereumNetworkId'>;

export type EthcAddTokensParams = EthcAddTokensParam[];

export type EthcAddTokens = {
  method: typeof ETHEREUM_METHOD_TYPE.ETHC__ADD_TOKENS;
  params: EthcAddTokensParams;
  id?: number | string;
};

export type EthcAddTokensResponse = null;

export type WalletWatchAssetParam = {
  type: string;
  options: {
    address: string;
    symbol: string;
    decimals: number;
    image?: string;
    coinGeckoId?: string;
  };
};

export type WalletWatchAssetParams = WalletWatchAssetParam;

export type WalletWatchAsset = {
  method: typeof ETHEREUM_METHOD_TYPE.WALLET__WATCH_ASSET;
  params: WalletWatchAssetParams;
  id?: number | string;
};

export type WalletWatchAssetResponse = null;

export type EthSignTypedDataParams = [string, string];

export type EthSignTypedData = {
  method: typeof ETHEREUM_METHOD_TYPE.ETH__SIGN_TYPED_DATA_V3 | typeof ETHEREUM_METHOD_TYPE.ETH__SIGN_TYPED_DATA_V4;
  params: EthSignTypedDataParams;
  id?: number | string;
};

export type EthSignTypedDataResponse = string;

export type EthRPCRequest = {
  method: Exclude<EthereumNoPopupMethodType, typeof ETHEREUM_METHOD_TYPE.ETH__GET_BALANCE>;
  params: unknown;
  id?: number | string;
};

export type CustomTypedMessage<T extends MessageTypes> = {
  types: T;
  primaryType: string;
  domain: {
    name?: string;
    version?: string;
    chainId?: number;
    verifyingContract?: string;
    salt?: string;
  };
  message: Record<string, unknown>;
};
