import { useTranslation as useBaseTranslation } from 'react-i18next';

import { useChromeStorage } from '~/Popup/hooks/useExtensionStorage';
import type { LanguageType } from '~/types/chromeStorage';

export function useTranslation() {
  const baseTranslation = useBaseTranslation();
  const { setChromeStorage } = useChromeStorage();

  const t = (key: string) => baseTranslation.t(key, { nsSeparator: ':', keySeparator: '.' });

  const changeLanguage = async (language: LanguageType) => {
    if (baseTranslation.i18n.language !== language) {
      await baseTranslation.i18n.changeLanguage(language);
      await setChromeStorage('language', language);
    }
  };

  return { language: baseTranslation.i18n.language, changeLanguage, t };
}
