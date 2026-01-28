import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { Typography } from '@mui/material';

import SortBottomSheet from '@/components/SortBottomSheet';
import { useScroll } from '@/components/Wrapper/components/ScrollProvider';
import { DASHBOARD_COIN_SORT_KEY } from '@/constants/sortKey';
import { useCryptoAssets } from '@/pages/-hooks/useCryptoAssets';
import type { DashboardCoinSortKeyType } from '@/types/sortKey';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import CryptoFilterSection from '../CryptoFilterSection';
import CryptoListSection from '../CryptoListSection';

function CryptoTab() {
  const { t } = useTranslation();
  const { scrollToTop } = useScroll();

  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);
  const [isOpenSortBottomSheet, setIsOpenSortBottomSheet] = useState(false);

  const isDebouncing = !!search && isPending();

  const dashboardCoinSortKey = useExtensionStorageStore((state) => state.dashboardCoinSortKey);
  const updateExtensionStorageStore = useExtensionStorageStore((state) => state.updateExtensionStorageStore);

  const { filteredAssetsBySearch, isLoading } = useCryptoAssets({
    search,
    debouncedSearch,
  });

  useEffect(() => {
    if (search.length > 1 || search.length === 0) {
      scrollToTop();
    }
  }, [scrollToTop, search.length]);

  return (
    <>
      <CryptoFilterSection
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
        }}
        onClearSearch={() => {
          setSearch('');
          cancel();
        }}
        isDebouncing={isDebouncing}
        onClickFilter={() => {
          setIsOpenSortBottomSheet(true);
        }}
      />
      <CryptoListSection assets={filteredAssetsBySearch} isLoading={isLoading} />
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
        onClose={() => {
          setIsOpenSortBottomSheet(false);
        }}
        onSelectSortOption={(val) => {
          updateExtensionStorageStore('dashboardCoinSortKey', val as DashboardCoinSortKeyType);
        }}
      />
    </>
  );
}

export default memo(CryptoTab);
