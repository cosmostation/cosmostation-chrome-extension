export function chunkArray<T>(data: T[], chunkSize: number) {
  return Array.from({ length: Math.ceil(data.length / chunkSize) }, (_, i) => data.slice(i * chunkSize, i * chunkSize + chunkSize));
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

export function sortByReference<T, K>(target: T[], reference: K[], isEqual: (a: T, b: K) => boolean): T[] {
  return [...target].sort((a, b) => {
    const idxA = reference.findIndex((ref) => isEqual(a, ref));
    const idxB = reference.findIndex((ref) => isEqual(b, ref));

    const weightA = idxA < 0 ? Number.MAX_SAFE_INTEGER : idxA;
    const weightB = idxB < 0 ? Number.MAX_SAFE_INTEGER : idxB;

    return weightA - weightB;
  });
}
