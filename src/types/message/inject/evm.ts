import type { MessageTypes } from '@metamask/eth-sig-util';

import type { EVM_METHOD_TYPE } from '@/constants/evm/message';
import type { EvmErc20Asset } from '@/types/asset';
import type { ChainType } from '@/types/chain';
import type { EthereumTx } from '@/types/evm/txs';
import type { RequestBase } from '@/types/message/inject';

export type EvmRequest =
  | EthRequestAccounts
  | EthAccounts
  | EthRequestPermissions
  | EthRequestChainId
  | EthSign
  | EthSignTypedData
  | PersonalSign
  | EthSignTransaction
  | EthSendTransaction
  | EthcAddNetwork
  | EthcSwitchNetwork
  | EthcAddTokens
  | WalletWatchAsset
  | WalletAddEthereumChain
  | WalletSwitchEthereumChain
  | EthCoinBase
  | WalletGetPermission
  | EthGetBalance
  | EthNetVersion;

export interface EvmResponse {
  [EVM_METHOD_TYPE.ETH__REQUEST_ACCOUNTS]: EthRequestAccountsResponse;
  [EVM_METHOD_TYPE.ETH__ACCOUNTS]: EthAccountsResponse;
  [EVM_METHOD_TYPE.WALLET__REQUEST_PERMISSIONS]: EthRequestPermissionsResponse;
  [EVM_METHOD_TYPE.ETH__CHAIN_ID]: EthRequestChainIdResponse;
  [EVM_METHOD_TYPE.ETH__SIGN]: EthSignResponse;
  [EVM_METHOD_TYPE.ETH__SIGN_TYPED_DATA_V3]: EthSignTypedDataResponse;
  [EVM_METHOD_TYPE.ETH__SIGN_TYPED_DATA_V4]: EthSignTypedDataResponse;
  [EVM_METHOD_TYPE.PERSONAL_SIGN]: PersonalSignResponse;
  [EVM_METHOD_TYPE.ETH__SIGN_TRANSACTION]: EthSignTransactionResponse;
  [EVM_METHOD_TYPE.ETH__SEND_TRANSACTION]: EthSendTransactionResponse;
  [EVM_METHOD_TYPE.ETHC__ADD_NETWORK]: EthcAddNetworkResponse;
  [EVM_METHOD_TYPE.ETHC__SWITCH_NETWORK]: EthcSwitchNetworkResponse;
  [EVM_METHOD_TYPE.ETHC__ADD_TOKENS]: EthcAddTokensResponse;
  [EVM_METHOD_TYPE.WALLET__WATCH_ASSET]: WalletWatchAssetResponse;
  [EVM_METHOD_TYPE.WALLET__ADD_ETHEREUM_CHAIN]: WalletAddEthereumChainResponse;
  [EVM_METHOD_TYPE.WALLET__SWITCH_ETHEREUM_CHAIN]: WalletSwitchEthereumChainResponse;
  [EVM_METHOD_TYPE.ETH__COINBASE]: EthCoinbaseResponse;
  [EVM_METHOD_TYPE.NET__VERSION]: EthNetVersionResponse;
}

export interface EthRequestAccounts extends RequestBase {
  chainType: Extract<ChainType, 'evm'>;
  method: typeof EVM_METHOD_TYPE.ETH__REQUEST_ACCOUNTS;
  params?: unknown;
}

export type EthRequestAccountsResponse = string[];

export interface EthAccounts extends RequestBase {
  chainType: Extract<ChainType, 'evm'>;
  method: typeof EVM_METHOD_TYPE.ETH__ACCOUNTS;
  params?: unknown;
}

export type EthAccountsResponse = string[];

export interface EthRequestPermissions extends RequestBase {
  chainType: Extract<ChainType, 'evm'>;
  method: typeof EVM_METHOD_TYPE.WALLET__REQUEST_PERMISSIONS;
  params?: unknown;
}

export type EthRequestPermissionsResponse = string[];

export interface EthRequestChainId extends RequestBase {
  chainType: Extract<ChainType, 'evm'>;
  method: typeof EVM_METHOD_TYPE.ETH__CHAIN_ID;
  params?: unknown;
}

export type EthRequestChainIdResponse = string;

export type EthSignParams = [string, string];

export interface EthSign extends RequestBase {
  chainType: Extract<ChainType, 'evm'>;
  method: typeof EVM_METHOD_TYPE.ETH__SIGN;
  params: EthSignParams;
}

export type EthSignResponse = string;

export type EthSignTypedDataParams = [string, string];

export interface EthSignTypedData extends RequestBase {
  chainType: Extract<ChainType, 'evm'>;
  method: typeof EVM_METHOD_TYPE.ETH__SIGN_TYPED_DATA_V3 | typeof EVM_METHOD_TYPE.ETH__SIGN_TYPED_DATA_V4;
  params: EthSignTypedDataParams;
}

export type EthSignTypedDataResponse = string;

export type PersonalSignParams = [string, string];

export interface PersonalSign extends RequestBase {
  chainType: Extract<ChainType, 'evm'>;
  method: typeof EVM_METHOD_TYPE.PERSONAL_SIGN;
  params: EthSignParams;
}

export type PersonalSignResponse = string;

export type EthSignTransactionParams = [EthereumTx];

export interface EthSignTransaction extends RequestBase {
  chainType: Extract<ChainType, 'evm'>;
  method: typeof EVM_METHOD_TYPE.ETH__SIGN_TRANSACTION;
  params: EthSignTransactionParams;
}

export type EthSignTransactionResponse = {
  raw: string;
  tx: EthereumTx;
};

export type EthSendTransactionParams = [EthereumTx];

export interface EthSendTransaction extends RequestBase {
  chainType: Extract<ChainType, 'evm'>;
  method: typeof EVM_METHOD_TYPE.ETH__SEND_TRANSACTION;
  params: EthSendTransactionParams;
}

export type EthSendTransactionResponse = string;

export interface NetworkConfigurationParams {
  chainId: string;
  networkName: string;
  displayDenom: string;
  decimals: number;
  rpcURL: string;
  tokenImageURL?: string;
  imageURL?: string;
  explorerURL?: string;
  coinGeckoId?: string;
}

export type EthcAddNetworkParams = [NetworkConfigurationParams];

export interface EthcAddNetwork extends RequestBase {
  chainType: Extract<ChainType, 'evm'>;
  method: typeof EVM_METHOD_TYPE.ETHC__ADD_NETWORK;
  params: EthcAddNetworkParams;
}

export type EthcAddNetworkResponse = null;

export type EthcSwitchNetworkParams = [string];

export interface EthcSwitchNetwork extends RequestBase {
  chainType: Extract<ChainType, 'evm'>;
  method: typeof EVM_METHOD_TYPE.ETHC__SWITCH_NETWORK;
  params: EthcSwitchNetworkParams;
}

export type EthcSwitchNetworkResponse = null;

export type EthcAddTokensParam = EvmErc20Asset;

export type EthcAddTokensParams = EthcAddTokensParam[];

export interface EthcAddTokens extends RequestBase {
  chainType: Extract<ChainType, 'evm'>;
  method: typeof EVM_METHOD_TYPE.ETHC__ADD_TOKENS;
  params: EthcAddTokensParams;
}

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

export interface WalletWatchAsset extends RequestBase {
  chainType: Extract<ChainType, 'evm'>;
  method: typeof EVM_METHOD_TYPE.WALLET__WATCH_ASSET;
  params: WalletWatchAssetParams;
}

export type WalletWatchAssetResponse = null;

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

export interface WalletAddEthereumChain extends RequestBase {
  chainType: Extract<ChainType, 'evm'>;
  method: typeof EVM_METHOD_TYPE.WALLET__ADD_ETHEREUM_CHAIN;
  params: WalletAddEthereumChainParams;
}

export type WalletAddEthereumChainResponse = null;

export type WalletSwitchEthereumChainParam1 = { chainId: string };

export type WalletSwitchEthereumChainParams = [WalletSwitchEthereumChainParam1];

export interface WalletSwitchEthereumChain extends RequestBase {
  chainType: Extract<ChainType, 'evm'>;
  method: typeof EVM_METHOD_TYPE.WALLET__SWITCH_ETHEREUM_CHAIN;
  params: WalletSwitchEthereumChainParams;
}

export type WalletSwitchEthereumChainResponse = null;

export interface CustomTypedMessage<T extends MessageTypes> {
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
}

export interface EthCoinBase extends RequestBase {
  chainType: Extract<ChainType, 'evm'>;
  method: typeof EVM_METHOD_TYPE.ETH__COINBASE;
  params?: unknown;
}

export type EthCoinbaseResponse = string | null;

export interface WalletGetPermission extends RequestBase {
  chainType: Extract<ChainType, 'evm'>;
  method: typeof EVM_METHOD_TYPE.WALLET__GET_PERMISSIONS;
  params?: unknown;
}

export interface EthGetBalance extends RequestBase {
  chainType: Extract<ChainType, 'evm'>;
  method: typeof EVM_METHOD_TYPE.ETH__GET_BALANCE;
  params: string[];
}

export interface EthNetVersion extends RequestBase {
  chainType: Extract<ChainType, 'evm'>;
  method: typeof EVM_METHOD_TYPE.NET__VERSION;
  params?: unknown;
}

export type EthNetVersionResponse = string;
