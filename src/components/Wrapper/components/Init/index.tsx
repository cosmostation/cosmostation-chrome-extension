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

  // const handleOnStorageChange = <T extends ExtensionStorageKeys>(_: Record<T, ExtensionStorage[T]>, areaName: string) => {
  const handleOnStorageChange = (changes: browser.storage.StorageChange, areaName: string) => {
    void (async () => {
      if (areaName === 'local') {
        const keys = Object.keys(changes) as ExtensionStorageKeys[];

        for (const key of keys) {
          if (key === 'requestQueue' || key === 'approvedOrigins' || key === 'approvedSuiPermissions') {
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

      // TODO 플래그 설정해서 로딩 후, 다음 컴포넌트로 진입할 수 있도록. setOverlayLoading(false); => HOC구조.등등등
      // TODO 상위 컴포넌트에서 일정 주기별로, asset, params데이터 갱신 전략(중간에 데이터 못가져왔을때 갱신 안되도록.) 잘 고려 필요. 데이터 정합성 체크 필요, 추후에 백업 전략도 고려 필요.
      // TODO 카바 118로 고정시 evm쪽 에셋 미노출 & evm kava 사인 요청 거절 => 컨펌필요.
      // NOTE 프로토버프 사용전략 api 민캔 api로 변경 고려.
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
