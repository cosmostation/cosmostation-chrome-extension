import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { useAmountSWR } from '~/Popup/hooks/SWR/cosmos/useAmountSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import ChainItem, { ChainItemSkeleton } from '~/Popup/pages/Dashboard/components/ChainItem';
import { dashboardState } from '~/Popup/recoils/dashboard';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import type { CosmosChain } from '~/types/chain';

type CosmosChainItemProps = {
  chain: CosmosChain;
  onClick?: () => void;
};

export default function CosmosChainItem({ chain, onClick }: CosmosChainItemProps) {
  const { chromeStorage } = useChromeStorage();
  const setDashboard = useSetRecoilState(dashboardState);
  const { data } = useCoinGeckoPriceSWR();
  const { totalAmount } = useAmountSWR(chain, true);
  const { chainName, decimals, displayDenom, coingeckoId, imageURL } = chain;

  useEffect(() => {
    setDashboard((prev) => ({
      ...prev,
      [chain.id]: times(toDisplayDenomAmount(totalAmount, decimals), (coingeckoId && data?.[coingeckoId]?.[chromeStorage.currency]) || 0) || '0',
    }));
  }, [chain.id, chromeStorage.currency, coingeckoId, data, decimals, setDashboard, totalAmount]);

  return (
    <ChainItem
      onClick={onClick}
      chainName={chainName}
      amount={totalAmount}
      decimals={decimals}
      displayDenom={displayDenom}
      coinGeckoId={coingeckoId}
      imageURL={imageURL}
    />
  );
}

export function CosmosChainItemSkeleton({ chain, onClick }: CosmosChainItemProps) {
  const { chainName, imageURL } = chain;

  return <ChainItemSkeleton onClick={onClick} chainName={chainName} imageURL={imageURL} />;
}
