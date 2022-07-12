export async function post<T>(URL: string, params: unknown) {
  const response = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cosmostation: `extension/${String(process.env.VERSION)}`,
    },
    body: JSON.stringify(params),
  });

  const responseJSON = (await response.json()) as unknown as T;

  return responseJSON;
}
