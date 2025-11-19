import { getTimestampValue, isUnixTimestamp } from '@/utils/date';

export function getLocalTime(timestamp: string): string {
  if (timestamp) {
    const normalizedTxTime = isUnixTimestamp(timestamp) ? getTimestampValue(timestamp) : timestamp;

    const date = new Date(normalizedTxTime);

    return `${date.getHours().toString().padStart(2, '0')} : ${date.getMinutes().toString().padStart(2, '0')} :${date.getSeconds().toString().padStart(2, '0')}`;
  }

  return '';
}
