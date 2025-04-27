import { stripHexPrefix } from 'ethereumjs-util';

import { fix, times } from './numbers';

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

export function isEqualsIgnoringCase(a?: string, b?: string) {
  return typeof a === 'string' && typeof b === 'string' && a.toLowerCase() === b.toLowerCase();
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

export function removeTrailingSlash(path: string) {
  return path.endsWith('/') ? path.slice(0, -1) : path;
}

export function removeTemplateLiteral(path: string) {
  return path.replace(/\$\{\w+\}/g, '');
}

export function parsingHdPath(hdPath: string) {
  const [rootLevel, purposeLevel, coinTypeLevel, accountLevel, changeLevel, indexLevel] = hdPath.split('/');

  return {
    rootLevel,
    purposeLevel,
    coinTypeLevel,
    accountLevel,
    changeLevel,
    indexLevel,
  };
}

export function toBase64(str: string) {
  return Buffer.from(str).toString('base64');
}

export function toPercentages(value: string, options: { fixed?: number; disableMark?: boolean } = { fixed: 2, disableMark: false }) {
  const formattedValue = fix(times(value, '100'), options.fixed);

  return options.disableMark ? formattedValue : formattedValue + '%';
}

export function capitalize(str?: string) {
  if (!str) return;

  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function isJsonString(str: string): boolean {
  try {
    return typeof JSON.parse(str) === 'object';
  } catch {
    return false;
  }
}

export function addHexPrefix(str: string) {
  return str.startsWith('0x') ? str : `0x${str}`;
}

export function toUTF8(hex: string) {
  return Buffer.from(stripHexPrefix(hex), 'hex').toString('utf8');
}

export function getHashIndex(uuid: string, arrayLength: number): number {
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash += uuid.charCodeAt(i);
  }
  return hash % arrayLength;
}

export function trimTrailingZeros(decimalStr: string): string {
  if (!decimalStr.includes('.')) return decimalStr;

  const [intPart, decimalPart] = decimalStr.split('.');
  const trimmedDecimal = decimalPart.replace(/0+$/, '');

  return trimmedDecimal.length > 0 ? `${intPart}.${trimmedDecimal}` : intPart;
}

export function getUtf8BytesLength(str: string): number {
  return new TextEncoder().encode(str).length;
}
