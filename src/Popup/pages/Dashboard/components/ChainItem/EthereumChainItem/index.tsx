import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { useBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useBalanceSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useCurrentNetwork } from '~/Popup/hooks/useCurrent/useCurrentNetwork';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import ChainItem, { ChainItemSkeleton } from '~/Popup/pages/Dashboard/components/ChainItem';
import { dashboardState } from '~/Popup/recoils/dashboard';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import type { EthereumChain } from '~/types/chain';

type EthereumChainItemProps = {
  chain: EthereumChain;
};

export default function EthereumChainItem({ chain }: EthereumChainItemProps) {
  const { currentNetwork } = useCurrentNetwork();
  const { chromeStorage } = useChromeStorage();
  const { setCurrentChain } = useCurrentChain();
  const { navigate } = useNavigate();
  const { data: coinGeckoData } = useCoinGeckoPriceSWR();

  const setDashboard = useSetRecoilState(dashboardState);
  const { data } = useBalanceSWR(chain, true);

  const totalAmount = BigInt(data?.result || '0').toString();

  const { decimals, networkName, coinGeckoId, displayDenom } = currentNetwork;
  const { chainName, imageURL } = chain;

  useEffect(() => {
    setDashboard((prev) => ({
      ...prev,
      [chain.id]: times(toDisplayDenomAmount(totalAmount, decimals), (coinGeckoId && coinGeckoData?.[coinGeckoId]?.[chromeStorage.currency]) || 0) || '0',
    }));
  }, [chain.id, chromeStorage.currency, coinGeckoId, coinGeckoData, decimals, setDashboard, totalAmount]);

  const handleOnClick = () => {
    void setCurrentChain(chain);
    navigate('/wallet');
  };

  return (
    <ChainItem
      onClick={handleOnClick}
      chainName={`${chainName} (${networkName})`}
      decimals={decimals}
      coinGeckoId={coinGeckoId}
      amount={totalAmount}
      displayDenom={displayDenom}
      imageURL={imageURL}
    />
  );
}

export function EthereumChainItemSkeleton({ chain }: EthereumChainItemProps) {
  const { setCurrentChain } = useCurrentChain();
  const { navigate } = useNavigate();

  const { currentNetwork } = useCurrentNetwork();

  const handleOnClick = () => {
    void setCurrentChain(chain);
    navigate('/wallet');
  };

  const { networkName } = currentNetwork;
  const { chainName, imageURL } = chain;
  return <ChainItemSkeleton chainName={`${chainName} (${networkName})`} imageURL={imageURL} onClick={handleOnClick} />;
}
