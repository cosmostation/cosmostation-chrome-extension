import { useRecoilState } from 'recoil';

import { inMemoryState } from '~/Popup/recoils/inMemory';
import { requestSetInMemory } from '~/Popup/utils/message';
import type { InMemoryData, InMemoryDataKeys } from '~/types/inMemory';

export function useInMemory() {
  const [inMemory, setInMemory] = useRecoilState(inMemoryState);

  const set = async <T extends InMemoryDataKeys>(key: T, value: InMemoryData[T]) => {
    setInMemory((prev) => ({ ...prev, [key]: value }));
    return requestSetInMemory(key, value);
  };

  return { inMemory, setInMemory: set };
}
