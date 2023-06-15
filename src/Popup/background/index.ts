import { APTOS_NETWORKS, COSMOS_CHAINS, ETHEREUM_NETWORKS, SUI_NETWORKS } from '~/constants/chain';
import { APTOS } from '~/constants/chain/aptos/aptos';
import { COSMOS } from '~/constants/chain/cosmos/cosmos';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { SUI } from '~/constants/chain/sui/sui';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import { MESSAGE_TYPE } from '~/constants/message';
import { PATH } from '~/constants/route';
import { extension } from '~/Popup/utils/extension';
import { setSessionStorage } from '~/Popup/utils/extensionSessionStorage';
import { getStorage, setStorage } from '~/Popup/utils/extensionStorage';
import { openTab } from '~/Popup/utils/extensionTabs';
import { closeWindow } from '~/Popup/utils/extensionWindows';
import { responseToWeb } from '~/Popup/utils/message';
import type { CurrencyType, LanguageType, Queue } from '~/types/extensionStorage';
import type { ContentScriptToBackgroundEventMessage, RequestMessage } from '~/types/message';
import type { ThemeType } from '~/types/theme';

import { cstob } from './messageProcessor';

function background() {
  extension.runtime.onMessage.addListener((request: ContentScriptToBackgroundEventMessage<RequestMessage>, _, sendResponse) => {
    if (request?.type === MESSAGE_TYPE.REQUEST__CONTENT_SCRIPT_TO_BACKGROUND) {
      void cstob(request);
      sendResponse();
    }
  });

  extension.storage.onChanged.addListener((changes) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, { newValue }] of Object.entries(changes)) {
      if (key === 'queues') {
        const newQueues = newValue as Queue[] | undefined;
        const text = newQueues ? `${newQueues.length > 0 ? newQueues.length : ''}` : '';
        void extension.action.setBadgeText({ text });
      }

      if (key === 'theme') {
        const newTheme = newValue as ThemeType;
        void extension.action.setIcon({ path: newTheme === 'LIGHT' ? '/icon128.png' : '/icon128-dark.png' });
      }
    }
  });

  extension.windows.onRemoved.addListener((windowId) => {
    void (async () => {
      const queues = await getStorage('queues');

      const currentWindowIds = queues.filter((item) => typeof item.windowId === 'number').map((item) => item.windowId) as number[];

      const currentWindowId = await getStorage('windowId');

      if (typeof currentWindowId === 'number') {
        currentWindowIds.push(currentWindowId);
      }

      const windowIds = Array.from(new Set(currentWindowIds));

      await setStorage('windowId', null);

      if (windowIds.includes(windowId)) {
        queues.forEach((queue) => {
          responseToWeb({
            response: {
              error: {
                code: RPC_ERROR.USER_REJECTED_REQUEST,
                message: `${RPC_ERROR_MESSAGE[RPC_ERROR.USER_REJECTED_REQUEST]}`,
              },
            },
            message: queue.message,
            messageId: queue.messageId,
            origin: queue.origin,
          });

          void closeWindow(queue.windowId);
        });

        await setStorage('queues', []);
      }
    })();
  });

  extension.runtime.onStartup.addListener(() => {
    void (async () => {
      await setStorage('queues', []);
      await setStorage('windowId', null);

      await setSessionStorage('password', null);
    })();
  });

  extension.runtime.onInstalled.addListener((details) => {
    void (async () => {
      if (details.reason === 'install') {
        await setStorage('queues', []);
        await setStorage('windowId', null);
        await setStorage('accounts', []);
        await setStorage('accountName', {});
        await setStorage('additionalChains', []);
        await setStorage('additionalEthereumNetworks', []);
        await setStorage('ethereumTokens', []);
        await setStorage('ethereumNFTs', []);
        await setStorage('encryptedPassword', null);
        await setStorage('selectedAccountId', '');

        await setStorage('addressBook', []);

        await setStorage('theme', '' as ThemeType);

        await setStorage('rootPath', PATH.DASHBOARD);
        await setStorage('homeTabPath', {
          ethereum: ETHEREUM_NETWORKS.map((network) => ({
            networkId: network.id,
            tabValue: 0,
          })),
          cosmos: COSMOS_CHAINS.map((chain) => ({
            chainId: chain.id,
            tabValue: 0,
          })),
          sui: SUI_NETWORKS.map((network) => ({
            networkId: network.id,
            tabValue: 0,
          })),
          aptos: APTOS_NETWORKS.map((network) => ({
            networkId: network.id,
            tabValue: 0,
          })),
        });

        await setStorage('language', '' as LanguageType);
        await setStorage('currency', '' as CurrencyType);

        await setStorage('allowedChainIds', [ETHEREUM.id, COSMOS.id, APTOS.id, SUI.id]);
        await setStorage('allowedOrigins', []);
        await setStorage('selectedChainId', '');
        await setStorage('selectedEthereumNetworkId', ETHEREUM_NETWORKS[0].id);
        await setStorage('selectedAptosNetworkId', APTOS_NETWORKS[0].id);
        await setStorage('selectedSuiNetworkId', SUI_NETWORKS[0].id);

        await setStorage('autoSigns', []);

        await setSessionStorage('password', null);

        await openTab();
      }
    })();
  });

  void extension.action.setBadgeBackgroundColor({ color: '#7C4FFC' });
  void extension.action.setBadgeText({ text: '' });
}

background();
