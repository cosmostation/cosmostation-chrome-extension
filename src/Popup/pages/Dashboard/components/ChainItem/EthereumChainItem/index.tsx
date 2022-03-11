import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { useBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useBalanceSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentNetwork } from '~/Popup/hooks/useCurrent/useCurrentNetwork';
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
  const { data: coinGeckoData } = useCoinGeckoPriceSWR();

  const setDashboard = useSetRecoilState(dashboardState);
  const { data } = useBalanceSWR(chain, true);

  const totalAmount = BigInt(data?.result || '0').toString();

  const { decimals, networkName, coingeckoId, displayDenom } = currentNetwork;
  const { chainName, imageURL } = chain;

  useEffect(() => {
    setDashboard((prev) => ({
      ...prev,
      [chain.id]: times(toDisplayDenomAmount(totalAmount, decimals), (coingeckoId && coinGeckoData?.[coingeckoId]?.[chromeStorage.currency]) || 0) || '0',
    }));
  }, [chain.id, chromeStorage.currency, coingeckoId, coinGeckoData, decimals, setDashboard, totalAmount]);

  return (
    <ChainItem
      chainName={`${chainName} (${networkName})`}
      decimals={decimals}
      coinGeckoId={coingeckoId}
      amount={totalAmount}
      displayDenom={displayDenom}
      imageURL={imageURL}
    />
  );
}

export function EthereumChainItemSkeleton({ chain }: EthereumChainItemProps) {
  const { currentNetwork } = useCurrentNetwork();

  const { networkName } = currentNetwork;
  const { chainName, imageURL } = chain;
  return <ChainItemSkeleton chainName={`${chainName} (${networkName})`} imageURL={imageURL} />;
}
