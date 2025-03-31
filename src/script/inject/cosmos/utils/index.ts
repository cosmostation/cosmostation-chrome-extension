export function toUint8Array(input: ArrayBufferLike | number[]): Uint8Array {
  if (Array.isArray(input)) {
    return new Uint8Array(input);
  }
  return new Uint8Array(input);
}
