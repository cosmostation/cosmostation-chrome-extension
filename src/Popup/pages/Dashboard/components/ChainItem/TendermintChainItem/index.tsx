import { useEffect } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { useSetRecoilState } from 'recoil';

import { useAmountSWR } from '~/Popup/hooks/SWR/tendermint/useAmountSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import ChainItem, { ChainItemError, ChainItemSkeleton } from '~/Popup/pages/Dashboard/components/ChainItem';
import { dashboardState } from '~/Popup/recoils/dashboard';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import type { TendermintChain } from '~/types/chain';

type TendermintChainItemProps = {
  chain: TendermintChain;
};

export default function TendermintChainItem({ chain }: TendermintChainItemProps) {
  const { chromeStorage } = useChromeStorage();
  const setDashboard = useSetRecoilState(dashboardState);
  const { currentAccount } = useCurrentAccount();
  const { data } = useCoinGeckoPriceSWR();
  const { totalAmount } = useAmountSWR(chain, true);
  const { chainName, decimals, displayDenom, coinGeckoId, imageURL } = chain;

  const { setCurrentChain } = useCurrentChain();
  const { navigate } = useNavigate();

  useEffect(() => {
    setDashboard((prev) => ({
      [currentAccount.id]: {
        ...prev?.[currentAccount.id],
        [chain.id]: times(toDisplayDenomAmount(totalAmount, decimals), (coinGeckoId && data?.[coinGeckoId]?.[chromeStorage.currency]) || 0) || '0',
      },
    }));
  }, [chain.id, chromeStorage.currency, coinGeckoId, data, decimals, setDashboard, totalAmount, currentAccount.id]);

  const handleOnClick = () => {
    void setCurrentChain(chain);
    navigate('/wallet');
  };

  return (
    <ChainItem
      onClick={handleOnClick}
      chainName={chainName}
      amount={totalAmount}
      decimals={decimals}
      displayDenom={displayDenom}
      coinGeckoId={coinGeckoId}
      imageURL={imageURL}
    />
  );
}

export function TendermintChainItemSkeleton({ chain }: TendermintChainItemProps) {
  const { setCurrentChain } = useCurrentChain();
  const { navigate } = useNavigate();

  const handleOnClick = () => {
    void setCurrentChain(chain);
    navigate('/wallet');
  };

  const { chainName, imageURL } = chain;

  return <ChainItemSkeleton onClick={handleOnClick} chainName={chainName} imageURL={imageURL} />;
}

export function TendermintChainItemError({ chain, resetErrorBoundary }: TendermintChainItemProps & FallbackProps) {
  useAmountSWR(chain);
  const { setCurrentChain } = useCurrentChain();
  const { navigate } = useNavigate();

  const handleOnClick = () => {
    void setCurrentChain(chain);
    navigate('/wallet');
  };

  const { chainName, imageURL } = chain;

  return <ChainItemError onClick={handleOnClick} chainName={chainName} imageURL={imageURL} onClickRetry={() => resetErrorBoundary()} />;
}
