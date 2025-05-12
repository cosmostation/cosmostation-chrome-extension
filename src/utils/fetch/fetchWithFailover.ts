export async function fetchWithFailover<T>(urls: string[], fetcher: (url: string) => Promise<T>): Promise<T> {
  for (const url of urls) {
    try {
      return await fetcher(url);
    } catch {
      continue;
    }
  }
  throw new Error('All endpoints failed');
}
