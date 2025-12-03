import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { browser } from 'wxt/browser';

import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useRefreshAccountAllAssets } from '@/hooks/useRefreshAccountAllAssets';
import { sendMessage } from '@/libs/extension';
import type { ExtensionStorage } from '@/types/extension';
import { devLogger } from '@/utils/devLogger';
import { loadExtensionStorageStoreFromStorage, useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';
import { useLoadingOverlayStore } from '@/zustand/hooks/useLoadingOverlayStore';

type AccountInitializerProps = {
  children: JSX.Element;
};

export default function AccountInitializer({ children }: AccountInitializerProps) {
  const { t } = useTranslation();

  const { currentAccount } = useCurrentAccount();
  const { mnemonicNamesByHashedMnemonic: storedMnemonicNames, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const { startLoadingOverlay, stopLoadingOverlay } = useLoadingOverlayStore((state) => state);
  const { refreshAssets } = useRefreshAccountAllAssets();

  useEffect(() => {
    const initializeAccountData = async () => {
      const currentAccountId = currentAccount?.id;
      if (!currentAccountId) return;

      const storage = await browser.storage.local.get<ExtensionStorage>([
        `${currentAccountId}-address`,
        `${currentAccountId}-balance-cosmos`,
        `${currentAccountId}-balance-evm`,
        `${currentAccountId}-balance-bitcoin`,
        'mnemonicNamesByHashedMnemonic',
      ]);
      const address = storage[`${currentAccountId}-address`];
      const cosmosBalances = storage[`${currentAccountId}-balance-cosmos`];
      const evmBalances = storage[`${currentAccountId}-balance-evm`];
      const bitcoinBalances = storage[`${currentAccountId}-balance-bitcoin`];
      const mnemonicNamesByHashedMnemonic = storage[`mnemonicNamesByHashedMnemonic`];

      const isNeedFetchBalance = !cosmosBalances && !evmBalances && !bitcoinBalances;
      const isNeedFetchAddres = !address;
      const isNeedAddNewMnemonicName = currentAccount.type === 'MNEMONIC' && !mnemonicNamesByHashedMnemonic[currentAccount.encryptedRestoreString];

      if (isNeedFetchBalance || isNeedFetchAddres || isNeedAddNewMnemonicName) {
        try {
          startLoadingOverlay(
            t('pages.components.AccountInitializer.index.loadingOverlayTitle'),
            t('pages.components.AccountInitializer.index.loadingOverlayMessage'),
          );

          if (isNeedFetchBalance) {
            await sendMessage({ target: 'SERVICE_WORKER', method: 'updateDefaultBalance', params: [currentAccountId] });
          }

          if (isNeedFetchAddres) {
            await sendMessage({ target: 'SERVICE_WORKER', method: 'updateAddress', params: [currentAccountId] });
          }

          if (isNeedAddNewMnemonicName) {
            await updateExtensionStorageStore('mnemonicNamesByHashedMnemonic', {
              ...storedMnemonicNames,
              [currentAccount.encryptedRestoreString]: `Mnemonic ${Object.keys(storedMnemonicNames).length + 1}`,
            });
          }

          await loadExtensionStorageStoreFromStorage();

          await refreshAssets();
        } catch (e) {
          devLogger.error(e);
        } finally {
          stopLoadingOverlay();
        }
      }
    };

    initializeAccountData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccount.id]);

  return <>{children}</>;
}
