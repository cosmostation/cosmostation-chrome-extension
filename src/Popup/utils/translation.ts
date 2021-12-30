import i18next from 'i18next';

export function t(key: string) {
  return i18next.t(key, { nsSeparator: ':', keySeparator: '.' });
}

export function language() {
  return i18next.language;
}
