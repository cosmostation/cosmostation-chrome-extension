import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import TranslationEn from './translation/en.json';
import TranslationKo from './translation/ko.json';

const resource = {
  en: {
    translations: TranslationEn,
  },
  ko: {
    translations: TranslationKo,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: resource,
    fallbackLng: 'en',
    debug: __APP_MODE__ === 'development',
    defaultNS: 'translations',
    ns: 'translations',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
