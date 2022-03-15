import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { useAmountSWR } from '~/Popup/hooks/SWR/cosmos/useAmountSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import ChainItem, { ChainItemSkeleton } from '~/Popup/pages/Dashboard/components/ChainItem';
import { dashboardState } from '~/Popup/recoils/dashboard';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import type { TendermintChain } from '~/types/chain';

type TendermintChainItemProps = {
  chain: TendermintChain;
};

export default function TendermintChainItem({ chain }: TendermintChainItemProps) {
  const { chromeStorage } = useChromeStorage();
  const setDashboard = useSetRecoilState(dashboardState);
  const { data } = useCoinGeckoPriceSWR();
  const { totalAmount } = useAmountSWR(chain, true);
  const { chainName, decimals, displayDenom, coinGeckoId, imageURL } = chain;

  const { setCurrentChain } = useCurrentChain();
  const { navigate } = useNavigate();

  useEffect(() => {
    setDashboard((prev) => ({
      ...prev,
      [chain.id]: times(toDisplayDenomAmount(totalAmount, decimals), (coinGeckoId && data?.[coinGeckoId]?.[chromeStorage.currency]) || 0) || '0',
    }));
  }, [chain.id, chromeStorage.currency, coinGeckoId, data, decimals, setDashboard, totalAmount]);

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
