import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';

// import { useNavigate } from '@tanstack/react-router';
import AllNetworkButton from '@/components/AllNetworkButton';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import IconTextButton from '@/components/common/IconTextButton';
import { Tab, Tabs } from '@/components/common/Tab';
import SortBottomSheet from '@/components/SortBottomSheet';
import { DASHBOARD_COIN_SORT_KEY } from '@/constants/sortKey';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCurrentHiddenAssetIds } from '@/hooks/useCurrentHiddenAssetIds';
import type { CommonSortKeyType } from '@/types/sortKey';

import SupportedAssets from './-components/SupportedAssets';
import {
  CoinButtonWrapper,
  Container,
  FilterContaienr,
  FilterIconButton,
  ImportTextContainer,
  PurpleContainer,
  RowContainer,
  StickyTabContainer,
  StickyTabPanelContentsContainer,
  StyledInput,
  StyledTabPanel,
} from './-styled';

import FilterSettingIcon from '@/assets/images/icons/FilterSetting20.svg';
import PlusIcon from '@/assets/images/icons/Plus12.svg';
import SearchIcon from '@/assets/images/icons/Search18.svg';

export default function Entry() {
  const { t } = useTranslation();
  //   const navigate = useNavigate();

  //   const { data: coinGeckoPrice } = useCoinGeckoPrice();
  //   const { currency } = useExtensionStorageStore((state) => state);
  const { data: currentHiddenAssetIds } = useCurrentHiddenAssetIds();
  const { data: currentAccountAllAssets } = useAccountAllAssets();

  console.log('🚀 ~ Entry ~ currentHiddenAssetIds:', currentHiddenAssetIds);

  const [supportAssetsSearch, setSupportAssetsSearch] = useState('');
  const [debouncedSupportSearch] = useDebounce(supportAssetsSearch, 500);

  const [customAssetsSearch, setCustomAssetsSearch] = useState('');
  const [debouncedCustomSearch] = useDebounce(customAssetsSearch, 500);

  console.log('🚀 ~ Entry ~ debouncedCustomSearch:', debouncedCustomSearch);

  const [isOpenSortBottomSheet, setIsOpenSortBottomSheet] = useState(false);
  const [sortOption, setSortOption] = useState<CommonSortKeyType>(DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER);

  const [tabValue, setTabValue] = useState(0);

  const tabLabels = ['Supported Crypto', 'Custom Crypto'];

  const [currentSelectedChainId, setCurrentSelectedChainId] = useState<string>('');

  const chainList = currentAccountAllAssets?.cosmosAccountAssets?.map((item) => item.chain) || [];
  const uniqueChainList = chainList.filter((item, index) => chainList.findIndex((item2) => item2.id === item.id) === index);

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  };

  return (
    <BaseBody>
      <EdgeAligner>
        <Container>
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
                  value={supportAssetsSearch}
                  onChange={(event) => {
                    setSupportAssetsSearch(event.currentTarget.value);
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
                chainList={uniqueChainList}
                isManageAssets
                selectChainOption={(id) => {
                  setCurrentSelectedChainId(id);
                }}
              />
            </StickyTabPanelContentsContainer>
            <CoinButtonWrapper>
              <SupportedAssets currentSearch={debouncedSupportSearch} currentSortOption={sortOption} currentSelectedChainId={currentSelectedChainId} />
            </CoinButtonWrapper>
          </StyledTabPanel>
          <StyledTabPanel value={tabValue} index={1}>
            <StickyTabPanelContentsContainer>
              <FilterContaienr>
                <StyledInput
                  startAdornment={
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  }
                  placeholder={'Search'}
                  value={customAssetsSearch}
                  onChange={(event) => {
                    setCustomAssetsSearch(event.currentTarget.value);
                  }}
                />
              </FilterContaienr>
              <RowContainer>
                <AllNetworkButton
                  sizeVariant="medium"
                  typoVarient="b2_M"
                  currentChainId={currentSelectedChainId}
                  chainList={uniqueChainList}
                  isManageAssets
                  selectChainOption={(id) => {
                    setCurrentSelectedChainId(id);
                  }}
                />
                <IconTextButton>
                  <IconTextButton
                    leadingIcon={
                      <PurpleContainer>
                        <PlusIcon />
                      </PurpleContainer>
                    }
                  >
                    <ImportTextContainer>
                      <Typography variant="b3_M">{t('pages.manage-assets.visibility.assets.entry.importCrypto')}</Typography>
                    </ImportTextContainer>
                  </IconTextButton>
                </IconTextButton>
              </RowContainer>
            </StickyTabPanelContentsContainer>
          </StyledTabPanel>
          <SortBottomSheet
            optionButtonProps={[
              {
                sortKey: DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER,
                children: <Typography variant="b2_M">{t('pages.manage-assets.visibility.assets.entry.valueHighOrder')}</Typography>,
              },
              {
                sortKey: DASHBOARD_COIN_SORT_KEY.ALPHABETICAL_ASC,
                children: <Typography variant="b2_M">{t('pages.manage-assets.visibility.assets.entry.alphabeticalAsc')}</Typography>,
              },
            ]}
            currentSortOption={DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER}
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
