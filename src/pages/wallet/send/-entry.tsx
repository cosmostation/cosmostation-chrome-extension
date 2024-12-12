import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputAdornment, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import AllNetworkButton from '@/components/AllNetworkButton';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import CoinWithChainNameButton from '@/components/CoinWithChainNameButton';
import SortBottomSheet from '@/components/SortBottomSheet';
import { DASHBOARD_COIN_SORT_KEY } from '@/constants/sortKey';
import { TEST_CHAIN_LIST } from '@/constants/test';
import { useChainList } from '@/hooks/useChainList';
import { Route as Send } from '@/pages/wallet/send/$coinId';
import type { CommonSortKeyType } from '@/types/sortKey';

import { CoinButtonWrapper, Container, FilterContaienr, FilterIconButton, StickyContentsContainer, StyledInput } from './-styled';

import FilterSettingIcon from '@/assets/images/icons/FilterSetting20.svg';
import SearchIcon from '@/assets/images/icons/Search18.svg';

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { flatChainList } = useChainList();

  const [search, setSearch] = useState('');
  const [isOpenSortBottomSheet, setIsOpenSortBottomSheet] = useState(false);
  const [sortOption, setSortOption] = useState<CommonSortKeyType>(DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER);

  const dummyChainList = TEST_CHAIN_LIST;

  const [currentSelectedChainId, setCurrentSelectedChainId] = useState<string>();
  const currentSelectedChain = flatChainList.find((chain) => chain.chainId === currentSelectedChainId);
  const isShowAssetId = !!currentSelectedChain;

  // AllNetworkButton에 들어간 체인 리스트는 리스팅되는 코인들의 네트워크로 필터링 필요.

  return (
    <BaseBody>
      <EdgeAligner>
        <Container>
          <StickyContentsContainer>
            <FilterContaienr>
              <StyledInput
                startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                }
                placeholder={t('pages.wallet.send.entry.search')}
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
              currentChainId={currentSelectedChainId}
              chainList={dummyChainList}
              selectChainOption={(id) => {
                setCurrentSelectedChainId(id);
              }}
            />
          </StickyContentsContainer>

          <CoinButtonWrapper>
            <CoinWithChainNameButton
              baseAmount="100"
              symbol={'FirstBitcoin'}
              chainName={'ETHEREUM'}
              assetId="ibc/D16CZ6BV...X5E6A46E"
              displayAssetId={isShowAssetId}
              coinImageProps={{
                imageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                badgeImageURL: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
              }}
              onClick={() => {
                navigate({
                  to: Send.to,
                  params: {
                    coinId: 'firstbitcoin',
                  },
                });
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
                children: <Typography variant="b2_M">{t('pages.wallet.send.entry.valueHighOrder')}</Typography>,
              },
              {
                sortKey: DASHBOARD_COIN_SORT_KEY.ALPHABETICAL_ASC,
                children: <Typography variant="b2_M">{t('pages.wallet.send.entry.alphabeticalAsc')}</Typography>,
              },
            ]}
            currentSortOption={sortOption}
            open={isOpenSortBottomSheet}
            onClose={() => setIsOpenSortBottomSheet(false)}
            onSelectSortOption={(sortOptionKey) => {
              setSortOption(sortOptionKey);
            }}
          />
        </Container>
      </EdgeAligner>
    </BaseBody>
  );
}
