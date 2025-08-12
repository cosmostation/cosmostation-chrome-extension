export function compareVersions(v1: string, v2: string): number {
  const arr1 = v1.split('.').map((num) => parseInt(num, 10) || 0);
  const arr2 = v2.split('.').map((num) => parseInt(num, 10) || 0);

  const maxLength = Math.max(arr1.length, arr2.length);

  for (let i = 0; i < maxLength; i++) {
    const num1 = arr1[i] ?? 0;
    const num2 = arr2[i] ?? 0;

    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

export function isVersionInRange(minVersion: string, maxVersion: string): boolean {
  return compareVersions(__APP_VERSION__, minVersion) >= 0 && compareVersions(__APP_VERSION__, maxVersion) <= 0;
}
