import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

import Wrapper from '@/components/Wrapper';

// import { addAccount } from '@/libs/account';
// import { getAccountAssets } from '@/libs/asset';
// import { sendMessage } from '@/libs/extension';

export const Route = createRootRoute({
  component: () => (
    <Wrapper>
      <>
        {/* <button
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
      </button> */}

        <Outlet />
        <TanStackRouterDevtools />
      </>
    </Wrapper>
  ),
});
