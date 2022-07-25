import { useCallback, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import type { AutoSign } from '~/types/chromeStorage';

import { useInterval } from '../useInterval';

export function useCurrentAutoSigns() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { autoSigns } = chromeStorage;

  const [currentTime, setCurrentTime] = useState(new Date().getTime());

  const currentAutoSigns = useMemo(() => autoSigns.filter((item) => item.startTime + item.duration > currentTime), [autoSigns, currentTime]);

  useInterval(() => {
    setCurrentTime(new Date().getTime());
  }, 1000);

  const addAutoSign = useCallback(
    async (autoSign: Omit<AutoSign, 'id'>) => {
      const newAutoSigns = [
        ...autoSigns.filter((item) => !(item.accountId === autoSign.accountId && item.chainId === autoSign.chainId && item.origin === autoSign.origin)),
        { id: uuidv4(), ...autoSign },
      ];
      await setChromeStorage('autoSigns', newAutoSigns);
    },
    [autoSigns, setChromeStorage],
  );

  const removeAutoSign = useCallback(
    async (autoSign: AutoSign) => {
      const newAutoSigns = autoSigns.filter((item) => item.id !== autoSign.id);
      await setChromeStorage('autoSigns', newAutoSigns);
    },
    [autoSigns, setChromeStorage],
  );

  return {
    currentAutoSigns,
    addAutoSign,
    removeAutoSign,
  };
}
