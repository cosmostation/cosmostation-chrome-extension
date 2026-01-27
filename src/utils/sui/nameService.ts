export function isSuiNSDomain(domain: string) {
  return domain.startsWith('@') || domain.endsWith('.sui');
}
