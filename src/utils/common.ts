export function isNil(v: unknown): v is null | undefined {
  return v === undefined || v === null;
}

export function isNonEmptyObject(data: unknown): data is Record<string, unknown> {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }

  for (const _ in data) {
    return true;
  }

  return false;
}
