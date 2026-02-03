import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import CoinWithMarketTrendButton from '@/components/CoinWithMarketTrendButton';
import { VirtualizedList } from '@/components/common/VirtualizedList';
import EmptyAsset from '@/components/EmptyAsset';
import type { PortfolioCoinItem } from '@/pages/-entry';
import { Route as CoinDetail } from '@/pages/coin-detail/$coinId';
import { Route as CoinOverview } from '@/pages/coin-overview/$coinId';
import { isTestnetChain } from '@/utils/chain';
import { gt } from '@/utils/numbers';
import { getCoinId } from '@/utils/queryParamGenerator';

import { CoinButtonWrapper, EmptyAssetContainer } from './styled';
import SkeletonCoinList from '../SkeletonCoinList';

import NoListIcon from '@/assets/images/icons/NoList70.svg';

type CryptoListSectionProps = {
  assets: PortfolioCoinItem[];
  isLoading: boolean;
};

function CryptoListSection({ assets, isLoading }: CryptoListSectionProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const processedAssets = useMemo(
    () =>
      assets.map((coin) => ({
        ...coin,
        isGroupToken: gt(coin.counts || '0', '1'),
        resolvedSymbol: coin.asset.symbol + (isTestnetChain(coin.chain.id) ? ' (Testnet)' : ''),
      })),
    [assets],
  );

  const handleCoinClick = useCallback(
    (coin: PortfolioCoinItem) => {
      const isGroupToken = gt(coin.counts || '0', '1');
      const destinationRoute = isGroupToken ? CoinOverview.to : CoinDetail.to;

      navigate({
        to: destinationRoute,
        params: {
          coinId: getCoinId(coin.asset),
        },
      });
    },
    [navigate],
  );

  if (isLoading) {
    return (
      <CoinButtonWrapper>
        <SkeletonCoinList />
      </CoinButtonWrapper>
    );
  }

  if (assets.length === 0) {
    return (
      <CoinButtonWrapper>
        <EmptyAssetContainer>
          <EmptyAsset icon={<NoListIcon />} title={t('pages.index.noTokens')} subTitle={t('pages.index.noTokensDescription')} />
        </EmptyAssetContainer>
      </CoinButtonWrapper>
    );
  }

  return (
    <CoinButtonWrapper>
      <VirtualizedList
        items={processedAssets}
        estimateSize={() => 60}
        renderItem={(coin, virtualItem) => (
          <CoinWithMarketTrendButton
            key={coin.uniqueCoinId + virtualItem.index}
            onClick={() => handleCoinClick(coin)}
            fetchStatus={coin.fetchStatus?.balance}
            displayAmount={coin.totalDisplayAmount || '0'}
            symbol={coin.resolvedSymbol}
            coinGeckoId={coin.asset.coinGeckoId}
            coinImageProps={{
              imageURL: coin.asset.image,
              isAggregatedCoin: coin.isGroupToken,
              badgeImageURL: coin.isGroupToken ? undefined : coin.chain.image || undefined,
            }}
          />
        )}
        overscan={5}
      />
    </CoinButtonWrapper>
  );
}

export default memo(CryptoListSection);
