import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputAdornment, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import CoinWithMarketTrendButton from '@/components/CoinWithMarketTrendButton';
import Carousel from '@/components/common/Carousel';
import CheckBoxTextButton from '@/components/common/CheckBoxTextButton';
import IconTextButton from '@/components/common/IconTextButton';
import { Tab, Tabs } from '@/components/common/Tab';
import PortFolio from '@/components/MainBox/Portfolio';
import SortBottomSheet from '@/components/SortBottomSheet';
import { DASHBOARD_COIN_SORT_KEY } from '@/constants/sortKey';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useGroupAccountAssets } from '@/hooks/useGroupAccountAssets';
import { Route as CoinDetail } from '@/pages/coin-detail/$coinId';
import { Route as CoinOverview } from '@/pages/coin-overview/$coinId';
import { Route as ManageAssets } from '@/pages/manage-assets/visibility/assets';
import type { DashboardCoinSortKeyType } from '@/types/sortKey';
import { gt, gte, minus, times } from '@/utils/numbers';
import { getCoinId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  AdCarouselContainer,
  CarouselImg,
  CoinButtonWrapper,
  Container,
  FilterContaienr,
  FilterIconButton,
  ManageCryptoContainer,
  MarginLeftTypography,
  MarginTopTypography,
  StickyTabContainer,
  StickyTabPanelContentsContainer,
  StyledInput,
  StyledTabPanel,
} from './-styled';

import FilterSettingIcon from '@/assets/images/icons/FilterSetting20.svg';
import PlusIcon from '@/assets/images/icons/Plus12.svg';
import SearchIcon from '@/assets/images/icons/Search18.svg';
import StakeIcon from '@/assets/images/icons/Stake22.svg';

import testAdImg from '@/assets/images/test-ad.png';

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const { dashboardCoinSortKey, currency, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const [search, setsearch] = useState('');
  const [isOpenSortBottomSheet, setIsOpenSortBottomSheet] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [isHideSmallValue, setIsHideSmallValue] = useState(false);

  const tabLabels = ['Crypto', 'NFTs'];

  const { data: groupAccountAssets } = useGroupAccountAssets();

  const filteredAssetsBySearch = useMemo(() => {
    const baesCoinList = [...(groupAccountAssets?.groupAccountAssets || []), ...(groupAccountAssets?.singleAccountAssets || [])];

    const computedAssetValues = baesCoinList.map((item) => {
      const displayAmount = item.totalDisplayAmount || '0';

      const coinPrice = (item.asset.coinGeckoId && coinGeckoPrice?.[item.asset.coinGeckoId]?.[currency]) || 0;

      const value = times(displayAmount, coinPrice);

      return {
        ...item,
        value,
      };
    });

    const hideSmallValueAssets = (() => {
      if (isHideSmallValue) {
        return computedAssetValues.filter((coin) => {
          return gte(coin.value, '0.001');
        });
      }

      return computedAssetValues;
    })();

    const sortedAssets = hideSmallValueAssets.sort((a, b) => {
      if (dashboardCoinSortKey === DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER) {
        return Number(minus(b.value, a.value));
      }

      if (dashboardCoinSortKey === DASHBOARD_COIN_SORT_KEY.ALPHABETICAL_ASC) {
        return a.asset.symbol.localeCompare(b.asset.symbol);
      }

      return 0;
    });

    if (search.length > 1) {
      return (
        sortedAssets.filter((asset) => {
          const condition = [asset.asset.symbol, asset.asset.id];

          return condition.some((item) => item.toLowerCase().indexOf(search.toLowerCase()) > -1);
        }) || []
      );
    }
    return sortedAssets;
  }, [
    coinGeckoPrice,
    currency,
    dashboardCoinSortKey,
    groupAccountAssets?.groupAccountAssets,
    groupAccountAssets?.singleAccountAssets,
    isHideSmallValue,
    search,
  ]);

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  };

  return (
    <BaseBody>
      <EdgeAligner>
        <Container>
          <PortFolio />

          <StickyTabContainer>
            <Tabs value={tabValue} onChange={handleChange} variant="fullWidth">
              {tabLabels.map((item) => (
                <Tab key={item} label={item} />
              ))}
            </Tabs>
          </StickyTabContainer>
          <StyledTabPanel value={tabValue} index={0}>
            <StickyTabPanelContentsContainer>
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
                    setsearch(event.currentTarget.value);
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
              <AdCarouselContainer>
                <Carousel>
                  <CarouselImg src={testAdImg} />
                  <CarouselImg src={testAdImg} />
                </Carousel>
              </AdCarouselContainer>
              <ManageCryptoContainer>
                <CheckBoxTextButton
                  onClick={() => {
                    setIsHideSmallValue(!isHideSmallValue);
                  }}
                >
                  <Typography variant="b3_R">{t('pages.index.hideSmallBalance')}</Typography>
                </CheckBoxTextButton>
                <IconTextButton
                  onClick={() => [
                    navigate({
                      to: ManageAssets.to,
                    }),
                  ]}
                  leadingIcon={<PlusIcon />}
                >
                  <MarginLeftTypography variant="b3_M">{t('pages.index.manageCrypto')}</MarginLeftTypography>
                </IconTextButton>
              </ManageCryptoContainer>
            </StickyTabPanelContentsContainer>
            {/* FIXME 스크롤이 아래 인 상태에서 클릭 시 스크롤이 그대로 유지되어 아래에 있는 문제 해결 필요 */}
            <CoinButtonWrapper>
              {filteredAssetsBySearch.map((coin) => {
                const destinationRoute = coin.counts && gt(coin.counts, '1') ? CoinOverview.to : CoinDetail.to;

                return (
                  <CoinWithMarketTrendButton
                    key={getCoinId(coin.asset)}
                    onClick={() => {
                      navigate({
                        to: destinationRoute,
                        params: {
                          coinId: getCoinId(coin.asset),
                        },
                      });
                    }}
                    displayAmount={coin.totalDisplayAmount || '0'}
                    symbol={coin.asset.symbol}
                    coinGeckoId={coin.asset.coinGeckoId}
                    coinImageProps={{
                      imageURL: coin.asset.image,
                      isAggregatedCoin: gt(coin.counts || '0', '1'),
                    }}
                  />
                );
              })}
            </CoinButtonWrapper>
          </StyledTabPanel>
          <StyledTabPanel value={tabValue} index={1}>
            <IconTextButton leadingIcon={<StakeIcon />} direction="vertical">
              {/* TODO i18n 적용 필요 */}
              <MarginTopTypography variant="b3_M">Setting</MarginTopTypography>
            </IconTextButton>
          </StyledTabPanel>
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
            currentSortOption={dashboardCoinSortKey}
            open={isOpenSortBottomSheet}
            onClose={() => setIsOpenSortBottomSheet(false)}
            onSelectSortOption={(val) => {
              updateExtensionStorageStore('dashboardCoinSortKey', val as DashboardCoinSortKeyType);
            }}
          />
        </Container>
      </EdgeAligner>
    </BaseBody>
  );
}
