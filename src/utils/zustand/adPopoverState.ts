import { produce } from 'immer';

import type { AdPopoverState } from '@/types/extension';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { getExtensionLocalStorage, setExtensionLocalStorage } from '../storage';

export const updateAdPopover = async (popoverId: string, state: AdPopoverState) => {
  const storedAdPopoverState = (await getExtensionLocalStorage('adPopoverState')) || {};

  const updatedAdPopoverState = produce(storedAdPopoverState, (draft) => {
    draft[popoverId] = state;
  });

  await setExtensionLocalStorage('adPopoverState', updatedAdPopoverState);

  useExtensionStorageStore.setState((currentState) =>
    produce(currentState, (draft) => {
      draft.adPopoverState = updatedAdPopoverState;
    }),
  );
};

export const turnOffAdPopover = async (popoverId: string, lastClosed?: number) => {
  const storedAdPopoverState = (await getExtensionLocalStorage('adPopoverState')) || {};

  const selected = storedAdPopoverState[popoverId] || {};

  const newState = produce(selected, (draft) => {
    if (lastClosed) {
      draft.lastClosed = lastClosed;
    }
  });

  await updateAdPopover(popoverId, newState);
};
