import { sendMessage } from '@/libs/extension';
import type { ResponseAppMessage } from '@/types/message/content';
import type { CosmosRequest, CosSupportedChainNames } from '@/types/message/inject/cosmos';

export async function cosmosProcess(message: CosmosRequest) {
  const { method, requestId, tabId, id } = message;

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
}
