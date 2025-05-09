export function getCoinType(type?: string | null) {
  if (!type || type?.split('::')[1] !== 'coin') {
    return '';
  }

  const startIndex = type.indexOf('<');
  const endIndex = type.lastIndexOf('>');

  if (startIndex > -1 && endIndex > -1) {
    return type.substring(startIndex + 1, endIndex);
  }

  return '';
}
