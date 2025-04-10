import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { sendMessage } from '@/libs/extension';
import type { ExtensionStorage } from '@/types/extension';
import { devLogger } from '@/utils/devLogger';
import { loadExtensionStorageStoreFromStorage } from '@/zustand/hooks/useExtensionStorageStore';
import { useLoadingOverlayStore } from '@/zustand/hooks/useLoadingOverlayStore';

type BalanceInitializerProps = {
  children: JSX.Element;
};

export default function BalanceInitializer({ children }: BalanceInitializerProps) {
  const { t } = useTranslation();

  const { currentAccount } = useCurrentAccount();
  const { startLoadingOverlay, stopLoadingOverlay } = useLoadingOverlayStore((state) => state);
  const { refetch: refetchAccountAssets } = useAccountAllAssets();

  useEffect(() => {
    const checkAndFetchDefaultBalance = async () => {
      const currentAccountId = currentAccount?.id;
      if (!currentAccountId) return;

      const storage = await chrome.storage.local.get<ExtensionStorage>([
        `${currentAccountId}-balance-cosmos`,
        `${currentAccountId}-balance-evm`,
        `${currentAccountId}-balance-bitcoin`,
      ]);

      const cosmosBalances = storage[`${currentAccountId}-balance-cosmos`];
      const evmBalances = storage[`${currentAccountId}-balance-evm`];
      const bitcoinBalances = storage[`${currentAccountId}-balance-bitcoin`];

      if (!cosmosBalances && !evmBalances && !bitcoinBalances) {
        try {
          startLoadingOverlay(
            t('components.Wrapper.components.BalanceInitializer.index.loadingOverlayTitle'),
            t('components.Wrapper.components.BalanceInitializer.index.loadingOverlayMessage'),
          );

          await sendMessage({ target: 'SERVICE_WORKER', method: 'updateDefaultBalance', params: [currentAccountId] });
          await loadExtensionStorageStoreFromStorage();

          await refetchAccountAssets();
        } catch (e) {
          devLogger.error(e);
        } finally {
          stopLoadingOverlay();
        }
      }
    };

    checkAndFetchDefaultBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccount.id]);

  return <>{children}</>;
}
