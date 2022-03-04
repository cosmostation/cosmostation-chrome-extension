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
      if (chromeStorage.accounts.length < 1) {
        await openTab();
      }

      setIsLoading(false);
    })();
  }, [chromeStorage.accounts]);

  if (isLoading) {
    return null;
  }

  return children;
}
