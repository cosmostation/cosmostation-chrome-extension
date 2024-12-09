import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

import Wrapper from '@/components/Wrapper';
import { addAccount } from '@/libs/account';
import { getAccountAssets } from '@/libs/asset';
import { sendMessage } from '@/libs/extension';
import type { ResponseAppMessage } from '@/types/message/content';
import type { CosSupportedChainIds } from '@/types/message/inject/cosmos';

export const Route = createRootRoute({
  component: () => (
    <Wrapper>
      <>
        <button
          type="button"
          onClick={async () => {
            await chrome.storage.local.clear();
            console.log('clear');
          }}
        >
          clear
        </button>

        <button
          type="button"
          onClick={async () => {
            await addAccount({
              id: '656fcd0b-90de-4fde-afdc-2ad6033c5224',
              index: '0',
              type: 'MNEMONIC',
              mnemonic: '',
            });

            console.log('addAccount');
          }}
        >
          addAccount
        </button>

        <button
          type="button"
          onClick={async () => {
            const response = await sendMessage({ target: 'SERVICE_WORKER', method: 'updateAddress', params: ['656fcd0b-90de-4fde-afdc-2ad6033c5224'] });
            console.log('updateAddress', response);
          }}
        >
          updateAddress
        </button>

        <button
          type="button"
          onClick={async () => {
            const response = await sendMessage({ target: 'SERVICE_WORKER', method: 'updateBalance', params: ['656fcd0b-90de-4fde-afdc-2ad6033c5224'] });
            console.log('updateBalance', response);
          }}
        >
          updateBalance
        </button>

        <button
          type="button"
          onClick={async () => {
            const response = await getAccountAssets('656fcd0b-90de-4fde-afdc-2ad6033c5224');
            console.log('getAccountAssets', response);
          }}
        >
          getAccountAssets
        </button>

        <button
          type="button"
          onClick={async () => {
            const response = await sendMessage<ResponseAppMessage<CosSupportedChainIds>>({
              target: 'CONTENT',
              method: 'responseApp',
              params: { result: { official: [], unofficial: [] } },
              origin: 'https://google.com',
              requestId: '',
            });
            console.log('responseApp', response);
          }}
        >
          updateBalance
        </button>

        <Outlet />
        <TanStackRouterDevtools />
      </>
    </Wrapper>
  ),
});
