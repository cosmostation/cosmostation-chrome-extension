export function shorterAddress(address?: string, maxLength = 25) {
  const length = Math.floor(maxLength / 2);

  if ((address?.length || Infinity) <= maxLength) {
    return address;
  }

  return address ? `${address.substring(0, length)}...${address.substring(address.length - length, address.length)}` : '';
}

export function isNumber(number: string) {
  return !isNaN(Number(number));
}

export function isDecimal(number: string, decimal: number) {
  if (!isNumber(number)) {
    return false;
  }

  const regex = new RegExp(`^([1-9][0-9]*\\.?[0-9]{0,${decimal}}|0\\.[0-9]{0,${decimal}}|0)$`);

  if (!regex.test(number)) {
    return false;
  }

  return true;
}
