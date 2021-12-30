import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './en/translation.json';
import koTranslation from './ko/translation.json';

// eslint-disable-next-line @typescript-eslint/no-floating-promises
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: koTranslation },
      en: { translation: enTranslation },
    },
    defaultNS: 'translation',
    fallbackLng: 'en',
    debug: process.env.RUN_MODE === 'development',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
