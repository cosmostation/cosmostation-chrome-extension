import { useTranslation as useBaseTranslation } from 'react-i18next';

export function useTranslation() {
  const baseTranslation = useBaseTranslation();

  const t = (key: string) => baseTranslation.t(key, { nsSeparator: ':', keySeparator: '.' });

  return { ...baseTranslation, t };
}
