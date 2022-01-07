import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { useTranslation } from '~/Popup/hooks/useTranslation';
import { chromeStorageState } from '~/Popup/recoils/chromeStorage';
import { inMemoryState } from '~/Popup/recoils/inMemory';
import { getAllStorage, setStorage } from '~/Popup/utils/chromeStorage';
import { openTab } from '~/Popup/utils/chromeTabs';
import { openWindow } from '~/Popup/utils/chromeWindows';
import { requestGetAllInMemory } from '~/Popup/utils/message';
import type { LanguageType } from '~/types/chromeStorage';

type InitType = {
  children: JSX.Element;
};

export default function Init({ children }: InitType) {
  const [isLoading, setIsLoading] = useState(true);

  const [chromeStorage, setChromeStorage] = useRecoilState(chromeStorageState);
  const setInMemory = useSetRecoilState(inMemoryState);

  const navigate = useNavigate();

  const { changeLanguage, language } = useTranslation();

  useEffect(() => {
    chrome.storage.onChanged.addListener(() => {
      void (async function async() {
        setChromeStorage(await getAllStorage());
      })();
    });

    void (async function async() {
      console.log(await getAllStorage());
      setChromeStorage(await getAllStorage());

      setInMemory(await requestGetAllInMemory());

      if (language && chromeStorage.language !== language) {
        await setStorage('language', language as LanguageType);
      }
      // if (!chromeStorage.password) {
      //   console.log(chromeStorage);
      //   await openTab();
      //   navigate('/register/password');
      // }

      setIsLoading(false);
    })();

    console.log('init useEffect');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return null;
  }

  return children;
}
