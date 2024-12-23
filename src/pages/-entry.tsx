import { useState } from 'react';
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
import { useAccountAssets } from '@/hooks/useAccountAssets';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { Route as CoinDetail } from '@/pages/coin-detail/$coinId';
import { Route as ManageAssets } from '@/pages/manage-assets/visibility/assets';
import type { DashboardCoinSortKeyType } from '@/types/sortKey';
import { gte, times, toDisplayDenomAmount } from '@/utils/numbers';
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

  // NOTE 디비에 저장할 것.
  const [search, setsearch] = useState('');
  const [isOpenSortBottomSheet, setIsOpenSortBottomSheet] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [isHideSmallValue, setIsHideSmallValue] = useState(false);

  const tabLabels = ['Crypto', 'NFTs'];

  const { data: currentAccountAssets } = useAccountAssets();
  // const { data: groupAssets } = useGroupAssets();

  // const groupedAssets = useMemo(() => {
  //   // const sample = [
  //   //   {
  //   //     asset: {

  //   //     }
  //   //     isGroup: true,
  //   //     totalDisplayAmount: '100'
  //   //   }.{
  //   //     asset: {

  //   //     }
  //   //     isGroup: false,
  //   //     totalDisplayAmount: '100'
  //   //   }
  //   // ]

  //   // const a = coinList.reduce((acc :{asset: Asset}, cur) => {

  //   //   const asset = groupAssets?.groups[cur.asset.id];
  //   //   if (!asset) return acc;
  //   //   if(acc.)

  //   //   const totalDisplayAmount = cur.balance;
  //   //   return [...acc, { asset: asset[0], totalDisplayAmount }];
  //   // }, [])

  //   if (!groupAssets) return [];
  //   const aaa = Object.values(groupAssets?.groups).map((group) => {
  //     return group.map((asset) => {
  //       return {
  //         asset,
  //         isGroup: true,
  //         displayAmont: coinList.find((coin) => isSameCoin(coin.asset, asset))?.balance,
  //       };
  //     });
  //   });
  //   console.log('🚀 ~ aaa ~ aaa:', aaa);
  // }, [coinList, groupAssets]);

  const filteredAssetsBySearch = (() => {
    const baesCoinList = currentAccountAssets?.flatAccountAssets || [];

    const hideSmallValueAssets = (() => {
      if (isHideSmallValue) {
        return baesCoinList.filter((coin) => {
          const displayAmount = toDisplayDenomAmount(coin.balance, coin.asset.decimals);

          const chainPrice = (coin.asset.coinGeckoId && coinGeckoPrice?.[coin.asset.coinGeckoId]?.[currency]) || 0;

          const value = times(displayAmount, chainPrice);

          return gte(value, '0.001');
        });
      }

      return baesCoinList;
    })();

    if (search.length > 1) {
      return (
        hideSmallValueAssets.filter((asset) => {
          const condition = [asset.asset.symbol, asset.asset.id];

          return condition.some((item) => item.toLowerCase().indexOf(search.toLowerCase()) > -1);
        }) || []
      );
    }
    return hideSmallValueAssets;
  })();

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
                return (
                  <CoinWithMarketTrendButton
                    key={getCoinId(coin.asset)}
                    onClick={() => {
                      navigate({
                        to: CoinDetail.to,
                        params: {
                          coinId: getCoinId(coin.asset),
                        },
                      });
                    }}
                    displayAmount={coin.balance}
                    symbol={coin.asset.symbol}
                    coinGeckoId={coin.asset.coinGeckoId}
                    coinImageProps={{
                      imageURL: coin.asset.image,
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
