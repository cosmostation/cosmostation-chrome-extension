import { produce } from 'immer';

import type { LastRequestTimestampsKey } from '@/types/extension';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { getExtensionLocalStorage, setExtensionLocalStorage } from '../storage';

export const removeAccountLastRequestTimestamps = async (accountIds: string[]) => {
  const storedLastRequestTimestamps = await getExtensionLocalStorage('lastRequestTimestamps');

  if (!storedLastRequestTimestamps) return;

  const updatedLastRequestTimestamps = produce(storedLastRequestTimestamps, (draft) => {
    accountIds.forEach((id) => {
      const targetKeys = Object.keys(storedLastRequestTimestamps).filter((item) => item.includes(id)) as LastRequestTimestampsKey[];

      targetKeys.forEach((key) => {
        delete draft[key];
      });
    });
  });

  await setExtensionLocalStorage('lastRequestTimestamps', updatedLastRequestTimestamps);

  useExtensionStorageStore.setState((currentState) =>
    produce(currentState, (draft) => {
      draft.lastRequestTimestamps = updatedLastRequestTimestamps;
    }),
  );
};
