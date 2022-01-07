import i18n from 'i18next';

import enTranslation from './en/translation.json';
import koTranslation from './ko/translation.json';

// eslint-disable-next-line @typescript-eslint/no-floating-promises
i18n.init({
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
