import i18n, { t } from 'i18next';

import { getStorage } from '~/Popup/utils/extensionStorage';

export async function initI18n() {
  const language = await getStorage('language');

  if (i18n.language !== language) {
    await i18n.changeLanguage(language as string);
  }

  return { t };
}
