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
