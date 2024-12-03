import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputAdornment, Typography } from '@mui/material';

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
import type { DashboardCoinSortKeyType } from '@/types/sortKey';
import { useSortKeyStore } from '@/zustand/hooks/useSortStore';

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

  Buffer.from('Hello from Index!').toString('base64');

  const { dashboardCoinSortKey, updateDashboardCoinSortKey } = useSortKeyStore((state) => state);

  const [isOpenSortBottomSheet, setIsOpenSortBottomSheet] = useState(false);

  const { currentAccountAssets } = useAccountAssets();

  console.log('🚀 ~ Entry ~ currentAccountAssets:', currentAccountAssets);

  // NOTE 디비에 저장할 것.
  const [tabValue, setTabValue] = useState(0);
  const tabLabels = ['Crypto', 'NFTs'];

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
                  // value={search}
                  // onChange={(event) => {
                  //   setSearch(event.currentTarget.value);
                  // }}
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
                <CheckBoxTextButton>
                  <Typography variant="b3_R">{t('pages.index.hideSmallBalance')}</Typography>
                </CheckBoxTextButton>
                <IconTextButton leadingIcon={<PlusIcon />}>
                  <MarginLeftTypography variant="b3_M">{t('pages.index.manageCrypto')}</MarginLeftTypography>
                </IconTextButton>
              </ManageCryptoContainer>
            </StickyTabPanelContentsContainer>

            {/* NOTE 토큰 리스팅을 위한 컴포넌트 */}
            <CoinButtonWrapper>
              <CoinWithMarketTrendButton
                baseAmount="100"
                symbol={'FirstBitcoin'}
                coinImageProps={{
                  imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                }}
              />

              <CoinWithMarketTrendButton
                baseAmount="100"
                symbol={'Bitcoin'}
                coinImageProps={{
                  imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                }}
              />

              <CoinWithMarketTrendButton
                baseAmount="100"
                symbol={'Bitcoin'}
                coinImageProps={{
                  imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                }}
              />

              <CoinWithMarketTrendButton
                baseAmount="100"
                symbol={'Bitcoin'}
                coinImageProps={{
                  imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                }}
              />

              <CoinWithMarketTrendButton
                baseAmount="100"
                symbol={'Bitcoin'}
                coinImageProps={{
                  imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                }}
              />
              <CoinWithMarketTrendButton
                baseAmount="100"
                symbol={'Bitcoin'}
                coinImageProps={{
                  imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                }}
              />

              <CoinWithMarketTrendButton
                baseAmount="100"
                symbol={'Bitcoin'}
                coinImageProps={{
                  imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                }}
              />
              <CoinWithMarketTrendButton
                baseAmount="100"
                symbol={'Bitcoin'}
                coinImageProps={{
                  imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                }}
              />
              <CoinWithMarketTrendButton
                baseAmount="100"
                symbol={'Bitcoin'}
                coinImageProps={{
                  imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                }}
              />
              <CoinWithMarketTrendButton
                baseAmount="100"
                symbol={'Bitcoin'}
                coinImageProps={{
                  imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                }}
              />
              <CoinWithMarketTrendButton
                baseAmount="100"
                symbol={'Bitcoin'}
                coinImageProps={{
                  imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                }}
              />
              <CoinWithMarketTrendButton
                baseAmount="100"
                symbol={'Bitcoin'}
                coinImageProps={{
                  imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                }}
              />
              <CoinWithMarketTrendButton
                baseAmount="100"
                symbol={'Bitcoin'}
                coinImageProps={{
                  imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                }}
              />
              <CoinWithMarketTrendButton
                baseAmount="100"
                symbol={'Bitcoin'}
                coinImageProps={{
                  imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                }}
              />
              <CoinWithMarketTrendButton
                baseAmount="100"
                symbol={'Bitcoin'}
                coinImageProps={{
                  imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                }}
              />
              <CoinWithMarketTrendButton
                baseAmount="100"
                symbol={'Bitcoin'}
                coinImageProps={{
                  imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                }}
              />
              <CoinWithMarketTrendButton
                baseAmount="100"
                symbol={'Bitcoin'}
                coinImageProps={{
                  imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                }}
              />
              <CoinWithMarketTrendButton
                baseAmount="100"
                symbol={'Bitcoin'}
                coinImageProps={{
                  imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                }}
              />
              <CoinWithMarketTrendButton
                baseAmount="100"
                symbol={'Bitcoin'}
                coinImageProps={{
                  imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                }}
              />
              <CoinWithMarketTrendButton
                baseAmount="100"
                symbol={'Bitcoin'}
                coinImageProps={{
                  imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                }}
              />
              <CoinWithMarketTrendButton
                baseAmount="100"
                symbol={'Bitcoin'}
                coinImageProps={{
                  imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                }}
              />
              <CoinWithMarketTrendButton
                baseAmount="100"
                symbol={'Bitcoin'}
                coinImageProps={{
                  imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                }}
              />
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
              updateDashboardCoinSortKey(val as DashboardCoinSortKeyType);
            }}
          />
        </Container>
      </EdgeAligner>
    </BaseBody>
  );
}
