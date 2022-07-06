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
      if (
        chromeStorage.queues[0].message.method === 'cos_requestAccount' ||
        chromeStorage.queues[0].message.method === 'eth_requestAccounts' ||
        chromeStorage.queues[0].message.method === 'ten_requestAccount'
      ) {
        navigate('/popup/request-account');
      }

      if (chromeStorage.queues[0].message.method === 'cos_addChain' || chromeStorage.queues[0].message.method === 'ten_addChain') {
        navigate('/popup/cosmos/add-chain');
      }

      if (chromeStorage.queues[0].message.method === 'cos_signAmino' || chromeStorage.queues[0].message.method === 'ten_signAmino') {
        navigate('/popup/cosmos/sign/amino');
      }

      if (chromeStorage.queues[0].message.method === 'cos_signDirect' || chromeStorage.queues[0].message.method === 'ten_signDirect') {
        navigate('/popup/cosmos/sign/direct');
      }

      if (chromeStorage.queues[0].message.method === 'ethc_addNetwork') {
        navigate('/popup/ethereum/add-network');
      }

      if (chromeStorage.queues[0].message.method === 'ethc_addTokens') {
        navigate('/popup/ethereum/add-tokens');
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

      if (chromeStorage.queues[0].message.method === 'eth_signTransaction') {
        navigate('/popup/ethereum/transaction');
      }

      if (chromeStorage.queues[0].message.method === 'eth_sendTransaction') {
        navigate('/popup/ethereum/transaction');
      }

      if (chromeStorage.queues[0].message.method === 'eth_signTypedData_v3' || chromeStorage.queues[0].message.method === 'eth_signTypedData_v4') {
        navigate('/popup/ethereum/sign-typed-data');
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chromeStorage.queues]);

  if (isLoading) {
    return null;
  }

  return children;
}
