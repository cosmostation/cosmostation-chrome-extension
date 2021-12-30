import type { InMemoryData, InMemoryDataKeys } from '~/types/inMemory';

export function inMemory() {
  const data: InMemoryData = { password: null };

  return {
    get: <T extends InMemoryDataKeys>(key: T): InMemoryData[T] | null => data[key] || null,
    getAll: () => data,
    set: <T extends InMemoryDataKeys>(key: T, value: InMemoryData[T]) => {
      data[key] = value;
    },
  };
}
