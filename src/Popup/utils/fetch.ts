export class FetchError extends Error {
  public data: Response;

  constructor(data: Response) {
    super();
    this.name = 'FetchError';
    this.data = data;

    Object.setPrototypeOf(this, FetchError.prototype);
  }
}

export async function post<T>(URL: string, params: unknown) {
  const response = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cosmostation: `extension/${String(process.env.VERSION)}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new FetchError(response);
  }

  const responseJSON = (await response.json()) as unknown as T;

  return responseJSON;
}

export async function get<T>(URL: string) {
  const response = await fetch(URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Cosmostation: `extension/${String(process.env.VERSION)}`,
    },
  });

  if (!response.ok) {
    throw new FetchError(response);
  }

  const responseJSON = (await response.json()) as unknown as T;

  return responseJSON;
}

export function buildRequestUrl(baseUrl: string, path?: string, queryParams?: Record<string, string | number | boolean>) {
  const requestUrl = `${baseUrl}${path || ''}`;

  if (queryParams) {
    const params = new URLSearchParams(Object.entries(queryParams).map(([key, value]) => [key, String(value)]));

    return `${requestUrl}?${params.toString()}`;
  }

  return requestUrl;
}

export function removeTrailSlash(url?: string) {
  return url?.replace(/\/$/, '');
}
