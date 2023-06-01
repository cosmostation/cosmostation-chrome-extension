import { useTranslation as useBaseTranslation } from 'react-i18next';

import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import type { LanguageType } from '~/types/extensionStorage';

export function useTranslation() {
  const baseTranslation = useBaseTranslation();
  const { setExtensionStorage } = useExtensionStorage();

  const t = (key: string) => baseTranslation.t(key, { nsSeparator: ':', keySeparator: '.' });

  const changeLanguage = async (language: LanguageType) => {
    if (baseTranslation.i18n.language !== language) {
      await baseTranslation.i18n.changeLanguage(language);
      await setExtensionStorage('language', language);
    }
  };

  return { language: baseTranslation.i18n.language, changeLanguage, t };
}
