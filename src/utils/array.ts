import type { Draft } from 'immer';
import { produce } from 'immer';

export function chunkArray<T>(data: T[], chunkSize: number) {
  return Array.from({ length: Math.ceil(data.length / chunkSize) }, (_, i) => data.slice(i * chunkSize, i * chunkSize + chunkSize));
}

export function upsertList<T>(
  originalList: T[],
  incomingList: T[],
  isEqual: (a: Draft<T>, b: T) => boolean,
  merge: (existing: Draft<T>, incoming: T) => void,
): T[] {
  return produce(originalList, (draft) => {
    incomingList.forEach((incomingItem) => {
      const existing = draft.find((item) => isEqual(item, incomingItem));

      if (existing) {
        merge(existing, incomingItem);
      } else {
        draft.push(incomingItem as Draft<T>);
      }
    });
  });
}

export function removeDuplicates<T>(list: T[], isDuplicate: (a: T, b: T) => boolean): T[] {
  return list.reduce<T[]>((acc, item) => {
    const alreadyExists = acc.some((existing) => isDuplicate(existing, item));
    if (!alreadyExists) {
      acc.push(item);
    }
    return acc;
  }, []);
}
