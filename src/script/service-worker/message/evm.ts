import type { TransactionRequest } from 'ethers/providers';
import type { MessageTypes } from '@metamask/eth-sig-util';
import { SignTypedDataVersion } from '@metamask/eth-sig-util';

import { PRIVATE_KEY_FOR_TEST } from '@/constants/common';
import { ETHEREUM_RPC_ERROR_MESSAGE, RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { EVM_METHOD_TYPE, EVM_NO_POPUP_METHOD_TYPE } from '@/constants/evm/message';
import { getAddress, getKeypair } from '@/libs/address';
import { getAddedCustomChains, getChains } from '@/libs/chain';
import { sendMessage } from '@/libs/extension';
import type { EvmRpc } from '@/types/evm/api';
import type { ResponseAppMessage } from '@/types/message/content';
import type {
  CustomTypedMessage,
  EthcAddNetwork,
  EthcAddTokens,
  EthCoinBase,
  EthCoinbaseResponse,
  EthcSwitchNetwork,
  EthcSwitchNetworkResponse,
  EthNetVersion,
  EthRequestAccounts,
  EthRequestAccountsResponse,
  EthRequestChainId,
  EthSign,
  EthSignTransaction,
  EthSignTypedData,
  EvmRequest,
  PersonalSign,
  WalletAddEthereumChain,
  WalletSwitchEthereumChain,
  WalletSwitchEthereumChainResponse,
  WalletWatchAsset,
} from '@/types/message/inject/evm';
import { EthereumRPCError } from '@/utils/error';
import { requestRPC as ethereumRequestRPC } from '@/utils/ethereum';
import { ethersProvider } from '@/utils/ethereum/ethers';
import { signTypedData } from '@/utils/ethereum/sign';
import { refreshOriginConnectionTime } from '@/utils/origins';
import { enqueueRequest, processRequest, setQueues } from '@/utils/requestApp';
import { extensionLocalStorage, extensionSessionStorage } from '@/utils/storage';
import { isEqualsIgnoringCase, toHex } from '@/utils/string';

import {
  ethcAddNetworkParamsSchema,
  ethcAddTokensParamsSchema,
  ethcSwitchNetworkParamsSchema,
  ethSignParamsSchema,
  ethSignTransactionParamsSchema,
  ethSignTypedDataParamsSchema,
  personalSignParamsSchema,
  walletAddEthereumChainParamsSchema,
  walletSwitchEthereumChainParamsSchema,
  WalletWatchAssetParamsSchema,
} from './schema';

export async function evmProcess(message: EvmRequest) {
  const { method, requestId, tabId, origin } = message;

  const { evmChains } = await getChains();

  const addedCustomChains = await getAddedCustomChains();

  const allEVMChains = [...evmChains, ...addedCustomChains.filter((chain) => chain.chainType === 'evm')];

  const allEVMChainIds = allEVMChains.map((chain) => chain.chainId);

  const evmChain = allEVMChains.find((chain) => chain.chainId === '0x1') || allEVMChains[0];

  const { currentAccountAllowedOrigins, currentEthereumNetwork, currentAccount } = await extensionLocalStorage();

  const { currentPassword } = await extensionSessionStorage();

  const ethereumMethods = Object.values(EVM_METHOD_TYPE) as string[];
  const ethereumNoPopupMethods = Object.values(EVM_NO_POPUP_METHOD_TYPE) as string[];

  try {
    if (!message?.method || !ethereumMethods.includes(message.method)) {
      throw new EthereumRPCError(RPC_ERROR.UNSUPPORTED_METHOD, ETHEREUM_RPC_ERROR_MESSAGE[RPC_ERROR.UNSUPPORTED_METHOD], message.requestId);
    }

    if (ethereumMethods.includes(message.method)) {
      if (method === 'eth_sign') {
        const { params } = message;

        const schema = ethSignParamsSchema();

        try {
          const validatedParams = (await schema.validateAsync(params)) as EthSign['params'];

          if (currentAccountAllowedOrigins.includes(origin) && currentPassword) {
            const keyPair = getKeypair(evmChain, currentAccount, currentPassword);
            const address = getAddress(evmChain, keyPair?.publicKey);

            if (address.toLowerCase() !== validatedParams[0].toLowerCase()) {
              throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, 'Invalid address', message.requestId);
            }
          }

          void processRequest({
            ...message,
            params: [...validatedParams] as EthSign['params'],
          });
        } catch (err) {
          if (err instanceof EthereumRPCError) {
            throw err;
          }

          throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`, message.requestId);
        }
      }

      if (method === 'eth_signTypedData_v3' || method === 'eth_signTypedData_v4') {
        const { params } = message;

        const schema = ethSignTypedDataParamsSchema();

        try {
          const validatedParams = (await schema.validateAsync(params)) as EthSignTypedData['params'];

          if (currentAccountAllowedOrigins.includes(origin) && currentPassword) {
            const keyPair = getKeypair(evmChain, currentAccount, currentPassword);
            const address = getAddress(evmChain, keyPair?.publicKey);

            if (address.toLowerCase() !== validatedParams[0].toLowerCase()) {
              throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, 'Invalid address', message.requestId);
            }
          }

          try {
            const param2 = JSON.parse(validatedParams[1]) as CustomTypedMessage<MessageTypes>;

            const currentNetwork = currentEthereumNetwork;

            const chainId = param2?.domain?.chainId;

            if (chainId && toHex(chainId, { addPrefix: true, isStringNumber: true }) !== currentNetwork.chainId) {
              throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, 'Invalid chainId', message.requestId);
            }

            const version = method === 'eth_signTypedData_v3' ? SignTypedDataVersion.V3 : SignTypedDataVersion.V4;

            signTypedData(Buffer.from(PRIVATE_KEY_FOR_TEST, 'hex'), param2, version);
          } catch (err) {
            if (err instanceof EthereumRPCError) {
              throw err;
            }

            throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, 'Invalid data', message.requestId);
          }

          void processRequest({
            ...message,
            params: [...validatedParams] as EthSignTypedData['params'],
          });
        } catch (err) {
          if (err instanceof EthereumRPCError) {
            throw err;
          }

          throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`, message.requestId);
        }
      }

      if (method === 'personal_sign') {
        const { params } = message;

        const schema = personalSignParamsSchema();

        try {
          const reorderedParams = (() => {
            if (currentAccountAllowedOrigins.includes(origin) && currentPassword) {
              const keyPair = getKeypair(evmChain, currentAccount, currentPassword);
              const address = getAddress(evmChain, keyPair?.publicKey);

              const updatedParams = params.some((item, index) => isEqualsIgnoringCase(item, address) && index !== 1) ? [params[1], params[0]] : params;

              if (address.toLowerCase() !== updatedParams[1].toLowerCase()) {
                throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, 'Invalid address', message.requestId);
              }

              return updatedParams;
            }
            return [];
          })();

          const validatedParams = (await schema.validateAsync(reorderedParams)) as PersonalSign['params'];

          void processRequest({
            ...message,
            params: [...validatedParams] as PersonalSign['params'],
          });
        } catch (err) {
          if (err instanceof EthereumRPCError) {
            throw err;
          }

          throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`, message.requestId);
        }
      }

      if (method === 'eth_signTransaction' || method === 'eth_sendTransaction') {
        const { params } = message;

        const schema = ethSignTransactionParamsSchema();

        try {
          const validatedParams = (await schema.validateAsync(params)) as EthSignTransaction['params'];

          if (evmChain && currentAccountAllowedOrigins.includes(origin) && currentPassword) {
            const keyPair = getKeypair(evmChain, currentAccount, currentPassword);
            const address = getAddress(evmChain, keyPair?.publicKey);

            if (address.toLowerCase() !== toHex(validatedParams[0].from, { addPrefix: true }).toLowerCase()) {
              throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, 'Invalid address', message.requestId);
            }
          }

          const originEthereumTx = validatedParams[0];

          const nonce = originEthereumTx.nonce !== undefined ? parseInt(toHex(originEthereumTx.nonce), 16) : undefined;

          let gas: string | number = 0;

          try {
            const providers = currentEthereumNetwork.rpcUrls.map((item) => ethersProvider(item.url));

            const tx: TransactionRequest = { ...validatedParams[0], nonce };

            gas = validatedParams[0].gas
              ? validatedParams[0].gas
              : await Promise.any(providers.map((provider) => provider.estimateGas(tx).then((gasLimit) => gasLimit.toString())));
          } catch (e) {
            throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, (e as { message: string }).message, message.requestId);
          }

          void processRequest({
            ...message,
            params: [{ ...validatedParams[0], gas }] as EthSignTransaction['params'],
          });
        } catch (err) {
          if (err instanceof EthereumRPCError) {
            throw err;
          }

          throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`, message.requestId);
        }
      }

      if (method === 'eth_requestAccounts' || method === 'wallet_requestPermissions') {
        if (evmChain && currentAccountAllowedOrigins.includes(origin) && currentPassword) {
          void refreshOriginConnectionTime(currentAccount.id, origin);

          const keyPair = getKeypair(evmChain, currentAccount, currentPassword);
          const address = getAddress(evmChain, keyPair?.publicKey);

          const result: EthRequestAccountsResponse = [address];

          sendMessage<ResponseAppMessage<EthRequestAccounts>>({
            target: 'CONTENT',
            method: 'responseApp',
            origin,
            requestId,
            tabId,
            params: {
              id: requestId,
              result,
            },
          });
        } else {
          void processRequest({ ...message });
        }
      }

      if (method === 'ethc_addNetwork') {
        const { params } = message;

        const schema = ethcAddNetworkParamsSchema();

        try {
          const validatedParams = (await schema.validateAsync(params)) as EthcAddNetwork['params'];

          const response = await ethereumRequestRPC<EvmRpc<string>>('eth_chainId', [], message.requestId, validatedParams[0].rpcURL);

          if (validatedParams[0].chainId !== response.result) {
            throw new EthereumRPCError(
              RPC_ERROR.INVALID_PARAMS,
              `Chain ID returned by RPC URL ${validatedParams[0].rpcURL} does not match ${validatedParams[0].chainId}`,
              message.requestId,
              { chainId: response.result },
            );
          }

          if (allEVMChainIds.includes(validatedParams[0].chainId)) {
            throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, `Can't add ${validatedParams[0].chainId}`, message.requestId, { chainId: response.result });
          }

          void processRequest({
            ...message,
            params: [...validatedParams] as EthcAddNetwork['params'],
          });
        } catch (err) {
          if (err instanceof EthereumRPCError) {
            throw err;
          }

          throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`, message.requestId);
        }
      }

      if (method === 'ethc_switchNetwork') {
        const { params } = message;

        const networkChainIds = allEVMChains.map((chain) => chain.chainId);

        const schema = ethcSwitchNetworkParamsSchema(networkChainIds);

        try {
          const validatedParams = (await schema.validateAsync(params)) as EthcSwitchNetwork['params'];

          if (params[0] === currentEthereumNetwork.chainId) {
            const result: EthcSwitchNetworkResponse = null;

            sendMessage<ResponseAppMessage<EthcSwitchNetwork>>({
              target: 'CONTENT',
              method: 'responseApp',
              origin,
              requestId,
              tabId,
              params: {
                id: requestId,
                result,
              },
            });

            return;
          }

          void processRequest({
            ...message,
            params: [...validatedParams] as EthcSwitchNetwork['params'],
          });
        } catch (err) {
          if (err instanceof EthereumRPCError) {
            throw err;
          }

          throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`, message.requestId);
        }
      }

      if (method === 'ethc_addTokens') {
        const { params } = message;

        const schema = ethcAddTokensParamsSchema();

        try {
          const validatedParams = (await schema.validateAsync(params)) as EthcAddTokens['params'];

          void processRequest({
            ...message,
            params: [...validatedParams] as EthcAddTokens['params'],
          });
        } catch (err) {
          if (err instanceof EthereumRPCError) {
            throw err;
          }

          throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`, message.requestId);
        }
      }

      if (method === 'wallet_watchAsset') {
        const { params } = message;

        const schema = WalletWatchAssetParamsSchema();

        try {
          const validatedParams = (await schema.validateAsync(params)) as WalletWatchAsset['params'];

          const imageURL = (() => {
            if (typeof validatedParams.options.image === 'string') return validatedParams.options.image;

            if (Array.isArray(validatedParams.options.image) && (validatedParams.options.image as string[]).length > 0) {
              const firstImage = validatedParams.options.image[0] as unknown;

              return typeof firstImage === 'string' ? firstImage : undefined;
            }

            return undefined;
          })();

          const addTokenParam: EthcAddTokens['params'][0] = {
            id: validatedParams.options.address,
            chainId: currentEthereumNetwork.id,
            type: 'erc20',
            chainType: 'evm',
            name: validatedParams.options.symbol,
            symbol: validatedParams.options.symbol,
            decimals: validatedParams.options.decimals,
            image: imageURL,
            coinGeckoId: validatedParams.options.coinGeckoId,
          };

          void processRequest({
            ...message,
            method: 'ethc_addTokens',
            params: [addTokenParam] as EthcAddTokens['params'],
          });
        } catch (err) {
          if (err instanceof EthereumRPCError) {
            throw err;
          }

          throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`, message.requestId);
        }
      }

      if (method === 'wallet_addEthereumChain') {
        const { params } = message;

        const schema = walletAddEthereumChainParamsSchema();

        try {
          const validatedParams = (await schema.validateAsync(params)) as WalletAddEthereumChain['params'];

          const response = await ethereumRequestRPC<EvmRpc<string>>('eth_chainId', [], message.requestId, validatedParams[0].rpcUrls[0]);

          if (validatedParams[0].chainId !== response.result) {
            throw new EthereumRPCError(
              RPC_ERROR.UNRECOGNIZED_CHAIN,
              `Chain ID returned by RPC URL ${validatedParams[0].rpcUrls[0]} does not match ${validatedParams[0].chainId}`,
              message.requestId,
              { chainId: response.result },
            );
          }

          if (allEVMChains.map((chain) => chain.chainId).includes(validatedParams[0].chainId)) {
            enqueueRequest({
              ...message,
              method: 'ethc_switchNetwork',
              params: [validatedParams[0].chainId],
            });
          } else {
            const param = validatedParams[0];

            const addNetworkParam: EthcAddNetwork['params'][0] = {
              chainId: param.chainId,
              decimals: param.nativeCurrency.decimals,
              displayDenom: param.nativeCurrency.symbol,
              networkName: param.chainName,
              rpcURL: param.rpcUrls[0],
              explorerURL: param.blockExplorerUrls?.[0],
              imageURL: param.iconUrls?.[0],
              coinGeckoId: param.coinGeckoId,
            };

            enqueueRequest({
              ...message,
              method: 'ethc_addNetwork',
              params: [addNetworkParam] as EthcAddNetwork['params'],
            });
          }

          void setQueues();
        } catch (err) {
          if (err instanceof EthereumRPCError) {
            throw err;
          }

          throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`, message.requestId);
        }
      }

      if (method === 'wallet_switchEthereumChain') {
        const { params } = message;

        const networkChainIds = allEVMChains.map((item) => item.chainId);

        const schema = walletSwitchEthereumChainParamsSchema(networkChainIds);

        try {
          const validatedParams = (await schema.validateAsync(params)) as WalletSwitchEthereumChain['params'];

          if (validatedParams[0].chainId === currentEthereumNetwork.chainId) {
            const result: WalletSwitchEthereumChainResponse = null;

            sendMessage<ResponseAppMessage<WalletSwitchEthereumChain>>({
              target: 'CONTENT',
              method: 'responseApp',
              origin,
              requestId,
              tabId,
              params: {
                id: requestId,
                result,
              },
            });

            return;
          } else {
            void processRequest({
              ...message,
              method: 'ethc_switchNetwork',
              params: [validatedParams[0].chainId] as EthcSwitchNetwork['params'],
            });
          }
        } catch (err) {
          if (err instanceof EthereumRPCError) {
            throw err;
          }

          throw new EthereumRPCError(
            RPC_ERROR.UNRECOGNIZED_CHAIN,
            `Unrecognized chain ID ${params?.[0]?.chainId}. Try adding the chain using wallet_addEthereumChain first.`,
            message.requestId,
          );
        }
      }
      if (ethereumNoPopupMethods.includes(method)) {
        if (method === 'eth_accounts') {
          if (evmChain && currentAccountAllowedOrigins.includes(origin) && currentPassword) {
            const keyPair = getKeypair(evmChain, currentAccount, currentPassword);
            const address = getAddress(evmChain, keyPair?.publicKey);

            const result: EthRequestAccountsResponse = address ? [address] : [];

            sendMessage<ResponseAppMessage<EthRequestAccounts>>({
              target: 'CONTENT',
              method: 'responseApp',
              origin,
              requestId,
              tabId,
              params: {
                id: requestId,
                result,
              },
            });
          } else {
            const result: EthRequestAccountsResponse = [];

            sendMessage<ResponseAppMessage<EthRequestAccounts>>({
              target: 'CONTENT',
              method: 'responseApp',
              origin,
              requestId,
              tabId,
              params: {
                id: requestId,
                result,
              },
            });
          }
        } else if (method === 'eth_coinbase') {
          if (currentAccountAllowedOrigins.includes(origin) && currentPassword) {
            const keyPair = getKeypair(evmChain, currentAccount, currentPassword);
            const address = getAddress(evmChain, keyPair?.publicKey);

            const result: EthCoinbaseResponse = address || null;

            sendMessage<ResponseAppMessage<EthCoinBase>>({
              target: 'CONTENT',
              method: 'responseApp',
              origin,
              requestId,
              tabId,
              params: {
                id: requestId,
                result,
              },
            });
          } else {
            const result: EthRequestAccountsResponse = [];

            sendMessage({
              target: 'CONTENT',
              method: 'responseApp',
              origin,
              requestId,
              tabId,
              params: {
                id: requestId,
                result,
              },
            });
          }
        } else if (method === 'wallet_getPermissions') {
          sendMessage({
            target: 'CONTENT',
            method: 'responseApp',
            origin,
            requestId,
            tabId,
            params: {
              id: requestId,
              result: [],
            },
          });
        } else if (method === 'eth_chainId') {
          sendMessage<ResponseAppMessage<EthRequestChainId>>({
            target: 'CONTENT',
            method: 'responseApp',
            origin,
            requestId,
            tabId,
            params: {
              id: requestId,
              result: currentEthereumNetwork.chainId,
            },
          });
        } else if (method === 'net_version') {
          const netVersion = `${parseInt(currentEthereumNetwork.chainId, 16)}`;

          sendMessage<ResponseAppMessage<EthNetVersion>>({
            target: 'CONTENT',
            method: 'responseApp',
            origin,
            requestId,
            tabId,
            params: {
              id: requestId,
              result: netVersion,
            },
          });
        } else {
          const params = method === EVM_METHOD_TYPE.ETH__GET_BALANCE && message.params.length === 1 ? [...message.params, 'latest'] : message.params;

          const response = await ethereumRequestRPC<EvmRpc<unknown>>(method, params, requestId);

          sendMessage({
            target: 'CONTENT',
            method: 'responseApp',
            origin,
            requestId,
            tabId,
            params: {
              id: requestId,
              result: response.result,
            },
          });
        }
      }
    } else {
      throw new EthereumRPCError(RPC_ERROR.INVALID_REQUEST, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_REQUEST], message.requestId);
    }
  } catch (e) {
    if (e instanceof EthereumRPCError) {
      sendMessage({
        target: 'CONTENT',
        method: 'responseApp',
        origin,
        requestId,
        tabId,
        params: {
          id: requestId,
          error: e.rpcMessage.error,
        },
      });
      return;
    }

    sendMessage({
      target: 'CONTENT',
      method: 'responseApp',
      origin,
      requestId,
      tabId,
      params: {
        id: requestId,
        error: {
          code: RPC_ERROR.INTERNAL,
          message: `${RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL]}`,
        },
      },
    });
  }
}
