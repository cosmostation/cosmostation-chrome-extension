import { useEffect, useState } from 'react';

import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { debouncedOpenTab } from '~/Popup/utils/extensionTabs';

type RoutesType = {
  children: JSX.Element;
};

export default function Routes({ children }: RoutesType) {
  const [isLoading, setIsLoading] = useState(true);
  const { extensionStorage } = useExtensionStorage();

  const { navigate } = useNavigate();

  useEffect(() => {
    void (async () => {
      if (extensionStorage.accounts.length < 1) {
        await debouncedOpenTab();
      }

      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (extensionStorage.queues.length > 0) {
      if (
        extensionStorage.queues[0].message.method === 'cos_requestAccount' ||
        extensionStorage.queues[0].message.method === 'eth_requestAccounts' ||
        extensionStorage.queues[0].message.method === 'wallet_requestPermissions' ||
        extensionStorage.queues[0].message.method === 'ten_requestAccount' ||
        extensionStorage.queues[0].message.method === 'aptos_account' ||
        extensionStorage.queues[0].message.method === 'aptos_connect' ||
        extensionStorage.queues[0].message.method === 'sui_connect' ||
        extensionStorage.queues[0].message.method === 'sui_getAccount'
      ) {
        navigate('/popup/request-account');
      }

      if (extensionStorage.queues[0].message.method === 'cos_addChain' || extensionStorage.queues[0].message.method === 'ten_addChain') {
        navigate('/popup/cosmos/add-chain');
      }

      if (extensionStorage.queues[0].message.method === 'cos_signAmino' || extensionStorage.queues[0].message.method === 'ten_signAmino') {
        navigate('/popup/cosmos/sign/amino');
      }

      if (extensionStorage.queues[0].message.method === 'cos_signDirect' || extensionStorage.queues[0].message.method === 'ten_signDirect') {
        navigate('/popup/cosmos/sign/direct');
      }

      if (extensionStorage.queues[0].message.method === 'cos_signMessage') {
        navigate('/popup/cosmos/sign/message');
      }

      if (extensionStorage.queues[0].message.method === 'cos_addTokensCW20Internal') {
        navigate('/popup/cosmos/add-tokens');
      }

      if (extensionStorage.queues[0].message.method === 'cos_addNFTsCW721') {
        navigate('/popup/cosmos/add-nfts');
      }

      if (extensionStorage.queues[0].message.method === 'ethc_addNetwork') {
        navigate('/popup/ethereum/add-network');
      }

      if (extensionStorage.queues[0].message.method === 'ethc_addTokens') {
        navigate('/popup/ethereum/add-tokens');
      }

      if (extensionStorage.queues[0].message.method === 'ethc_switchNetwork') {
        navigate('/popup/ethereum/switch-network');
      }

      if (extensionStorage.queues[0].message.method === 'eth_sign') {
        navigate('/popup/ethereum/sign');
      }

      if (extensionStorage.queues[0].message.method === 'personal_sign') {
        navigate('/popup/ethereum/personal-sign');
      }

      if (extensionStorage.queues[0].message.method === 'eth_signTransaction') {
        navigate('/popup/ethereum/transaction');
      }

      if (extensionStorage.queues[0].message.method === 'eth_sendTransaction') {
        navigate('/popup/ethereum/transaction');
      }

      if (extensionStorage.queues[0].message.method === 'eth_signTypedData_v3' || extensionStorage.queues[0].message.method === 'eth_signTypedData_v4') {
        navigate('/popup/ethereum/sign-typed-data');
      }

      if (
        extensionStorage.queues[0].message.method === 'aptos_signTransaction' ||
        extensionStorage.queues[0].message.method === 'aptos_signAndSubmitTransaction'
      ) {
        navigate('/popup/aptos/transaction');
      }

      if (
        extensionStorage.queues[0].message.method === 'aptos_signTransaction' ||
        extensionStorage.queues[0].message.method === 'aptos_signAndSubmitTransaction'
      ) {
        navigate('/popup/aptos/transaction');
      }

      if (extensionStorage.queues[0].message.method === 'aptos_signMessage') {
        navigate('/popup/aptos/sign-message');
      }

      if (
        extensionStorage.queues[0].message.method === 'sui_signAndExecuteTransactionBlock' ||
        extensionStorage.queues[0].message.method === 'sui_signAndExecuteTransaction' ||
        extensionStorage.queues[0].message.method === 'sui_signTransactionBlock' ||
        extensionStorage.queues[0].message.method === 'sui_signTransaction'
      ) {
        navigate('/popup/sui/transaction');
      }

      if (extensionStorage.queues[0].message.method === 'sui_signMessage' || extensionStorage.queues[0].message.method === 'sui_signPersonalMessage') {
        navigate('/popup/sui/sign-message');
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extensionStorage.queues]);

  if (isLoading) {
    return null;
  }

  return children;
}
