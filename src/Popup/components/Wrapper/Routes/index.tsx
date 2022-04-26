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
      if (chromeStorage.queues[0].message.method === 'ten_requestAccount') {
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

      if (chromeStorage.queues[0].message.method === 'eth_addNetwork') {
        navigate('/popup/ethereum/add-network');
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chromeStorage.queues]);

  if (isLoading) {
    return null;
  }

  return children;
}
