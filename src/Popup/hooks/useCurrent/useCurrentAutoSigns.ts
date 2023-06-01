import { useCallback, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import type { AutoSign } from '~/types/extensionStorage';

import { useInterval } from '../useInterval';

export function useCurrentAutoSigns(isInterval = false) {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();

  const { autoSigns } = extensionStorage;

  const [currentTime, setCurrentTime] = useState(new Date().getTime());

  const currentAutoSigns = useMemo(() => autoSigns.filter((item) => item.startTime + item.duration > currentTime), [autoSigns, currentTime]);

  useInterval(() => {
    if (isInterval) {
      setCurrentTime(new Date().getTime());
    }
  }, 1000);

  const addAutoSign = useCallback(
    async (autoSign: Omit<AutoSign, 'id'>) => {
      const newAutoSigns = [
        ...autoSigns.filter((item) => !(item.accountId === autoSign.accountId && item.chainId === autoSign.chainId && item.origin === autoSign.origin)),
        { id: uuidv4(), ...autoSign },
      ];
      await setExtensionStorage('autoSigns', newAutoSigns);
    },
    [autoSigns, setExtensionStorage],
  );

  const removeAutoSign = useCallback(
    async (autoSign: AutoSign) => {
      const newAutoSigns = autoSigns.filter((item) => item.id !== autoSign.id);
      await setExtensionStorage('autoSigns', newAutoSigns);
    },
    [autoSigns, setExtensionStorage],
  );

  return {
    currentAutoSigns,
    addAutoSign,
    removeAutoSign,
  };
}
