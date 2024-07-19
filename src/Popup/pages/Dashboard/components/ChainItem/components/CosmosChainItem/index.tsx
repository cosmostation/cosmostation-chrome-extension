import { useEffect, useMemo } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { useSetRecoilState } from 'recoil';

import { LEDGER_SUPPORT_COIN_TYPE } from '~/constants/ledger';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useAmountSWR } from '~/Popup/hooks/SWR/cosmos/useAmountSWR';
import { useCoinListSWR } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import { useTokensBalanceSWR } from '~/Popup/hooks/SWR/cosmos/useTokensBalanceSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useCurrentCosmosTokens } from '~/Popup/hooks/useCurrent/useCurrentCosmosTokens';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import ChainItem, { ChainItemError, ChainItemLedgerCheck, ChainItemSkeleton, ChainItemTerminated } from '~/Popup/pages/Dashboard/components/ChainItem';
import { dashboardState } from '~/Popup/recoils/dashboard';
import { plus, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { debouncedOpenTab } from '~/Popup/utils/extensionTabs';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { CosmosChain } from '~/types/chain';

type CosmosChainItemProps = {
  chain: CosmosChain;
};

export default function CosmosChainItem({ chain }: CosmosChainItemProps) {
  const { extensionStorage } = useExtensionStorage();
  const setDashboard = useSetRecoilState(dashboardState);
  const accounts = useAccounts();
  const { currentAccount } = useCurrentAccount();
  const { data } = useCoinGeckoPriceSWR();
  const { coins, ibcCoins } = useCoinListSWR(chain);
  const { currentCosmosTokens } = useCurrentCosmosTokens(chain);
  const { totalAmount } = useAmountSWR(chain, true);
  const { chainName, decimals, displayDenom, coinGeckoId, imageURL } = chain;

  const { setCurrentChain } = useCurrentChain();
  const { navigate } = useNavigate();

  const address = useMemo(
    () => accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '',
    [accounts.data, chain.id, currentAccount.id],
  );

  const cosmosTokensBalance = useTokensBalanceSWR({ chain, contractAddresses: currentCosmosTokens.map((item) => item.address), address });

  const totalCoinAssetsValue = useMemo(() => {
    const coinValue = times(toDisplayDenomAmount(totalAmount, decimals), (coinGeckoId && data?.[coinGeckoId]?.[extensionStorage.currency]) || 0);

    const nativeCoinsValue = coins.reduce((acc: string, coin) => {
      const nativeCoinValue = times(
        toDisplayDenomAmount(coin.availableAmount, coin.decimals),
        (coin.coinGeckoId && data?.[coin.coinGeckoId]?.[extensionStorage.currency]) || 0,
      );

      return plus(acc, nativeCoinValue);
    }, '0');

    const ibcCoinsValue = ibcCoins.reduce((acc: string, ibcCoin) => {
      const ibcCoinValue = times(
        toDisplayDenomAmount(ibcCoin.availableAmount, ibcCoin.decimals),
        (ibcCoin.coinGeckoId && data?.[ibcCoin.coinGeckoId]?.[extensionStorage.currency]) || 0,
      );

      return plus(acc, ibcCoinValue);
    }, '0');

    const tokensValue = currentCosmosTokens.reduce((acc: string, token) => {
      const tokenBaseAmount = cosmosTokensBalance.data.find((item) => isEqualsIgnoringCase(item.contractAddress, token.address))?.balance || '0';

      const tokenValue = times(
        toDisplayDenomAmount(tokenBaseAmount, token.decimals),
        (token.coinGeckoId && data?.[token.coinGeckoId]?.[extensionStorage.currency]) || 0,
      );
      return plus(acc, tokenValue);
    }, '0');

    const summedValue = [coinValue, nativeCoinsValue, ibcCoinsValue, tokensValue].reduce((acc, value) => plus(acc, value), '0');

    return summedValue;
  }, [coinGeckoId, coins, cosmosTokensBalance.data, currentCosmosTokens, data, decimals, extensionStorage.currency, ibcCoins, totalAmount]);

  useEffect(() => {
    setDashboard((prev) => ({
      [currentAccount.id]: {
        ...prev?.[currentAccount.id],
        [chain.id]: totalCoinAssetsValue,
      },
    }));
  }, [chain.id, currentAccount.id, setDashboard, totalCoinAssetsValue]);

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
      amount={totalAmount}
      totalValue={totalCoinAssetsValue}
      decimals={decimals}
      displayDenom={displayDenom}
      coinGeckoId={coinGeckoId}
      imageURL={imageURL}
    />
  );
}

export function CosmosChainItemSkeleton({ chain }: CosmosChainItemProps) {
  const { setCurrentChain } = useCurrentChain();
  const { navigate } = useNavigate();

  const handleOnClick = () => {
    void setCurrentChain(chain);
    navigate('/wallet');
  };

  const { chainName, imageURL } = chain;

  return <ChainItemSkeleton onClick={handleOnClick} chainName={chainName} imageURL={imageURL} />;
}

export function CosmosChainItemError({ chain, resetErrorBoundary }: CosmosChainItemProps & FallbackProps) {
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

export function CosmosChainItemTerminated({ chain }: CosmosChainItemProps) {
  const { setCurrentChain } = useCurrentChain();
  const { navigate } = useNavigate();

  const handleOnClick = () => {
    void setCurrentChain(chain);
    navigate('/wallet');
  };

  const { chainName, imageURL } = chain;

  return <ChainItemTerminated onClick={handleOnClick} chainName={chainName} imageURL={imageURL} />;
}

export function CosmosChainLedgerCheck({ chain, children }: CosmosChainItemProps & { children: JSX.Element }) {
  const { enQueue } = useCurrentQueue();

  const { currentAccount } = useCurrentAccount();

  const handleOnClick = async () => {
    await enQueue({
      messageId: '',
      origin: '',
      channel: 'inApp',
      message: {
        method: 'cos_requestAccount',
        params: {
          chainName: chain.chainName,
        },
      },
    });

    await debouncedOpenTab();
  };

  const { chainName, imageURL } = chain;

  if (currentAccount.type === 'LEDGER') {
    if (
      (!currentAccount.cosmosPublicKey && chain.bip44.coinType === LEDGER_SUPPORT_COIN_TYPE.COSMOS) ||
      (!currentAccount.mediblocPublicKey && chain.bip44.coinType === LEDGER_SUPPORT_COIN_TYPE.MEDIBLOC) ||
      (!currentAccount.cryptoOrgPublicKey && chain.bip44.coinType === LEDGER_SUPPORT_COIN_TYPE.CRONOS_POS)
    ) {
      return <ChainItemLedgerCheck chainName={chainName} imageURL={imageURL} onClick={handleOnClick} isSupported />;
    }

    if (![LEDGER_SUPPORT_COIN_TYPE.COSMOS, LEDGER_SUPPORT_COIN_TYPE.MEDIBLOC, LEDGER_SUPPORT_COIN_TYPE.CRONOS_POS].includes(chain.bip44.coinType)) {
      return <ChainItemLedgerCheck chainName={chainName} imageURL={imageURL} isSupported={false} />;
    }
  }

  return children;
}
