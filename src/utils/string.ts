export function shorterAddress(address?: string, maxLength = 25) {
  const length = Math.floor(maxLength / 2);

  if ((address?.length || Infinity) <= maxLength) {
    return address;
  }

  return address ? `${address.substring(0, length)}...${address.substring(address.length - length, address.length)}` : '';
}
