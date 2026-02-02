import { removeTrailingSlash } from '../string';

export function withV1Path(rpcURL: string): string {
  const url = new URL(rpcURL);

  const normalizedPath = removeTrailingSlash(url.pathname || '');

  if (normalizedPath === '/v1' || normalizedPath.endsWith('/v1')) {
    url.pathname = normalizedPath || '/v1';
    return url.toString();
  }

  url.pathname = `${normalizedPath}/v1`;
  return url.toString();
}
