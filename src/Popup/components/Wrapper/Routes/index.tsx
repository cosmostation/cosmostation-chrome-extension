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
      if (chromeStorage.accounts.length < 1 && window.outerWidth < 450) {
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
        chromeStorage.queues[0].message.method === 'wallet_requestPermissions' ||
        chromeStorage.queues[0].message.method === 'ten_requestAccount' ||
        chromeStorage.queues[0].message.method === 'aptos_account' ||
        chromeStorage.queues[0].message.method === 'aptos_connect' ||
        chromeStorage.queues[0].message.method === 'sui_connect' ||
        chromeStorage.queues[0].message.method === 'sui_getAccount'
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

      if (chromeStorage.queues[0].message.method === 'cos_signMessage') {
        navigate('/popup/cosmos/sign/message');
      }

      if (chromeStorage.queues[0].message.method === 'cos_setAutoSign') {
        navigate('/popup/cosmos/auto-sign/set');
      }

      if (chromeStorage.queues[0].message.method === 'cos_getAutoSign') {
        navigate('/popup/cosmos/auto-sign/get');
      }

      if (chromeStorage.queues[0].message.method === 'cos_deleteAutoSign') {
        navigate('/popup/cosmos/auto-sign/delete');
      }

      if (chromeStorage.queues[0].message.method === 'cos_addTokensCW20Internal') {
        navigate('/popup/cosmos/add-tokens');
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

      if (chromeStorage.queues[0].message.method === 'aptos_signTransaction' || chromeStorage.queues[0].message.method === 'aptos_signAndSubmitTransaction') {
        navigate('/popup/aptos/transaction');
      }

      if (chromeStorage.queues[0].message.method === 'aptos_signTransaction' || chromeStorage.queues[0].message.method === 'aptos_signAndSubmitTransaction') {
        navigate('/popup/aptos/transaction');
      }

      if (chromeStorage.queues[0].message.method === 'aptos_signMessage') {
        navigate('/popup/aptos/sign-message');
      }

      if (chromeStorage.queues[0].message.method === 'sui_signAndExecuteTransactionBlock') {
        navigate('/popup/sui/transaction');
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chromeStorage.queues]);

  if (isLoading) {
    return null;
  }

  return children;
}
