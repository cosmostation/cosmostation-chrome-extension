export function chunkArray<T>(data: T[], chunkSize: number) {
  return Array.from({ length: Math.ceil(data.length / chunkSize) }, (_, i) => data.slice(i * chunkSize, i * chunkSize + chunkSize));
}
