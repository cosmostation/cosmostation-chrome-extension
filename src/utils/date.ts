import { divide, fix, times } from './numbers';

export function isUnixTimestamp(dateString: string) {
  return /^\d{10,16}$/.test(dateString) && !isNaN(Number(dateString));
}

export function isUnixTimestampInSec(dateString: string) {
  return /^\d{10}$/.test(dateString) && !isNaN(Number(dateString));
}

export function isUnixTimestampInMicroSec(dateString: string) {
  return /^\d{16}$/.test(dateString) && !isNaN(Number(dateString));
}

export function getTimestampValue(timestamp: string) {
  if (!timestamp) return 0;

  const numericTimestamp = Number(timestamp);
  if (isNaN(numericTimestamp)) return timestamp;

  if (isUnixTimestampInSec(timestamp)) {
    return numericTimestamp * 1000;
  }

  if (isUnixTimestampInMicroSec(timestamp)) {
    return numericTimestamp / 1000;
  }

  return numericTimestamp;
}

export function sortByLatestDate(a?: string | number, b?: string | number) {
  if (!a || !b) return 0;

  const formattedA = typeof a === 'string' ? a : String(a);
  const formattedB = typeof b === 'string' ? b : String(b);

  const aDateValue = isUnixTimestamp(formattedA) ? getTimestampValue(formattedA) : formattedA;
  const bDateValue = isUnixTimestamp(formattedB) ? getTimestampValue(formattedB) : formattedB;

  return new Date(bDateValue).getTime() - new Date(aDateValue).getTime();
}

export function formatDateForHistory(dateString: string) {
  try {
    const dateValue = isUnixTimestamp(dateString) ? getTimestampValue(dateString) : dateString;

    const date = new Date(dateValue);

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };

    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);

    const day = date.getDate();
    const daySuffix = (day: number) => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    };

    const [month, dayNumber, year] = formattedDate.split(' ');

    return `${month} ${dayNumber.replace(',', '')}${daySuffix(day)}, ${year}`;
  } catch {
    return '';
  }
}

export function formatToYearMonthDay(dateString: string): string {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatDateForUnstakingEndDate(dateString: string) {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);

  const hour = date.getHours();
  const minute = date.getMinutes();

  const day = date.getDate();
  const daySuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };

  const [month, dayNumber, year] = formattedDate.split(' ');

  return `${month} ${dayNumber.replace(',', '')}${daySuffix(day)}, ${year} (${hour}:${minute})`;
}

export function getDDay(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const diffDays = Math.floor(diff / (1000 * 3600 * 24));

  return diffDays;
}

export function isStillBlocked(lastClosed: number, blockDays: number): boolean {
  const lastClosedDate = new Date(lastClosed);

  if (isNaN(lastClosedDate.getTime())) {
    throw new Error('Invalid ISO date string provided');
  }

  const currentDate = new Date();
  const diffInDays = (currentDate.getTime() - lastClosedDate.getTime()) / (1000 * 60 * 60 * 24);

  return diffInDays < blockDays;
}

export function isDateAfter(date1: string, date2: string): boolean {
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);

  if (isNaN(firstDate.getTime()) || isNaN(secondDate.getTime())) {
    throw new Error('Invalid ISO date string provided');
  }

  return firstDate.getTime() > secondDate.getTime();
}

export function getTimeDiffInSeconds(timestampMs: number): number {
  const now = Date.now();
  const diffMs = Math.abs(now - timestampMs);
  return Math.floor(diffMs / 1000);
}

export function checkDataFreshness(timestampMs?: number | null) {
  if (!timestampMs) return undefined;

  const timeDiffInSec = getTimeDiffInSeconds(timestampMs);

  const sixMinInSec = 360;
  const tenMinInSec = 600;
  if (timeDiffInSec > tenMinInSec) {
    return 'stale';
  }
  if (timeDiffInSec > sixMinInSec) {
    return 'warning';
  }

  return 'fresh';
}

export function getFutureDateIso(day: number) {
  return new Date(Date.now() + day * 24 * 60 * 60 * 1000).toISOString();
}

export function getDayFromSeconds(second: string) {
  const formattedSecond = second.replace('s', '');
  const day = fix(divide(formattedSecond, times(24, 3600)), undefined, 1);

  return day;
}

export function getLast24HoursRange() {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const format = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}`;
  };

  return {
    startDate: format(oneDayAgo),
    endDate: format(now),
  };
}
