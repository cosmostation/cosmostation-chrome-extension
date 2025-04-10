import { useEffect, useState } from 'react';

import type { ExtensionStorageKeys } from '@/types/extension';
import { extension } from '@/utils/browser';
import { initExtensionLocalStorage } from '@/utils/storage';
import { loadExtensionSessionStorageStoreFromStorage } from '@/zustand/hooks/useExtensionSessionStorageStore';
import { loadAllStoreFromStorage } from '@/zustand/utils';

import { Splash } from './styled';

type InitProps = {
  children: JSX.Element;
};

export default function Init({ children }: InitProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  const handleOnStorageChange = (changes: browser.storage.StorageChange, areaName: string) => {
    void (async () => {
      if (areaName === 'local') {
        const keys = Object.keys(changes) as ExtensionStorageKeys[];

        for (const key of keys) {
          if (key === 'requestQueue' || key === 'approvedOrigins' || key === 'approvedSuiPermissions' || key.includes('visible-assetIds')) {
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

      await loadAllStoreFromStorage();

      setIsHydrated(true);
    })();

    return () => {
      extension.storage.onChanged.removeListener(handleOnStorageChange);
    };
  }, []);

  if (!isHydrated) {
    return <Splash />;
  }

  return <>{children}</>;
}
