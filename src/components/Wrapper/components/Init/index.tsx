import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';

import { LANGUAGE_TYPE } from '@/constants/language';
import type { StoreSyncedStorageKeys } from '@/types/extension';
import type { LanguageType } from '@/types/language';
import { extension } from '@/utils/browser';
import { getExtensionLocalStorage, initExtensionLocalStorage, setExtensionLocalStorage } from '@/utils/storage';
import { extractAccountIdFromKey } from '@/utils/string';
import { loadExtensionSessionStorageStoreFromStorage } from '@/zustand/hooks/useExtensionSessionStorageStore';
import { loadExtensionStorageStoreFromStorageByKey } from '@/zustand/hooks/useExtensionStorageStore';
import { loadAllStoreFromStorage } from '@/zustand/utils';

import { Splash } from './styled';

type InitProps = {
  children: JSX.Element;
};

const STORE_SYNC_KEYS_TO_RELOAD: ReadonlySet<StoreSyncedStorageKeys> = new Set([
  'requestQueue',
  'approvedOrigins',
  'approvedSuiPermissions',
  'approvedIotaPermissions',
]);

const isNftKey = (key: string) => key.includes('-nft-');
const isAssetIdsKey = (key: string) => key.includes('-hidden-assetIds') || key.includes('-visible-assetIds');
const isAddressKey = (key: string) => key.includes('-address') || key.includes('-custom-address');
const isCustomAddressKey = (key: string) => key.includes('-custom-address');

function resolveLanguage(i18nLang: string | undefined): LanguageType {
  const supported = new Set(Object.values(LANGUAGE_TYPE) as string[]);
  if (!i18nLang) return LANGUAGE_TYPE.EN;
  return (supported.has(i18nLang) ? i18nLang : LANGUAGE_TYPE.EN) as LanguageType;
}

export default function Init({ children }: InitProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  const { i18n } = useTranslation();
  const queryClient = useQueryClient();

  const syncLanguagePreference = useCallback(async () => {
    const storedLang = await getExtensionLocalStorage('userLanguagePreference');

    if (i18n.language && !storedLang) {
      const newLanguage = resolveLanguage(i18n.language);
      await i18n.changeLanguage(newLanguage);
      await setExtensionLocalStorage('userLanguagePreference', newLanguage);
    }
  }, [i18n]);

  const handleLocalStorageChange = useCallback(
    async (changes: Record<string, browser.storage.StorageChange>) => {
      const keys = Object.keys(changes);

      for (const key of keys) {
        if (STORE_SYNC_KEYS_TO_RELOAD.has(key as StoreSyncedStorageKeys)) {
          await loadExtensionStorageStoreFromStorageByKey(key as StoreSyncedStorageKeys);
        }

        if (isNftKey(key)) {
          const accountId = extractAccountIdFromKey(key);
          if (accountId) {
            await queryClient.invalidateQueries({ queryKey: ['account-nft', accountId] });
          }
        }

        if (isAssetIdsKey(key)) {
          const accountId = extractAccountIdFromKey(key);
          if (accountId) {
            await queryClient.invalidateQueries({ queryKey: ['account-asset-ids', accountId] });
            await queryClient.invalidateQueries({ queryKey: ['accountAllAssets', accountId] });
          }
        }

        if (isAddressKey(key)) {
          const accountId = extractAccountIdFromKey(key);
          if (accountId) {
            const isCustom = isCustomAddressKey(key);
            await queryClient.invalidateQueries({ queryKey: ['account-address', accountId, isCustom] });
            await queryClient.invalidateQueries({ queryKey: ['multiple-account-addresses'] });
          }
        }
      }
    },
    [queryClient],
  );

  const handleSessionStorageChange = useCallback(async () => {
    await loadExtensionSessionStorageStoreFromStorage();
  }, []);

  const handleOnStorageChange = useCallback(
    (changes: Record<string, browser.storage.StorageChange>, areaName: string) => {
      if (areaName === 'local') {
        void handleLocalStorageChange(changes);
        return;
      }

      if (areaName === 'session') {
        void handleSessionStorageChange();
      }
    },
    [handleLocalStorageChange, handleSessionStorageChange],
  );

  useEffect(() => {
    const hydrate = async () => {
      try {
        await initExtensionLocalStorage();
        await syncLanguagePreference();
        await loadAllStoreFromStorage();
        setIsHydrated(true);
      } catch (err) {
        console.error('[Init] Hydration failed:', err);
        setIsHydrated(true);
      }
    };

    void hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    extension.storage.onChanged.addListener(handleOnStorageChange);

    return () => {
      extension.storage.onChanged.removeListener(handleOnStorageChange);
    };
  }, [isHydrated, handleOnStorageChange]);

  if (!isHydrated) return <Splash />;

  return <>{children}</>;
}
