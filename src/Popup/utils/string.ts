export function shorterAddress(address?: string, maxLength = 25) {
  const length = Math.floor(maxLength / 2);

  if ((address?.length || Infinity) <= maxLength) {
    return address;
  }

  return address ? `${address.substring(0, length)}...${address.substring(address.length - length, address.length)}` : '';
}

export function isEqualsIgnoringCase(a?: string, b?: string) {
  return typeof a === 'string' && typeof b === 'string' && a.toLowerCase() === b.toLowerCase();
}

export function timeToString(time: number) {
  const date = new Date(time);

  const toString = (num: number) => {
    if (num < 10) {
      return `0${num}`;
    }
    return `${num}`;
  };

  return `${date.getFullYear()}-${toString(date.getMonth() + 1)}-${toString(date.getDate())} ${toString(date.getHours())}:${toString(
    date.getMinutes(),
  )}:${toString(date.getSeconds())}`;
}
