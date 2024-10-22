import { useEffect, useMemo } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { useSetRecoilState } from 'recoil';

import { useBalanceSWR } from '~/Popup/hooks/SWR/bitcoin/useBalanceSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import ChainItem, { ChainItemError, ChainItemLedgerCheck, ChainItemSkeleton } from '~/Popup/pages/Dashboard/components/ChainItem';
import { dashboardState } from '~/Popup/recoils/dashboard';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import type { BitcoinChain } from '~/types/chain';

type BitcoinChainItemProps = {
  chain: BitcoinChain;
};

export default function BitcoinChainItem({ chain }: BitcoinChainItemProps) {
  const { extensionStorage } = useExtensionStorage();
  const { currentAccount } = useCurrentAccount();
  const { setCurrentChain } = useCurrentChain();
  const { navigate } = useNavigate();
  const { data: coinGeckoData } = useCoinGeckoPriceSWR();

  const setDashboard = useSetRecoilState(dashboardState);

  const balance = useBalanceSWR(chain, { suspense: true });

  const totalAmount = useMemo(() => {
    if (!balance.data) {
      return '0';
    }

    return String(balance.data.chain_stats.funded_txo_sum - balance.data.chain_stats.spent_txo_sum - balance.data.mempool_stats.spent_txo_sum);
  }, [balance.data]);

  const { imageURL, displayDenom, coinGeckoId, decimals, chainName } = chain;

  const price = useMemo(
    () => (coinGeckoId && coinGeckoData?.[coinGeckoId]?.[extensionStorage.currency]) || 0,
    [coinGeckoData, coinGeckoId, extensionStorage.currency],
  );

  useEffect(() => {
    setDashboard((prev) => ({
      [currentAccount.id]: {
        ...prev?.[currentAccount.id],
        [chain.id]: times(toDisplayDenomAmount(totalAmount, decimals), price) || '0',
      },
    }));
  }, [chain.id, currentAccount.id, decimals, price, setDashboard, totalAmount]);

  useEffect(
    () => () => {
      setDashboard((prev) => ({
        [currentAccount.id]: {
          ...prev?.[currentAccount.id],
          [chain.id]: '0',
        },
      }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleOnClick = () => {
    void setCurrentChain(chain);
    navigate('/wallet');
  };

  return (
    <ChainItem
      onClick={handleOnClick}
      chainName={chainName}
      decimals={decimals}
      coinGeckoId={coinGeckoId}
      amount={totalAmount}
      displayDenom={displayDenom}
      imageURL={imageURL}
    />
  );
}

export function BitcoinChainItemSkeleton({ chain }: BitcoinChainItemProps) {
  const { setCurrentChain } = useCurrentChain();
  const { navigate } = useNavigate();

  const handleOnClick = () => {
    void setCurrentChain(chain);
    navigate('/wallet');
  };

  const { chainName, imageURL } = chain;
  return <ChainItemSkeleton chainName={chainName} imageURL={imageURL} onClick={handleOnClick} />;
}

export function BitcoinChainItemError({ chain, resetErrorBoundary }: BitcoinChainItemProps & FallbackProps) {
  useBalanceSWR(chain);

  const { setCurrentChain } = useCurrentChain();
  const { navigate } = useNavigate();

  const handleOnClick = () => {
    void setCurrentChain(chain);
    navigate('/wallet');
  };

  const { imageURL, chainName } = chain;

  return <ChainItemError onClick={handleOnClick} chainName={chainName} imageURL={imageURL} onClickRetry={() => resetErrorBoundary()} />;
}

export function BitcoinChainItemLedgerCheck({ chain, children }: BitcoinChainItemProps & { children: JSX.Element }) {
  const { currentAccount } = useCurrentAccount();

  const { chainName, imageURL } = chain;

  if (currentAccount.type === 'LEDGER') {
    return <ChainItemLedgerCheck chainName={chainName} imageURL={imageURL} isSupported={false} />;
  }

  return children;
}
