import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputAdornment, Typography } from '@mui/material';

import AllNetworkButton from '@/components/AllNetworkButton';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import CoinWithChainNameButton from '@/components/CoinWithChainNameButton';
import CoinOverViewBox from '@/components/MainBox/CoinOverviewBox';
import SortBottomSheet from '@/components/SortBottomSheet';
import { DASHBOARD_COIN_SORT_KEY } from '@/constants/sortKey';

import { CoinButtonWrapper, Container, FilterContaienr, FilterIconButton, StickyContentsContainer, StyledInput } from './-styled';

import FilterSettingIcon from '@/assets/images/icons/FilterSetting20.svg';
import SearchIcon from '@/assets/images/icons/Search18.svg';

export default function Entry() {
  const { t } = useTranslation();

  // TODO sortKey를 어떻게 관리할지 결정 필요.
  const [isOpenSortBottomSheet, setIsOpenSortBottomSheet] = useState(false);

  const currentCoinId = '1';

  // AllNetworkButton에 들어간 체인 리스트는 리스팅되는 코인들의 네트워크로 필터링 필요.

  return (
    <BaseBody>
      <EdgeAligner>
        <Container>
          <CoinOverViewBox testCoinId={currentCoinId} />

          <StickyContentsContainer>
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

            <AllNetworkButton sizeVariant="medium" typoVarient="b2_M" />
          </StickyContentsContainer>

          <CoinButtonWrapper>
            <CoinWithChainNameButton
              baseAmount="100"
              symbol={'FirstBitcoin'}
              chainName={'ETHEREUM'}
              coinImageProps={{
                imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                badgeImageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
              }}
            />
            <CoinWithChainNameButton
              baseAmount="100"
              symbol={'FirstBitcoin'}
              chainName={'ETHEREUM'}
              coinImageProps={{
                imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                badgeImageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
              }}
            />
            <CoinWithChainNameButton
              baseAmount="100"
              symbol={'FirstBitcoin'}
              chainName={'ETHEREUM'}
              coinImageProps={{
                imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                badgeImageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
              }}
            />
            <CoinWithChainNameButton
              baseAmount="100"
              symbol={'FirstBitcoin'}
              chainName={'ETHEREUM'}
              coinImageProps={{
                imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                badgeImageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
              }}
            />
            <CoinWithChainNameButton
              baseAmount="100"
              symbol={'FirstBitcoin'}
              chainName={'ETHEREUM'}
              coinImageProps={{
                imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                badgeImageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
              }}
            />
            <CoinWithChainNameButton
              baseAmount="100"
              symbol={'FirstBitcoin'}
              chainName={'ETHEREUM'}
              coinImageProps={{
                imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                badgeImageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
              }}
            />
            <CoinWithChainNameButton
              baseAmount="100"
              symbol={'FirstBitcoin'}
              chainName={'ETHEREUM'}
              coinImageProps={{
                imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                badgeImageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
              }}
            />
            <CoinWithChainNameButton
              baseAmount="100"
              symbol={'FirstBitcoin'}
              chainName={'ETHEREUM'}
              coinImageProps={{
                imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                badgeImageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
              }}
            />
            <CoinWithChainNameButton
              baseAmount="100"
              symbol={'FirstBitcoin'}
              chainName={'ETHEREUM'}
              coinImageProps={{
                imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                badgeImageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
              }}
            />
            <CoinWithChainNameButton
              baseAmount="100"
              symbol={'FirstBitcoin'}
              chainName={'ETHEREUM'}
              coinImageProps={{
                imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                badgeImageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
              }}
            />
            <CoinWithChainNameButton
              baseAmount="100"
              symbol={'FirstBitcoin'}
              chainName={'ETHEREUM'}
              coinImageProps={{
                imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                badgeImageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
              }}
            />
            <CoinWithChainNameButton
              baseAmount="100"
              symbol={'FirstBitcoin'}
              chainName={'ETHEREUM'}
              coinImageProps={{
                imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                badgeImageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
              }}
            />
            <CoinWithChainNameButton
              baseAmount="100"
              symbol={'FirstBitcoin'}
              chainName={'ETHEREUM'}
              coinImageProps={{
                imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                badgeImageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
              }}
            />
            <CoinWithChainNameButton
              baseAmount="100"
              symbol={'FirstBitcoin'}
              chainName={'ETHEREUM'}
              coinImageProps={{
                imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                badgeImageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
              }}
            />
            <CoinWithChainNameButton
              baseAmount="100"
              symbol={'FirstBitcoin'}
              chainName={'ETHEREUM'}
              coinImageProps={{
                imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                badgeImageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
              }}
            />
            <CoinWithChainNameButton
              baseAmount="100"
              symbol={'FirstBitcoin'}
              chainName={'ETHEREUM'}
              coinImageProps={{
                imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                badgeImageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
              }}
            />
            <CoinWithChainNameButton
              baseAmount="100"
              symbol={'FirstBitcoin'}
              chainName={'ETHEREUM'}
              coinImageProps={{
                imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                badgeImageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
              }}
            />
            <CoinWithChainNameButton
              baseAmount="100"
              symbol={'FirstBitcoin'}
              chainName={'ETHEREUM'}
              coinImageProps={{
                imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                badgeImageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
              }}
            />
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
              console.log('🚀 ~ Entry ~ val:', val);
            }}
          />
        </Container>
      </EdgeAligner>
    </BaseBody>
  );
}
