import type { Request } from '@/types/message/inject';
import type { CosmosRequest, CosRequestAccountResponse } from '@/types/message/inject/cosmos';

import { requestApp } from '..';

// NOTE 이게 현재 사용할 메시지 타입
// export interface CosSupportedChainNames extends RequestBase {
//   chainType: Extract<ChainType, 'cosmos'>;
//   method: typeof COSMOS_NO_POPUP_METHOD_TYPE.COS__SUPPORTED_CHAIN_NAMES;
//   params?: undefined;
// }

// NOTE 이게 옛날꺼 기존과 달리 체인타입이 추가됨.
// export type CosSupportedChainNames = {
//   method: typeof COSMOS_NO_POPUP_METHOD_TYPE.COS__SUPPORTED_CHAIN_NAMES | typeof COSMOS_NO_POPUP_METHOD_TYPE.TEN__SUPPORTED_CHAIN_NAMES;
//   params?: undefined;
//   id?: number | string;
// };
export const cosmosRequestApp = <T extends Omit<Request, 'chainType'>>(message: T) => {
  const requestParam = {
    ...message,
    chainType: 'cosmos',
  } as CosmosRequest;

  return requestApp(requestParam);
};

export const wrappedCosmosRequestApp = async <T extends Omit<Request, 'chainType'>>(message: T) => {
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

export const cosmos: CosmosProvider = {
  // on,
  // off,
  request: cosmosRequestApp,
};
