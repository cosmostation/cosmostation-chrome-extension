import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputAdornment, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import AllNetworkButton from '@/components/AllNetworkButton';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import CoinWithChainNameButton from '@/components/CoinWithChainNameButton';
import CoinOverViewBox from '@/components/MainBox/CoinOverviewBox';
import SortBottomSheet from '@/components/SortBottomSheet';
import { DASHBOARD_COIN_SORT_KEY } from '@/constants/sortKey';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useGroupAccountAssets } from '@/hooks/useGroupAccountAssets';
import { Route as CoinDetail } from '@/pages/coin-detail/$coinId';
import type { UniqueChainId } from '@/types/chain';
import type { CommonSortKeyType } from '@/types/sortKey';
import { minus, times, toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId, isMatchingUniqueChainId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { CoinButtonWrapper, Container, FilterContaienr, FilterIconButton, StickyContentsContainer, StyledInput } from './-styled';

import FilterSettingIcon from '@/assets/images/icons/FilterSetting20.svg';
import SearchIcon from '@/assets/images/icons/Search18.svg';

type EntryProps = {
  coinId: string;
};

export default function Entry({ coinId }: EntryProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const { currency } = useExtensionStorageStore((state) => state);

  const [search, setSearch] = useState('');
  const [isOpenSortBottomSheet, setIsOpenSortBottomSheet] = useState(false);
  const [sortOption, setSortOption] = useState<CommonSortKeyType>(DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER);

  const [currentSelectedChainId, setCurrentSelectedChainId] = useState<UniqueChainId | undefined>();

  const { data: groupAccountAssets } = useGroupAccountAssets();

  const baseCoinList = useMemo(() => {
    const selectedCoin = groupAccountAssets?.groupAccountAssets.find((item) => getCoinId(item.asset) === coinId);

    const selectedGroupMap = groupAccountAssets?.groupMap[selectedCoin?.asset.coinGeckoId || ''];
    return selectedGroupMap;
  }, [coinId, groupAccountAssets?.groupAccountAssets, groupAccountAssets?.groupMap]);

  const filteredAssetsBySearch = useMemo(() => {
    const filteredByChain = baseCoinList?.filter((item) => {
      if (currentSelectedChainId) {
        return isMatchingUniqueChainId(item.chain, currentSelectedChainId);
      }
      return true;
    });

    const computedAssetValues = filteredByChain?.map((item) => {
      const displayAmount = toDisplayDenomAmount(item.balance || '0', item.asset.decimals);

      const coinPrice = (item.asset.coinGeckoId && coinGeckoPrice?.[item.asset.coinGeckoId]?.[currency]) || 0;

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

    if (search.length > 1) {
      return (
        sortedAssets?.filter((asset) => {
          const condition = [asset.asset.symbol, asset.asset.id];

          return condition.some((item) => item.toLowerCase().indexOf(search.toLowerCase()) > -1);
        }) || []
      );
    }
    return sortedAssets;
  }, [baseCoinList, coinGeckoPrice, currency, currentSelectedChainId, search, sortOption]);

  const chainList = baseCoinList?.map((item) => item.chain);
  return (
    <BaseBody>
      <EdgeAligner>
        <Container>
          <CoinOverViewBox coinId={coinId} />

          <StickyContentsContainer>
            <FilterContaienr>
              <StyledInput
                startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                }
                placeholder={'Search'}
                value={search}
                onChange={(event) => {
                  setSearch(event.currentTarget.value);
                }}
              />
              <FilterIconButton
                onClick={() => {
                  setIsOpenSortBottomSheet(true);
                }}
              >
                <FilterSettingIcon />
              </FilterIconButton>
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
                  coinImageProps={{
                    imageURL: item.asset.image,
                    badgeImageURL: item.asset.type === 'native' ? '' : item.chain.image || '',
                  }}
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
            // currentSortOption={dashboardCoinSortKey}
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
