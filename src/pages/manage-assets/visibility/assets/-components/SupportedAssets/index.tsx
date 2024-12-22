import { useMemo } from 'react';

import CoinWithChainNameButton from '@/components/CoinWithChainNameButton';
import { DASHBOARD_COIN_SORT_KEY } from '@/constants/sortKey';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useCurrentHiddenAssetIds } from '@/hooks/useCurrentHiddenAssetIds';
import type { CommonSortKeyType } from '@/types/sortKey';
import { minus, times, toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId, getCoinIdWithManual } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { IconContainer } from './styled';

import AddIcon from '@/assets/images/icons/Add20.svg';
import RemoveIcon from '@/assets/images/icons/Remove20.svg';

type SupportedAssetsProps = {
  currentSearch: string;
  currentSelectedChainId: string;
  currentSortOption: CommonSortKeyType;
};

export default function SupportedAssets({ currentSearch, currentSelectedChainId, currentSortOption }: SupportedAssetsProps) {
  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const { currency } = useExtensionStorageStore((state) => state);
  const { data: currentHiddenAssetIds } = useCurrentHiddenAssetIds();
  // TODO 별도로 preferAccountType별로 필터링 한 리스트를 베이스로 사용해야함. 아래 훅에 넣으면 다른데에서 쓸때 문제발생.
  const { data: currentAccountAllAssets } = useAccountAllAssets();

  const hiddenAssetCoinIds = currentHiddenAssetIds?.map((item) => getCoinIdWithManual(item));

  const chainList = useMemo(
    () => currentAccountAllAssets?.cosmosAccountAssets?.map((item) => item.chain) || [],
    [currentAccountAllAssets?.cosmosAccountAssets],
  );

  const currentSelectedChain = chainList.find((item) => item.id === currentSelectedChainId);

  const isShowAssetId = !!currentSelectedChain || !!currentSearch;

  // TODO 훅으로 전환
  const computedAssetValues = useMemo(() => {
    const baesCoinList = currentAccountAllAssets?.cosmosAccountAssets || [];

    return (
      baesCoinList?.map((item) => {
        const displayAmount = toDisplayDenomAmount(item.balance, item.asset.decimals);

        const chainPrice = (item.asset.coinGeckoId && coinGeckoPrice?.[item.asset.coinGeckoId]?.[currency]) || 0;

        const value = times(displayAmount, chainPrice);

        return {
          ...item,
          value,
        };
      }) || []
    );
  }, [coinGeckoPrice, currency, currentAccountAllAssets?.cosmosAccountAssets]);

  const sortedAssets = computedAssetValues.sort((a, b) => {
    if (currentSortOption === DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER) {
      return Number(minus(b.value, a.value));
    }

    if (currentSortOption === DASHBOARD_COIN_SORT_KEY.ALPHABETICAL_ASC) {
      return a.asset.symbol.localeCompare(b.asset.symbol);
    }

    return 0;
  });

  // FIXME 키 중복 이슈가 발생. 테라의 assets_2에 cw20에 포함되는 토큰이 중복으로 들어가 있어서 문제발생.
  // TODO 내부적으로 코인키가 중복 필터링 로직 넣어야할 듯.\
  // TODO 에셋이 2000개가 넘어가서 렌더링이 느림. 렌더링 최적화 필요.
  const filteredCoinList = useMemo(() => {
    const filteredAssetsByChain = currentSelectedChain
      ? sortedAssets.filter((item) => currentSelectedChain?.id === item.chain.id && currentSelectedChain.chainId === item.chain.chainId) || []
      : sortedAssets || [];

    const filteredAssetsBySearch = (() => {
      if (currentSearch.length > 1) {
        return (
          filteredAssetsByChain.filter((asset) => {
            const condition = [asset.asset.symbol, asset.asset.id];

            return condition.some((item) => item.toLowerCase().indexOf(currentSearch.toLowerCase()) > -1);
          }) || []
        );
      }
      return filteredAssetsByChain;
    })();

    return filteredAssetsBySearch;
  }, [currentSearch, currentSelectedChain, sortedAssets]);

  return (
    <>
      {filteredCoinList?.map((coin) => {
        const isHiddenAsset = hiddenAssetCoinIds?.includes(getCoinId(coin.asset));

        return (
          <CoinWithChainNameButton
            key={getCoinId(coin.asset).concat(coin.chain.id).concat(String(coin.chain.chainId))}
            baseAmount={coin.balance}
            symbol={coin.asset.symbol}
            chainName={coin.chain.name}
            assetId={coin.asset.id}
            decimals={coin.asset.decimals}
            coinGeckoId={coin.asset.coinGeckoId}
            displayAssetId={isShowAssetId}
            coinImageProps={{
              imageURL: coin.asset.image,
              badgeImageURL: coin.asset.type === 'native' ? '' : coin.chain.image || '',
            }}
            rightComponent={
              isHiddenAsset ? (
                <IconContainer>
                  <AddIcon />
                </IconContainer>
              ) : (
                <IconContainer>
                  <RemoveIcon />
                </IconContainer>
              )
            }
            onClick={() => {
              console.log(getCoinId(coin.asset));
            }}
          />
        );
      })}
    </>
  );
}
