export function isSolanaNSDomain(domain: string): boolean {
  if (!domain || typeof domain !== 'string') {
    return false;
  }

  return domain.endsWith('.sol');
}
