import { useEffect, useState } from 'react';

import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { openTab } from '~/Popup/utils/chromeTabs';

type RoutesType = {
  children: JSX.Element;
};

export default function Routes({ children }: RoutesType) {
  const [isLoading, setIsLoading] = useState(true);
  const { chromeStorage } = useChromeStorage();

  const { navigate } = useNavigate();

  useEffect(() => {
    void (async function async() {
      if (!chromeStorage.password) {
        console.log(chromeStorage);
        await openTab();
        navigate('/register/password');
      }

      if (chromeStorage.password && chromeStorage.accounts.length < 1) {
        await openTab();
        navigate('/register/account');
      }

      setIsLoading(false);
    })();

    console.log('routes useEffect');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return null;
  }

  return children;
}
