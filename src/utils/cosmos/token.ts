export function toDisplayCWTokenStandard(tokenStandard?: string) {
  const standardNumber = tokenStandard?.match(/\d+/g);

  if (!tokenStandard || !standardNumber || standardNumber.length === 0) {
    return '';
  }

  return 'CW-'.concat(standardNumber[0]);
}
