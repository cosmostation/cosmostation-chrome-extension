import { useEffect } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { useSetRecoilState } from 'recoil';

import { LEDGER_SUPPORT_COIN_TYPE } from '~/constants/ledger';
import { useBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useBalanceSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import ChainItem, { ChainItemError, ChainItemLedgerCheck, ChainItemSkeleton } from '~/Popup/pages/Dashboard/components/ChainItem';
import { dashboardState } from '~/Popup/recoils/dashboard';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { debouncedOpenTab } from '~/Popup/utils/extensionTabs';
import type { EthereumChain, EthereumNetwork } from '~/types/chain';

type EthereumChainItemProps = {
  chain: EthereumChain;
  network: EthereumNetwork;
};

export default function EthereumChainItem({ chain, network }: EthereumChainItemProps) {
  const { extensionStorage } = useExtensionStorage();
  const { currentAccount } = useCurrentAccount();
  const { setCurrentEthereumNetwork } = useCurrentEthereumNetwork();
  const { setCurrentChain } = useCurrentChain();
  const { navigate } = useNavigate();
  const { data: coinGeckoData } = useCoinGeckoPriceSWR();

  const setDashboard = useSetRecoilState(dashboardState);
  const { data } = useBalanceSWR(network, { suspense: true });

  const totalAmount = BigInt(data?.result || '0').toString();

  const { decimals, networkName, coinGeckoId, displayDenom, imageURL } = network;

  useEffect(() => {
    setDashboard((prev) => ({
      [currentAccount.id]: {
        ...prev?.[currentAccount.id],
        [network.id]:
          times(toDisplayDenomAmount(totalAmount, decimals), (coinGeckoId && coinGeckoData?.[coinGeckoId]?.[extensionStorage.currency]) || 0) || '0',
      },
    }));
  }, [extensionStorage.currency, coinGeckoData, coinGeckoId, currentAccount.id, decimals, network.id, setDashboard, totalAmount]);

  useEffect(
    () => () => {
      setDashboard((prev) => ({
        [currentAccount.id]: {
          ...prev?.[currentAccount.id],
          [network.id]: '0',
        },
      }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleOnClick = () => {
    void setCurrentChain(chain);
    void setCurrentEthereumNetwork(network);
    navigate('/wallet');
  };

  return (
    <ChainItem
      onClick={handleOnClick}
      chainName={networkName}
      decimals={decimals}
      coinGeckoId={coinGeckoId}
      amount={totalAmount}
      displayDenom={displayDenom}
      imageURL={imageURL}
    />
  );
}

export function EthereumChainItemSkeleton({ chain, network }: EthereumChainItemProps) {
  const { setCurrentChain } = useCurrentChain();
  const { setCurrentEthereumNetwork } = useCurrentEthereumNetwork();
  const { navigate } = useNavigate();

  const handleOnClick = () => {
    void setCurrentChain(chain);
    void setCurrentEthereumNetwork(network);
    navigate('/wallet');
  };

  const { networkName, imageURL } = network;
  return <ChainItemSkeleton chainName={networkName} imageURL={imageURL} onClick={handleOnClick} />;
}

export function EthereumChainItemError({ chain, network, resetErrorBoundary }: EthereumChainItemProps & FallbackProps) {
  useBalanceSWR(network);
  const { setCurrentChain } = useCurrentChain();
  const { setCurrentEthereumNetwork } = useCurrentEthereumNetwork();
  const { navigate } = useNavigate();

  const handleOnClick = () => {
    void setCurrentChain(chain);
    void setCurrentEthereumNetwork(network);
    navigate('/wallet');
  };

  const { imageURL, networkName } = network;

  return <ChainItemError onClick={handleOnClick} chainName={networkName} imageURL={imageURL} onClickRetry={() => resetErrorBoundary()} />;
}

export function EthereumChainItemLedgerCheck({ chain, network, children }: EthereumChainItemProps & { children: JSX.Element }) {
  const { currentAccount } = useCurrentAccount();

  const { enQueue } = useCurrentQueue();

  const handleOnClick = async () => {
    await enQueue({
      messageId: '',
      origin: '',
      channel: 'inApp',
      message: {
        method: 'eth_requestAccounts',
        params: [],
      },
    });

    await debouncedOpenTab();
  };

  const { networkName, imageURL } = network;

  if (currentAccount.type === 'LEDGER' && !currentAccount.ethereumPublicKey && chain.bip44.coinType === LEDGER_SUPPORT_COIN_TYPE.ETHEREUM) {
    return <ChainItemLedgerCheck chainName={networkName} imageURL={imageURL} onClick={handleOnClick} isSupported />;
  }

  if (currentAccount.type === 'LEDGER' && chain.bip44.coinType !== LEDGER_SUPPORT_COIN_TYPE.ETHEREUM) {
    return <ChainItemLedgerCheck chainName={networkName} imageURL={imageURL} isSupported={false} />;
  }

  return children;
}
