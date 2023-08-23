import { useMemo } from 'react';

import { HOME_TAB_INDEX_TYPE } from '~/constants/extensionStorage';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';

import { useCurrentChain } from './useCurrentChain';

export function useCurrentTabIndex() {
  const { currentChain } = useCurrentChain();
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();
  const { homeTabIndex } = extensionStorage;

  const homeTabIndexKey = useMemo(() => HOME_TAB_INDEX_TYPE[currentChain.line], [currentChain.line]);

  const currentTabIndex = useMemo(() => homeTabIndex[homeTabIndexKey], [homeTabIndex, homeTabIndexKey]);

  const setCurrentTabIndex = (tabIndex: number) => {
    void setExtensionStorage('homeTabIndex', {
      ...homeTabIndex,
      [homeTabIndexKey]: tabIndex,
    });
  };

  return { currentTabIndex, setCurrentTabIndex };
}
