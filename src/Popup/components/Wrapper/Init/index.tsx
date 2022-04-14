import { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';

import { CHAINS } from '~/constants/chain';
import { CURRENCY_TYPE, LANGUAGE_TYPE } from '~/constants/chromeStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { chromeStorageState } from '~/Popup/recoils/chromeStorage';
import { getAllStorage, setStorage } from '~/Popup/utils/chromeStorage';
import type { LanguageType } from '~/types/chromeStorage';

type InitType = {
  children: JSX.Element;
};

export default function Init({ children }: InitType) {
  const [isLoading, setIsLoading] = useState(true);

  const setChromeStorage = useSetRecoilState(chromeStorageState);

  const { changeLanguage, language } = useTranslation();

  const officialChainNames = CHAINS.map((item) => item.chainName);

  useEffect(() => {
    chrome.storage.onChanged.addListener(() => {
      void (async function async() {
        setChromeStorage(await getAllStorage());
      })();
    });

    void (async function async() {
      const originChromeStorage = await getAllStorage();

      setChromeStorage(originChromeStorage);

      if (language && !originChromeStorage.currency) {
        const newCurrency = language.startsWith('ko')
          ? CURRENCY_TYPE.KRW
          : language.startsWith('ja')
          ? CURRENCY_TYPE.JPY
          : language.startsWith('zh')
          ? CURRENCY_TYPE.CNY
          : CURRENCY_TYPE.USD;

        await setStorage('currency', newCurrency);
      }

      if (language && !originChromeStorage.language) {
        const languageType = Object.values(LANGUAGE_TYPE) as string[];
        const newLanguage = (languageType.includes(language) ? language : 'en') as LanguageType;
        await changeLanguage(newLanguage);
        await setStorage('language', newLanguage);
      }

      if (!originChromeStorage.theme) {
        const theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'DARK' : 'LIGHT';

        await setStorage('theme', theme);
      }

      if (!originChromeStorage.addressBook) {
        await setStorage('addressBook', []);
      }

      if (originChromeStorage.additionalChains.find((item) => officialChainNames.includes(item.chainName))) {
        const newAdditionalChains = originChromeStorage.additionalChains.filter((item) => !officialChainNames.includes(item.chainName));

        await setStorage('additionalChains', newAdditionalChains);
      }

      if (!originChromeStorage.allowedChainIds?.length) {
        await setStorage('allowedChainIds', [CHAINS[0].id]);
        await setStorage('selectedChainId', CHAINS[0].id);
      }

      setIsLoading(false);
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return null;
  }

  return children;
}
