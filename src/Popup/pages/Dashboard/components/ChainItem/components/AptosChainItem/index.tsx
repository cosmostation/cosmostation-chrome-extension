import { useEffect, useMemo } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { useSetRecoilState } from 'recoil';

import { APTOS_COIN } from '~/constants/aptos';
import { useAccountResourceSWR } from '~/Popup/hooks/SWR/aptos/useAccountResourceSWR';
import { useAssetsSWR } from '~/Popup/hooks/SWR/aptos/useAssetsSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentAptosNetwork } from '~/Popup/hooks/useCurrent/useCurrentAptosNetwork';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import ChainItem, { ChainItemError, ChainItemLedgerCheck, ChainItemSkeleton } from '~/Popup/pages/Dashboard/components/ChainItem';
import { dashboardState } from '~/Popup/recoils/dashboard';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import type { AptosChain, AptosNetwork } from '~/types/chain';

type AptosChainItemProps = {
  chain: AptosChain;
  network: AptosNetwork;
};

export default function AptosChainItem({ chain, network }: AptosChainItemProps) {
  const { extensionStorage } = useExtensionStorage();
  const { currentAccount } = useCurrentAccount();
  const { setCurrentAptosNetwork } = useCurrentAptosNetwork();
  const { setCurrentChain } = useCurrentChain();
  const { navigate } = useNavigate();
  const { data: coinGeckoData } = useCoinGeckoPriceSWR();

  const setDashboard = useSetRecoilState(dashboardState);

  const { data: aptosCoin } = useAccountResourceSWR({ resourceType: '0x1::coin::CoinStore', resourceTarget: APTOS_COIN, network }, { suspense: true });
  const { data: aptosInfo } = useAccountResourceSWR(
    { resourceType: '0x1::coin::CoinInfo', resourceTarget: APTOS_COIN, address: '0x1', network },
    { suspense: true },
  );

  const assets = useAssetsSWR(network);

  const asset = useMemo(() => assets.data.find((item) => item.address === APTOS_COIN), [assets.data]);

  const totalAmount = BigInt(aptosCoin?.data.coin.value || '0').toString();

  const decimals = useMemo(() => aptosInfo?.data.decimals || 0, [aptosInfo?.data.decimals]);

  const imageURL = useMemo(() => network.imageURL || asset?.image, [asset?.image, network.imageURL]);

  const displayDenom = useMemo(() => asset?.symbol || aptosInfo?.data.symbol || '', [aptosInfo?.data.symbol, asset?.symbol]);

  const { networkName } = network;

  const price = useMemo(
    () => (asset?.coinGeckoId && coinGeckoData?.[asset.coinGeckoId]?.[extensionStorage.currency]) || 0,
    [asset?.coinGeckoId, extensionStorage.currency, coinGeckoData],
  );

  useEffect(() => {
    setDashboard((prev) => ({
      [currentAccount.id]: {
        ...prev?.[currentAccount.id],
        [network.id]: times(toDisplayDenomAmount(totalAmount, decimals), price) || '0',
      },
    }));
  }, [currentAccount.id, decimals, network.id, price, setDashboard, totalAmount]);

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
    void setCurrentAptosNetwork(network);
    navigate('/wallet');
  };

  return (
    <ChainItem
      onClick={handleOnClick}
      chainName={networkName}
      decimals={decimals}
      coinGeckoId={asset?.coinGeckoId}
      amount={totalAmount}
      displayDenom={displayDenom}
      imageURL={imageURL}
    />
  );
}

export function AptosChainItemSkeleton({ chain, network }: AptosChainItemProps) {
  const { setCurrentChain } = useCurrentChain();
  const { setCurrentAptosNetwork } = useCurrentAptosNetwork();
  const { navigate } = useNavigate();

  const handleOnClick = () => {
    void setCurrentChain(chain);
    void setCurrentAptosNetwork(network);
    navigate('/wallet');
  };

  const assets = useAssetsSWR();

  const asset = useMemo(() => assets.data.find((item) => item.address === APTOS_COIN), [assets.data]);

  const imageURL = useMemo(() => network.imageURL || asset?.image, [asset?.image, network.imageURL]);

  const { networkName } = network;
  return <ChainItemSkeleton chainName={networkName} imageURL={imageURL} onClick={handleOnClick} />;
}

export function AptosChainItemError({ chain, network, resetErrorBoundary }: AptosChainItemProps & FallbackProps) {
  useAccountResourceSWR({ resourceType: '0x1::coin::CoinStore', resourceTarget: APTOS_COIN, network });
  useAccountResourceSWR({ resourceType: '0x1::coin::CoinInfo', resourceTarget: APTOS_COIN, address: '0x1', network });

  const { setCurrentChain } = useCurrentChain();
  const { setCurrentAptosNetwork } = useCurrentAptosNetwork();
  const { navigate } = useNavigate();

  const handleOnClick = () => {
    void setCurrentChain(chain);
    void setCurrentAptosNetwork(network);
    navigate('/wallet');
  };

  const { imageURL, networkName } = network;

  return <ChainItemError onClick={handleOnClick} chainName={networkName} imageURL={imageURL} onClickRetry={() => resetErrorBoundary()} />;
}

export function AptosChainItemLedgerCheck({ network, children }: Pick<AptosChainItemProps, 'network'> & { children: JSX.Element }) {
  const { currentAccount } = useCurrentAccount();

  const assets = useAssetsSWR();

  const asset = useMemo(() => assets.data.find((item) => item.address === APTOS_COIN), [assets.data]);

  const imageURL = useMemo(() => network.imageURL || asset?.image, [asset?.image, network.imageURL]);

  const { networkName } = network;

  if (currentAccount.type === 'LEDGER') {
    return <ChainItemLedgerCheck chainName={networkName} imageURL={imageURL} isSupported={false} />;
  }

  return children;
}
