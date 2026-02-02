import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import Typography from '@mui/material/Typography';
import { useNavigate } from '@tanstack/react-router';

import AllNetworkButton from '@/components/AllNetworkButton';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import CoinWithChainNameButton from '@/components/CoinWithChainNameButton';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import IconTextButton from '@/components/common/IconTextButton';
import { VirtualizedList } from '@/components/common/VirtualizedList';
import DeleteConfirmBottomSheet from '@/components/DeleteConfirmBottomSheet';
import EmptyAsset from '@/components/EmptyAsset';
import Search from '@/components/Search';
import SortBottomSheet from '@/components/SortBottomSheet';
import { useScroll } from '@/components/Wrapper/components/ScrollProvider';
import { DASHBOARD_COIN_SORT_KEY } from '@/constants/sortKey';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useAssetVisibilityToggle } from '@/hooks/useAssetVisibilityToggle';
import { useProcessedAssets } from '@/hooks/useProcessedAssets';
import { Route as ImportToken } from '@/pages/manage-assets/import/assets';
import type { UniqueChainId } from '@/types/chain';
import type { CommonSortKeyType } from '@/types/sortKey';
import { getFilteredChainsByChainId } from '@/utils/asset';
import { isMatchingUniqueChainId } from '@/utils/queryParamGenerator';
import { shorterAddress } from '@/utils/string';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  CoinButtonWrapper,
  CoinContainer,
  CoinIdContainer,
  CoinImage,
  CoinSymbolContainer,
  Container,
  EmptyAssetContainer,
  IconContainer,
  ImportTextContainer,
  PurpleContainer,
  RowContainer,
  StickyContainer,
} from './-styled';

import AddIcon from '@/assets/images/icons/Add20.svg';
import PlusIcon from '@/assets/images/icons/Plus12.svg';
import RemoveIcon from '@/assets/images/icons/Remove20.svg';


export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { scrollToTop } = useScroll();

  const selectedChainFilterId = useExtensionStorageStore((state) => state.selectedChainFilterId);

  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);
  const isSearchEmpty = useMemo(() => search.length === 0, [search.length]);
  const isDebouncing = !!search && isPending();

  const [isOpenSortBottomSheet, setIsOpenSortBottomSheet] = useState(false);
  const [sortOption, setSortOption] = useState<CommonSortKeyType>(DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER);

  const [userSelectedChainId, setUserSelectedChainId] = useState<UniqueChainId | undefined>();
  const currentSelectedChainId = useMemo(() => selectedChainFilterId || userSelectedChainId, [selectedChainFilterId, userSelectedChainId]);

  const { data: currentAccountAllAssets } = useAccountAllAssets({ filterByPreferAccountType: true });
  const baseCoinList = useMemo(() => currentAccountAllAssets?.flatAccountAssets || [], [currentAccountAllAssets?.flatAccountAssets]);

  const chainList = useMemo(() => getFilteredChainsByChainId(baseCoinList), [baseCoinList]);
  const currentSelectedChain = useMemo(
    () => chainList.find((item) => isMatchingUniqueChainId(item, currentSelectedChainId)),
    [chainList, currentSelectedChainId],
  );
  const isShowAssetId = useMemo(() => !!currentSelectedChain || (!!debouncedSearch && !isSearchEmpty), [currentSelectedChain, debouncedSearch, isSearchEmpty]);

  const { list: processedCoinList, visibleCount } = useProcessedAssets({
    baseCoinList,
    sortOption,
    currentSelectedChainId,
    search: debouncedSearch,
    isSearchEmpty,
  });

  const { handleToggleVisibility, deleteConfirmState } = useAssetVisibilityToggle({ isLastVisible: visibleCount === 1 });


  const shouldScrollToTop = search.length !== 1;

  useEffect(() => {
    if (shouldScrollToTop || currentSelectedChainId) {
      scrollToTop();
    }
  }, [scrollToTop, shouldScrollToTop, currentSelectedChainId]);

  return (
    <>
      <BaseBody>
        <EdgeAligner
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <Container>
            <StickyContainer>
              <Search
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                isPending={isDebouncing}
                onClear={() => {
                  setSearch('');
                  cancel();
                }}
                onClickFilter={() => {
                  setIsOpenSortBottomSheet(true);
                }}
              />

              <RowContainer>
                <AllNetworkButton
                  currentChainId={currentSelectedChainId}
                  chainList={chainList}
                  disabled={!!selectedChainFilterId}
                  selectChainOption={(id) => setUserSelectedChainId(id)}
                />

                <IconTextButton
                  onClick={() => navigate({ to: ImportToken.to })}
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
              </RowContainer>
            </StickyContainer>

            {processedCoinList.length > 0 ? (
              <CoinButtonWrapper>
                {!isDebouncing && (
                  <VirtualizedList
                    items={processedCoinList}
                    estimateSize={() => 60}
                    renderItem={(coin) => (
                      <CoinWithChainNameButton
                        key={coin.uniqueCoinId}
                        displayAmount={coin.displayAmount}
                        symbol={coin.asset.symbol}
                        chainName={coin.chain.name}
                        assetId={coin.resolvedAssetId}
                        coinGeckoId={coin.asset.coinGeckoId}
                        displayAssetId={isShowAssetId}
                        coinImageProps={{
                          imageURL: coin.asset.image,
                          badgeImageURL: coin.chain.image || '',
                        }}
                        rightComponent={<IconContainer>{coin.isHiddenState ? <AddIcon /> : <RemoveIcon />}</IconContainer>}
                        onClick={() => handleToggleVisibility(coin)}
                      />
                    )}
                    overscan={5}
                  />
                )}
              </CoinButtonWrapper>
            ) : (
              <EmptyAssetContainer>
                <EmptyAsset
                  title={t('pages.manage-assets.visibility.assets.entry.noResultsTitle')}
                  subTitle={t('pages.manage-assets.visibility.assets.entry.noResultsSubtitle')}
                />
              </EmptyAssetContainer>
            )}
          </Container>
        </EdgeAligner>
      </BaseBody>

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
        currentSortOption={sortOption}
        open={isOpenSortBottomSheet}
        onClose={() => setIsOpenSortBottomSheet(false)}
        onSelectSortOption={(val: CommonSortKeyType) => setSortOption(val)}
      />

      <DeleteConfirmBottomSheet
        open={deleteConfirmState.isOpen}
        onClose={deleteConfirmState.onClose}
        contents={
          <CoinContainer>
            <CoinImage imageURL={deleteConfirmState.token?.asset.image} badgeImageURL={deleteConfirmState.token?.chain.image || undefined} />
            <CoinSymbolContainer>
              <Base1300Text variant="b1_B">{deleteConfirmState.token?.asset.symbol}</Base1300Text>
              <CoinIdContainer>
                <Base1000Text variant="b4_R">{t('pages.manage-assets.visibility.assets.entry.contract')}</Base1000Text>
                &nbsp;
                <Base1000Text variant="b3_M">{shorterAddress(deleteConfirmState.token?.asset.id, 16)}</Base1000Text>
              </CoinIdContainer>
            </CoinSymbolContainer>
          </CoinContainer>
        }
        descriptionText={t('pages.manage-assets.visibility.assets.entry.deleteDescription')}
        onClickConfirm={deleteConfirmState.onConfirm}
      />
    </>
  );
}
