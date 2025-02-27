import type { BaseRequest } from '@/types/message/inject';
import type { CosRequestAccountResponse } from '@/types/message/inject/cosmos';

import { requestApp } from '..';

export const cosmosRequestApp = <T extends BaseRequest>(message: T) => {
  const requestParam = {
    ...message,
    chainType: 'cosmos',
  };

  return requestApp(requestParam);
};

export const wrappedCosmosRequestApp = async <T extends BaseRequest>(message: T) => {
  if (message.method === 'cos_requestAccount' || message.method === 'cos_account') {
    const result = (await cosmosRequestApp(message)) as CosRequestAccountResponse;

    const { publicKey } = result;

    const response = {
      ...(result as { publicKey: string; address: string }),
      publicKey: new Uint8Array(Buffer.from(publicKey, 'hex')),
    };

    return response;
  }

  // NOTE 구버젼의 리스폰스 랩핑로직 추가 필요.,
  // if (message.method === 'cos_requestAccounts') {
  //   const supportedChainIds = (await cosmosRequestApp({ method: 'cos_supportedChainIds' })) as CosSupportedChainIdsResponse;

  //   const isValidChainIds = message.params?.chainIds?.every(
  //     (chainId) => supportedChainIds?.official?.includes(chainId) || supportedChainIds?.unofficial?.includes(chainId),
  //   );

  //   if (!isValidChainIds) {
  //     throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]);
  //   }

  //   const initialAccountRequestMessage = {
  //     ...message,
  //     method: 'cos_requestAccount',
  //     params: {
  //       chainName: message.params?.chainIds?.[0],
  //     },
  //   } as CosRequestAccount;

  //   await executeRequest(initialAccountRequestMessage);

  //   const result = await Promise.all(
  //     message.params.chainIds.map(
  //       async (chainId) => (await executeRequest({ method: 'cos_requestAccount', params: { chainName: chainId } })) as CosRequestAccountResponse,
  //     ),
  //   );

  //   const response = result.map((item) => {
  //     const { publicKey } = item;

  //     return {
  //       ...(item as { publicKey: string; address: string }),
  //       publicKey: new Uint8Array(Buffer.from(publicKey, 'hex')),
  //     };
  //   });

  //   return response;
  // }

  return cosmosRequestApp(message);
};

export const cosmosProvider: CosmosProvider = {
  // on,
  // off,
  request: cosmosRequestApp,
};
