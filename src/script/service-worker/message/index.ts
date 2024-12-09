import { sendMessage } from '@/libs/extension';
import type { ResponseAppMessage } from '@/types/message/content';
import type { Request } from '@/types/message/inject';
import type { CosSupportedChainNames } from '@/types/message/inject/cosmos';

export async function process(message: Request) {
  try {
    console.log('process', message);

    const { origin, tabId, id, requestId } = message;

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
  } catch (e) {
    console.log('process error', e);
  }
}
