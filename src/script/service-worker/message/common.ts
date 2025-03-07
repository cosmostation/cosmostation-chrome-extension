import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { COMMON_METHOD_TYPE, COMMON_NO_POPUP_METHOD_TYPE } from '@/constants/message';
import { sendMessage } from '@/libs/extension';
import type { CommonRequest, ComProvidersResponse } from '@/types/message/inject/common';
import { CommonRPCError } from '@/utils/error';
import { extensionLocalStorage } from '@/utils/storage';

export async function commonProcess(message: CommonRequest) {
  const { requestId, tabId, origin } = message;

  const commonMethods = Object.values(COMMON_METHOD_TYPE) as string[];
  const commonNoPopupMethods = Object.values(COMMON_NO_POPUP_METHOD_TYPE) as string[];

  try {
    if (!message?.method || !commonMethods.includes(message.method)) {
      throw new CommonRPCError(RPC_ERROR.METHOD_NOT_SUPPORTED, RPC_ERROR_MESSAGE[RPC_ERROR.METHOD_NOT_SUPPORTED]);
    }
    const { method } = message;

    const { prioritizedProvider } = await extensionLocalStorage();

    if (commonNoPopupMethods.includes(method)) {
      if (method === 'com_providers') {
        const response: ComProvidersResponse = prioritizedProvider;

        sendMessage({
          target: 'CONTENT',
          method: 'responseApp',
          origin,
          requestId,
          tabId,
          params: {
            id: requestId,
            result: response,
          },
        });
      }
    }
  } catch (e) {
    if (e instanceof CommonRPCError) {
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
          message: RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL],
        },
      },
    });
  }
}
