import { useEffect } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { useSetRecoilState } from 'recoil';

import { useBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useBalanceSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import ChainItem, { ChainItemError, ChainItemSkeleton } from '~/Popup/pages/Dashboard/components/ChainItem';
import { dashboardState } from '~/Popup/recoils/dashboard';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import type { EthereumChain, EthereumNetwork } from '~/types/chain';

type EthereumChainItemProps = {
  chain: EthereumChain;
  network: EthereumNetwork;
};

export default function EthereumChainItem({ chain, network }: EthereumChainItemProps) {
  const { chromeStorage } = useChromeStorage();
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
        [chain.id]: times(toDisplayDenomAmount(totalAmount, decimals), (coinGeckoId && coinGeckoData?.[coinGeckoId]?.[chromeStorage.currency]) || 0) || '0',
      },
    }));
  }, [chain.id, chromeStorage.currency, coinGeckoId, coinGeckoData, decimals, setDashboard, totalAmount, currentAccount.id]);

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
