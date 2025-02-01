import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { getAddress, getKeypair } from '@/libs/address';
import { getAddedCustomChains, getChains } from '@/libs/chain';
import { sendMessage } from '@/libs/extension';
import type { ResponseAppMessage } from '@/types/message/content';
import type { CosmosRequest, CosRequestAccount, CosRequestAccountResponse, CosSupportedChainNames } from '@/types/message/inject/cosmos';
import { CosmosRPCError } from '@/utils/error';
import { processRequest } from '@/utils/requestApp';
import { extensionLocalStorage, extensionSessionStorage } from '@/utils/storage';

export async function cosmosProcess(message: CosmosRequest) {
  const { method, requestId, tabId, id, origin } = message;

  const { cosmosChains } = await getChains();
  const addedCustomChains = await getAddedCustomChains();

  const allCosmosChains = [...cosmosChains, ...addedCustomChains.filter((chain) => chain.chainType === 'cosmos')];
  const allChainLowercaseNames = allCosmosChains.map((item) => item.name.toLowerCase());
  const getChain = (chainName?: string) => allCosmosChains.find((item) => item.name.toLowerCase() === chainName?.toLowerCase());

  const { currentAccount, currentAccountAllowedOrigins, currentAccountName } = await extensionLocalStorage();
  const { currentPassword } = await extensionSessionStorage();

  try {
    if (method === 'cos_supportedChainNames') {
      sendMessage<ResponseAppMessage<CosSupportedChainNames>>({
        target: 'CONTENT',
        method: 'responseApp',
        origin,
        requestId,
        tabId,
        params: {
          id,
          result: { official: [], unofficial: [] },
        },
      });
    }

    if (method === 'cos_signAmino') {
      // const { params } = message;
      // sendMessage<ResponseAppMessage<CosSignAmino>>({
      //   target: 'CONTENT',
      //   method: 'responseApp',
      //   origin,
      //   requestId,
      //   tabId,
      //   params: {
      //     id,
      //     result: {},
      //   },
      // });
    }

    if (method === 'cos_requestAccount') {
      const { params } = message;

      const selectedChain = allCosmosChains.filter((item) => item.chainId === params?.chainName);

      const chainName = selectedChain.length === 1 ? selectedChain[0].name.toLowerCase() : params?.chainName?.toLowerCase();

      if (!allChainLowercaseNames.includes(chainName)) {
        throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]);
      }

      const chain = getChain(chainName)!;

      if (chain.id && currentAccountAllowedOrigins.includes(origin) && currentPassword) {
        const keyPair = getKeypair(chain, currentAccount, currentPassword);
        const address = getAddress(chain, keyPair?.publicKey);

        const publicKey = keyPair?.publicKey || '';

        const result: CosRequestAccountResponse = {
          address,
          publicKey,
          name: currentAccountName,
          isLedger: false,
          isEthermint: chain.isEvm,
        };

        sendMessage<ResponseAppMessage<CosRequestAccount>>({
          target: 'CONTENT',
          method: 'responseApp',
          origin,
          requestId,
          tabId,
          params: {
            id,
            result,
          },
        });
      } else {
        processRequest({ ...message });
      }
    }
  } catch (e) {
    if (e instanceof CosmosRPCError) {
      sendMessage({
        target: 'CONTENT',
        method: 'responseApp',
        origin,
        requestId,
        tabId,
        params: {
          id,
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
        id,
        error: {
          code: RPC_ERROR.INTERNAL,
          message: `${RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL]}`,
        },
      },
    });
  }
}
