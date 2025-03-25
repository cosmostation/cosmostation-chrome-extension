import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import AllNetworkButton from '@/components/AllNetworkButton';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import CoinWithChainNameButton from '@/components/CoinWithChainNameButton';
import IntersectionObserver from '@/components/common/IntersectionObserver';
import CoinOverViewBox from '@/components/MainBox/CoinOverviewBox';
import Search from '@/components/Search';
import SortBottomSheet from '@/components/SortBottomSheet';
import { DASHBOARD_COIN_SORT_KEY } from '@/constants/sortKey';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useGroupAccountAssets } from '@/hooks/useGroupAccountAssets';
import { Route as CoinDetail } from '@/pages/coin-detail/$coinId';
import type { UniqueChainId } from '@/types/chain';
import type { CommonSortKeyType } from '@/types/sortKey';
import { getFilteredAssetsByChainId, getfilteredChainsByChainId } from '@/utils/asset';
import { minus, times, toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId, isMatchingUniqueChainId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { CoinButtonWrapper, Container, FilterContaienr, StickyContentsContainer } from './-styled';

type EntryProps = {
  coinId: string;
};

export default function Entry({ coinId }: EntryProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);

  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);

  const isDebouncing = !!search && isPending();

  const [viewLimit, setViewLimit] = useState(30);

  const [isOpenSortBottomSheet, setIsOpenSortBottomSheet] = useState(false);
  const [sortOption, setSortOption] = useState<CommonSortKeyType>(DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER);

  const [currentSelectedChainId, setCurrentSelectedChainId] = useState<UniqueChainId | undefined>();

  const { groupAccountAssets } = useGroupAccountAssets();

  const baseCoinList = useMemo(() => {
    const selectedCoin = groupAccountAssets?.groupAccountAssets.find((item) => getCoinId(item.asset) === coinId);

    const selectedGroupMap = groupAccountAssets?.groupMap[selectedCoin?.asset.coinGeckoId || ''];
    return selectedGroupMap;
  }, [coinId, groupAccountAssets?.groupAccountAssets, groupAccountAssets?.groupMap]);

  const filteredAssetsBySearch = useMemo(() => {
    const filteredByChain = getFilteredAssetsByChainId(baseCoinList, currentSelectedChainId);

    const computedAssetValues = filteredByChain?.map((item) => {
      const displayAmount = toDisplayDenomAmount(item.balance || '0', item.asset.decimals);

      const coinPrice = (item.asset.coinGeckoId && coinGeckoPrice?.[item.asset.coinGeckoId]?.[userCurrencyPreference]) || 0;

      const value = times(displayAmount, coinPrice);

      return {
        ...item,
        value,
      };
    });

    const sortedAssets = computedAssetValues?.sort((a, b) => {
      if (sortOption === DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER) {
        return Number(minus(b.value, a.value));
      }

      if (sortOption === DASHBOARD_COIN_SORT_KEY.ALPHABETICAL_ASC) {
        return a.asset.symbol.localeCompare(b.asset.symbol);
      }

      return 0;
    });

    if (!!search && debouncedSearch.length > 1) {
      return (
        sortedAssets
          ?.filter((asset) => {
            const condition = [asset.asset.symbol, asset.asset.id];

            return condition.some((item) => item.toLowerCase().indexOf(search.toLowerCase()) > -1);
          })
          .slice(0, viewLimit) || []
      );
    }
    return sortedAssets?.slice(0, viewLimit) || [];
  }, [baseCoinList, coinGeckoPrice, userCurrencyPreference, currentSelectedChainId, debouncedSearch.length, search, sortOption, viewLimit]);

  const chainList = useMemo(() => getfilteredChainsByChainId(baseCoinList), [baseCoinList]);

  const currentSelectedChain = useMemo(
    () => chainList?.find((chain) => isMatchingUniqueChainId(chain, currentSelectedChainId)),
    [chainList, currentSelectedChainId],
  );

  const isShowAssetId = useMemo(() => !!currentSelectedChain || !!debouncedSearch, [currentSelectedChain, debouncedSearch]);

  return (
    <BaseBody>
      <EdgeAligner>
        <Container>
          <CoinOverViewBox coinId={coinId} />

          <StickyContentsContainer>
            <FilterContaienr>
              <Search
                value={search}
                onChange={(event) => {
                  setSearch(event.currentTarget.value);
                }}
                isPending={isDebouncing}
                placeholder={t('pages.coin-overview.$coinId.entry.search')}
                onClickFilter={() => {
                  setIsOpenSortBottomSheet(true);
                }}
                onClear={() => {
                  setSearch('');
                  setViewLimit(30);
                  cancel();
                }}
              />
            </FilterContaienr>

            <AllNetworkButton
              sizeVariant="medium"
              typoVarient="b2_M"
              chainList={chainList}
              currentChainId={currentSelectedChainId}
              selectChainOption={(chainId) => {
                setCurrentSelectedChainId(chainId);
              }}
            />
          </StickyContentsContainer>

          <CoinButtonWrapper>
            {filteredAssetsBySearch?.map((item) => {
              const displayAmount = toDisplayDenomAmount(item.balance || '0', item.asset.decimals);

              return (
                <CoinWithChainNameButton
                  key={getCoinId(item.asset)}
                  displayAmount={displayAmount || '0'}
                  symbol={item.asset.symbol}
                  chainName={item.chain.name}
                  coinGeckoId={item.asset.coinGeckoId}
                  assetId={item.asset.id}
                  coinImageProps={{
                    imageURL: item.asset.image,
                    badgeImageURL: item.asset.type === 'native' ? '' : item.chain.image || '',
                  }}
                  displayAssetId={isShowAssetId}
                  onClick={() => {
                    navigate({
                      to: CoinDetail.to,
                      params: {
                        coinId: getCoinId(item.asset),
                      },
                    });
                  }}
                />
              );
            })}
            {filteredAssetsBySearch?.length > viewLimit - 1 && (
              <IntersectionObserver
                onIntersect={() => {
                  setViewLimit((limit) => limit + 30);
                }}
              />
            )}
          </CoinButtonWrapper>

          <SortBottomSheet
            optionButtonProps={[
              {
                sortKey: DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER,
                children: <Typography variant="b2_M">{t('pages.index.valueHighOrder')}</Typography>,
              },
              {
                sortKey: DASHBOARD_COIN_SORT_KEY.ALPHABETICAL_ASC,
                children: <Typography variant="b2_M">{t('pages.index.alphabeticalAsc')}</Typography>,
              },
            ]}
            currentSortOption={sortOption}
            open={isOpenSortBottomSheet}
            onClose={() => setIsOpenSortBottomSheet(false)}
            onSelectSortOption={(val) => {
              setSortOption(val);
            }}
          />
        </Container>
      </EdgeAligner>
    </BaseBody>
  );
}
