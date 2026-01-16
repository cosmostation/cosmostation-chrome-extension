export function isNil(v: unknown): v is null | undefined {
  return v === undefined || v === null;
}
