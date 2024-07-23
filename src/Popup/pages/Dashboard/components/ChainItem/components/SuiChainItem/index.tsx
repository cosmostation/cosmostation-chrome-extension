import { useEffect, useMemo } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { useSetRecoilState } from 'recoil';

import { DEVNET } from '~/constants/chain/sui/network/devnet';
import { TESTNET } from '~/constants/chain/sui/network/testnet';
import { LEDGER_SUPPORT_COIN_TYPE } from '~/constants/ledger';
import { SUI_COIN } from '~/constants/sui';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useAmountSWR } from '~/Popup/hooks/SWR/sui/useAmountSWR';
import { useTokenBalanceObjectsSWR } from '~/Popup/hooks/SWR/sui/useTokenBalanceObjectsSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import ChainItem, { ChainItemError, ChainItemLedgerCheck, ChainItemSkeleton } from '~/Popup/pages/Dashboard/components/ChainItem';
import { dashboardState } from '~/Popup/recoils/dashboard';
import { plus, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { debouncedOpenTab } from '~/Popup/utils/extensionTabs';
import type { SuiChain, SuiNetwork } from '~/types/chain';

type SuiChainItemProps = {
  chain: SuiChain;
  network: SuiNetwork;
};

export default function SuiChainItem({ chain, network }: SuiChainItemProps) {
  const { extensionStorage } = useExtensionStorage();
  const { currentAccount } = useCurrentAccount();
  const { data: coinGeckoData } = useCoinGeckoPriceSWR();
  const { setCurrentSuiNetwork } = useCurrentSuiNetwork();
  const { networkName, decimals, coinGeckoId, imageURL } = network;

  const accounts = useAccounts(true);

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '',
    [accounts?.data, chain.id, currentAccount.id],
  );

  const { setCurrentChain } = useCurrentChain();
  const { navigate } = useNavigate();

  const setDashboard = useSetRecoilState(dashboardState);

  const { totalAmount } = useAmountSWR({ address: currentAddress, network });

  const { tokenBalanceObjects } = useTokenBalanceObjectsSWR({ address: currentAddress, network });

  const totalCoinAssetsValue = useMemo(() => {
    if ([TESTNET.id, DEVNET.id].includes(network.id)) {
      return '0';
    }

    const coinValue =
      times(toDisplayDenomAmount(totalAmount, decimals), (coinGeckoId && coinGeckoData?.[coinGeckoId]?.[extensionStorage.currency]) || 0) || '0';

    const tokenList = tokenBalanceObjects.filter((item) => item.coinType !== SUI_COIN);

    const tokensValue = tokenList.reduce((acc, token) => {
      const tokenBaseAmount = token.balance;

      const tokenValue = token.decimals
        ? times(
            toDisplayDenomAmount(tokenBaseAmount, token.decimals),
            (token.coinGeckoId && coinGeckoData?.[token.coinGeckoId]?.[extensionStorage.currency]) || 0,
          )
        : '0';

      return plus(acc, tokenValue);
    }, '0');

    return plus(coinValue, tokensValue);
  }, [coinGeckoData, coinGeckoId, decimals, extensionStorage.currency, network.id, tokenBalanceObjects, totalAmount]);

  useEffect(() => {
    setDashboard((prev) => ({
      [currentAccount.id]: {
        ...prev?.[currentAccount.id],
        [network.id]: totalCoinAssetsValue,
      },
    }));
  }, [currentAccount.id, network.id, setDashboard, totalCoinAssetsValue]);

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
    void setCurrentSuiNetwork(network);
    navigate('/wallet');
  };

  return <ChainItem onClick={handleOnClick} chainName={networkName} totalValue={totalCoinAssetsValue} imageURL={imageURL} />;
}

export function SuiChainItemSkeleton({ chain, network }: SuiChainItemProps) {
  const { setCurrentChain } = useCurrentChain();
  const { setCurrentSuiNetwork } = useCurrentSuiNetwork();
  const { navigate } = useNavigate();

  const handleOnClick = () => {
    void setCurrentChain(chain);
    void setCurrentSuiNetwork(network);
    navigate('/wallet');
  };

  const { networkName, imageURL } = network;
  return <ChainItemSkeleton chainName={networkName} imageURL={imageURL} onClick={handleOnClick} />;
}

export function SuiChainItemError({ chain, network, resetErrorBoundary }: SuiChainItemProps & FallbackProps) {
  useTokenBalanceObjectsSWR({});

  const { setCurrentSuiNetwork } = useCurrentSuiNetwork();

  const { setCurrentChain } = useCurrentChain();

  const { navigate } = useNavigate();

  const handleOnClick = () => {
    void setCurrentChain(chain);
    void setCurrentSuiNetwork(network);
    navigate('/wallet');
  };

  const { imageURL, networkName } = network;

  return <ChainItemError onClick={handleOnClick} chainName={networkName} imageURL={imageURL} onClickRetry={() => resetErrorBoundary()} />;
}

export function SuiChainItemLedgerCheck({ chain, network, children }: SuiChainItemProps & { children: JSX.Element }) {
  const { currentAccount } = useCurrentAccount();

  const { enQueue } = useCurrentQueue();

  const handleOnClick = async () => {
    await enQueue({
      messageId: '',
      origin: '',
      channel: 'inApp',
      message: {
        method: 'sui_connect',
        params: [],
      },
    });

    await debouncedOpenTab();
  };

  const { networkName, imageURL } = network;

  if (currentAccount.type === 'LEDGER' && !currentAccount.suiPublicKey && chain.bip44.coinType === LEDGER_SUPPORT_COIN_TYPE.SUI) {
    return <ChainItemLedgerCheck chainName={networkName} imageURL={imageURL} onClick={handleOnClick} isSupported />;
  }

  if (currentAccount.type === 'LEDGER' && chain.bip44.coinType !== LEDGER_SUPPORT_COIN_TYPE.SUI) {
    return <ChainItemLedgerCheck chainName={networkName} imageURL={imageURL} isSupported={false} />;
  }

  return children;
}
