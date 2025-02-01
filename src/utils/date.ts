export function formatDateForHistory(dateString: string) {
  const date = new Date(dateString);
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
  const diffDays = Math.ceil(diff / (1000 * 3600 * 24));

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

export function getFutureDateIso(day: number) {
  return new Date(Date.now() + day * 24 * 60 * 60 * 1000).toISOString();
}
