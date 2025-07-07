import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LANGUAGE_TYPE } from '@/constants/language';
import type { ExtensionStorageKeys } from '@/types/extension';
import type { LanguageType } from '@/types/language';
import { extension } from '@/utils/browser';
import { getExtensionLocalStorage, initExtensionLocalStorage, setExtensionLocalStorage } from '@/utils/storage';
import { loadExtensionSessionStorageStoreFromStorage } from '@/zustand/hooks/useExtensionSessionStorageStore';
import { loadAllStoreFromStorage } from '@/zustand/utils';

import { Splash } from './styled';

type InitProps = {
  children: JSX.Element;
};

export default function Init({ children }: InitProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  const { i18n } = useTranslation();

  const handleOnStorageChange = (changes: browser.storage.StorageChange, areaName: string) => {
    void (async () => {
      if (areaName === 'local') {
        const keys = Object.keys(changes) as ExtensionStorageKeys[];

        for (const key of keys) {
          if (
            key === 'requestQueue' ||
            key === 'approvedOrigins' ||
            key === 'approvedSuiPermissions' ||
            key === 'approvedIotaPermissions' ||
            key.includes('visible-assetIds')
          ) {
            await loadAllStoreFromStorage();
          }
        }
      }

      if (areaName === 'session') {
        await loadExtensionSessionStorageStoreFromStorage();
      }
    })();
  };

  useEffect(() => {
    extension.storage.onChanged.addListener(handleOnStorageChange);

    void (async () => {
      await initExtensionLocalStorage();

      const storedLang = await getExtensionLocalStorage('userLanguagePreference');

      if (i18n.language && !storedLang) {
        const languageType = Object.values(LANGUAGE_TYPE) as string[];
        const newLanguage = (languageType.includes(i18n.language) ? i18n.language : LANGUAGE_TYPE.EN) as LanguageType;
        await i18n.changeLanguage(newLanguage);
        await setExtensionLocalStorage('userLanguagePreference', newLanguage);
      }

      await loadAllStoreFromStorage();

      setIsHydrated(true);
    })();

    return () => {
      extension.storage.onChanged.removeListener(handleOnStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isHydrated) {
    return <Splash />;
  }

  return <>{children}</>;
}
