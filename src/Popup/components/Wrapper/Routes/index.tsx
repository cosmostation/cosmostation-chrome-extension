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
    void (async () => {
      if (chromeStorage.accounts.length < 1) {
        await openTab();
      }

      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (chromeStorage.queues.length > 0) {
      if (chromeStorage.queues[0].message.method === 'ten_requestAccount' || chromeStorage.queues[0].message.method === 'eth_requestAccounts') {
        navigate('/popup/request-account');
      }

      if (chromeStorage.queues[0].message.method === 'ten_addChain') {
        navigate('/popup/tendermint/add-chain');
      }

      if (chromeStorage.queues[0].message.method === 'ten_signAmino') {
        navigate('/popup/tendermint/sign/amino');
      }

      if (chromeStorage.queues[0].message.method === 'ten_signDirect') {
        navigate('/popup/tendermint/sign/direct');
      }

      if (chromeStorage.queues[0].message.method === 'ethc_addNetwork') {
        navigate('/popup/ethereum/add-network');
      }

      if (chromeStorage.queues[0].message.method === 'ethc_switchNetwork') {
        navigate('/popup/ethereum/switch-network');
      }

      if (chromeStorage.queues[0].message.method === 'eth_sign') {
        navigate('/popup/ethereum/sign');
      }

      if (chromeStorage.queues[0].message.method === 'personal_sign') {
        navigate('/popup/ethereum/personal-sign');
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chromeStorage.queues]);

  if (isLoading) {
    return null;
  }

  return children;
}
