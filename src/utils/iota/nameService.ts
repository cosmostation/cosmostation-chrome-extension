export function isIotaNSDomain(domain: string) {
  return domain.startsWith('@') || domain.endsWith('.iota');
}
