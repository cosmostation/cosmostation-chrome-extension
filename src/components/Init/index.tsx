import { useEffect } from 'react';

import { initExtensionLocalStorage } from '@/utils/storage';
import { loadAllStoreFromStorage } from '@/zustand/utils';

type InitProps = {
  children: JSX.Element;
};

export default function Init({ children }: InitProps) {
  useEffect(() => {
    void (async () => {
      initExtensionLocalStorage();

      loadAllStoreFromStorage();
    })();
  }, []);

  return <>{children}</>;
}
