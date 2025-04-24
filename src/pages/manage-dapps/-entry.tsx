import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { Typography } from '@mui/material';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1000Text from '@/components/common/Base1000Text';
import IntersectionObserver from '@/components/common/IntersectionObserver';
import EmptyAsset from '@/components/EmptyAsset';
import Search from '@/components/Search';
import SortBottomSheet from '@/components/SortBottomSheet';
import { useScroll } from '@/components/Wrapper/components/ScrollProvider';
import { DAPPS_SORT_KEY } from '@/constants/sortKey';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import type { CommonSortKeyType } from '@/types/sortKey';
import { getSiteTitle } from '@/utils/website';

import CurrentDapp from './-components/CurrentDapp';
import DappItem from './-components/DappItem';
import { Container, DappItemContainer, Divider, EmptyAssetContainer, RowContainer, StickyContainer } from './-styled';

import NoListIcon from '@/assets/images/icons/NoList70.svg';

export default function Entry() {
  const { t } = useTranslation();

  const { scrollToTop } = useScroll();

  const { currentAccountApporvedOrigins, removeApprovedOrigin } = useCurrentAccount();

  const [viewLimit, setViewLimit] = useState(30);

  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);
  const [isOpenSortBottomSheet, setIsOpenSortBottomSheet] = useState(false);
  const [sortOption, setSortOption] = useState<CommonSortKeyType>(DAPPS_SORT_KEY.CONNECTED_DATE_DESC);

  const isDebouncing = !!search && isPending();

  const connectedDappCount = currentAccountApporvedOrigins.length;

  const approvedOriginsWithTitles = currentAccountApporvedOrigins.map((origin) => ({
    ...origin,
    title: getSiteTitle(origin.origin) || origin.origin,
  }));

  const sortedAssets = (() =>
    approvedOriginsWithTitles.sort((a, b) => {
      if (sortOption === DAPPS_SORT_KEY.CONNECTED_DATE_DESC) {
        return b.lastConnectedAt - a.lastConnectedAt;
      }

      if (sortOption === DAPPS_SORT_KEY.ALPHABETICAL_ASC) {
        return a.title.localeCompare(b.title);
      }

      return 0;
    }))();

  const filteredOriginssBySearch = useMemo(() => {
    if (!!search && debouncedSearch.length > 1) {
      return (
        sortedAssets
          .filter((site) => {
            const condition = [site.origin];

            return condition.some((item) => item.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1);
          })
          .slice(0, viewLimit) || []
      );
    }
    return sortedAssets.slice(0, viewLimit);
  }, [debouncedSearch, search, sortedAssets, viewLimit]);

  useEffect(() => {
    if (search.length > 1 || search.length === 0) {
      scrollToTop();
      setViewLimit(30);
    }
  }, [scrollToTop, search.length]);

  return (
    <>
      <BaseBody>
        <EdgeAligner
          style={{
            flex: 1,
          }}
        >
          <Container>
            <>
              <CurrentDapp />
              <Divider />
            </>
            <StickyContainer>
              <Search
                value={search}
                onChange={(event) => {
                  setSearch(event.currentTarget.value);
                }}
                searchPlaceholder={t('pages.manage-dapps.entry.searchPlaceholder')}
                isPending={isDebouncing}
                onClickFilter={() => {
                  setIsOpenSortBottomSheet(true);
                }}
                onClear={() => {
                  setSearch('');
                  cancel();
                }}
              />
              <RowContainer>
                <Base1000Text variant="h4_B">
                  {t('pages.manage-dapps.entry.connectedDapps', {
                    dappCount: connectedDappCount,
                  })}
                </Base1000Text>
              </RowContainer>
            </StickyContainer>
            <DappItemContainer>
              {filteredOriginssBySearch.length === 0 ? (
                <EmptyAssetContainer>
                  <EmptyAsset icon={<NoListIcon />} title={t('pages.manage-dapps.entry.noDapps')} subTitle={t('pages.manage-dapps.entry.noDappsDescription')} />
                </EmptyAssetContainer>
              ) : (
                filteredOriginssBySearch.map((item) => {
                  return (
                    <DappItem
                      key={item.origin}
                      origin={item.origin}
                      websiteName={item.title}
                      totalTxCount={item.txCount}
                      onClickDelete={() => removeApprovedOrigin(item.origin)}
                    />
                  );
                })
              )}
              {filteredOriginssBySearch?.length > viewLimit - 1 && (
                <IntersectionObserver
                  onIntersect={() => {
                    setViewLimit((limit) => limit + 30);
                  }}
                />
              )}
            </DappItemContainer>
          </Container>
          <SortBottomSheet
            optionButtonProps={[
              {
                sortKey: DAPPS_SORT_KEY.CONNECTED_DATE_DESC,
                children: <Typography variant="b2_M">{t('pages.manage-dapps.entry.connectedDateDesc')}</Typography>,
              },
              {
                sortKey: DAPPS_SORT_KEY.ALPHABETICAL_ASC,
                children: <Typography variant="b2_M">{t('pages.manage-dapps.entry.alphabeticalAsc')}</Typography>,
              },
            ]}
            currentSortOption={sortOption}
            open={isOpenSortBottomSheet}
            onClose={() => setIsOpenSortBottomSheet(false)}
            onSelectSortOption={(val) => {
              setSortOption(val);
            }}
          />
        </EdgeAligner>
      </BaseBody>
    </>
  );
}
