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

export function toBase64(str: string) {
  return Buffer.from(str).toString('base64');
}

type toHexOptions = {
  addPrefix?: boolean;
  isStringNumber?: boolean;
};

export function toHex(datum?: number | string, options?: toHexOptions) {
  const result = (() => {
    if (typeof datum === 'number') {
      return datum.toString(16);
    }

    if (typeof datum === 'string') {
      if (/^[0-9]+$/.test(datum) && options?.isStringNumber) {
        return BigInt(datum).toString(16);
      }

      if (datum.startsWith('0x')) {
        return datum.substring(2);
      }
      return Buffer.from(datum, 'utf8').toString('hex');
    }

    return '';
  })();

  if (options?.addPrefix) {
    return `0x${result}`;
  }

  return result;
}

export function hexToDecimal(hex?: string) {
  if (!hex || !/^(0x)?[0-9A-Fa-f]+$/.test(hex)) return '';

  return BigInt(hex).toString(10);
}

export function hexOrDecimalToDecimal(datum?: number | string) {
  const hexValue = toHex(datum, { addPrefix: true, isStringNumber: true });

  return hexToDecimal(hexValue);
}
