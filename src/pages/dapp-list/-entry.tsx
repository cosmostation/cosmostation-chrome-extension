import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { Typography } from '@mui/material';

import AllNetworkButton from '@/components/AllNetworkButton';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import CheckBoxTextButton from '@/components/common/CheckBoxTextButton';
import EmptyAsset from '@/components/EmptyAsset';
import Search from '@/components/Search';
import SortBottomSheet from '@/components/SortBottomSheet';
import { DAPP_LIST_SORT_KEY } from '@/constants/sortKey';
import { useChainList } from '@/hooks/useChainList';
import { useDappInfos } from '@/hooks/useDappInfos';
import type { UniqueChainId } from '@/types/chain';
import type { DappListSortKeyType } from '@/types/sortKey';
import { filterChainsByChainId } from '@/utils/asset';
import { parseUniqueChainId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import GridDappItem from './-components/GridDappItem';
import ScrollableChips from './-components/ScrollableChips';
import { Container, EmptyAssetContainer, FilterContaienr, GridContainer, SortConditionContainer, StickyContentsContainer } from './-styled';

import NoSearchIcon from '@/assets/images/icons/NoSearch70.svg';

const DEFAULT_DAPP_TYPE = 'Popular';
const ALL_DAPP_TYPE = 'All';
const ALL_NETWORK_KEY = 'all-network';

export default function Entry() {
  const { t } = useTranslation();

  const { data: dappList } = useDappInfos();
  const { pinnedDappIds, selectedChainFilterId } = useExtensionStorageStore((state) => state);

  const { flatChainList } = useChainList();

  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);

  const [selectedDappType, setSelectedDappType] = useState(DEFAULT_DAPP_TYPE);

  const [userSelectedChainId, setUserSelectedChainId] = useState<UniqueChainId | typeof ALL_NETWORK_KEY>();
  const [isShowPinnedOnly, setIsShowPinnedOnly] = useState(false);

  const currentSelectedChainId = useMemo(() => {
    if (userSelectedChainId) {
      if (userSelectedChainId === ALL_NETWORK_KEY) {
        return undefined;
      }
      return userSelectedChainId;
    }

    return selectedChainFilterId || undefined;
  }, [selectedChainFilterId, userSelectedChainId]);

  const isDebouncing = !!search && isPending();

  const [sortOption, setSortOption] = useState<DappListSortKeyType>(DAPP_LIST_SORT_KEY.ALPHABETICAL_ASC);
  const [isOpenSortBottomSheet, setIsOpenSortBottomSheet] = useState(false);

  const baseChainList = filterChainsByChainId(flatChainList);

  const dappTypeList = useMemo(() => {
    const aggregatedDappTypes =
      dappList?.reduce((acc, dapp) => {
        if (!acc.includes(dapp?.type || '')) {
          acc.push(dapp?.type || '');
        }
        return acc;
      }, [] as string[]) || [];

    return [DEFAULT_DAPP_TYPE, ALL_DAPP_TYPE, ...aggregatedDappTypes];
  }, [dappList]);

  const sortedDappList = useMemo(() => {
    return dappList
      ?.sort((a, b) => {
        if (sortOption === DAPP_LIST_SORT_KEY.ALPHABETICAL_ASC) {
          return a.name?.localeCompare(b?.name || '') || 0;
        }

        return 0;
      })
      .sort((a) => {
        if (pinnedDappIds.includes(a.id)) {
          return -1;
        }
        return 0;
      });
  }, [dappList, pinnedDappIds, sortOption]);

  const filteredDappList = useMemo(() => {
    const filteredBySortOption =
      sortOption === DAPP_LIST_SORT_KEY.IS_MULTICHAIN_SUPPORT ? sortedDappList?.filter((dapp) => dapp.chains && dapp.chains.length > 1) : sortedDappList;
    const filteredByPinned = isShowPinnedOnly ? filteredBySortOption?.filter((dapp) => pinnedDappIds.includes(dapp.id)) : filteredBySortOption;

    const filteredByType = (() => {
      if (selectedDappType === DEFAULT_DAPP_TYPE) {
        return filteredByPinned?.filter((dapp) => dapp.is_default);
      }
      if (selectedDappType === ALL_DAPP_TYPE) {
        return filteredByPinned;
      }
      return filteredByPinned?.filter((dapp) => dapp.type === selectedDappType);
    })();

    const filteredDappsByChain = currentSelectedChainId
      ? filteredByType?.filter((dapp) => dapp.chains?.includes(parseUniqueChainId(currentSelectedChainId).id))
      : filteredByType;

    if (!!search && debouncedSearch.length > 1) {
      return (
        filteredDappsByChain?.filter((asset) => {
          const condition = [asset.name || '', asset.type || ''];

          return condition.some((item) => item.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1);
        }) || []
      );
    }
    return filteredDappsByChain;
  }, [sortOption, sortedDappList, isShowPinnedOnly, currentSelectedChainId, search, debouncedSearch, pinnedDappIds, selectedDappType]);

  return (
    <>
      <BaseBody>
        <Container>
          <StickyContentsContainer>
            <FilterContaienr>
              <Search
                value={search}
                onChange={(event) => {
                  setSearch(event.currentTarget.value);
                }}
                isPending={isDebouncing}
                placeholder={t('pages.dapp-list.entry.searchPlaceholder')}
                onClickFilter={() => {
                  setIsOpenSortBottomSheet(true);
                }}
                onClear={() => {
                  setSearch('');
                  cancel();
                }}
              />
            </FilterContaienr>

            <ScrollableChips
              types={dappTypeList}
              selectedType={selectedDappType}
              onClick={(type) => {
                setSelectedDappType(type);
              }}
            />
            <SortConditionContainer>
              <AllNetworkButton
                currentChainId={currentSelectedChainId}
                chainList={baseChainList}
                selectChainOption={(id) => {
                  if (!id) {
                    setUserSelectedChainId(ALL_NETWORK_KEY);
                  } else {
                    setUserSelectedChainId(id);
                  }
                }}
              />

              <CheckBoxTextButton
                isChecked={isShowPinnedOnly}
                onClick={() => {
                  setIsShowPinnedOnly(!isShowPinnedOnly);
                }}
              >
                <Typography variant="b3_R">{t('pages.dapp-list.entry.pinnedDapps')}</Typography>
              </CheckBoxTextButton>
            </SortConditionContainer>
          </StickyContentsContainer>

          {filteredDappList && filteredDappList.length > 0 ? (
            <GridContainer>
              {filteredDappList?.map((dapp) => {
                return <GridDappItem key={dapp.id} dappItemInfo={dapp} />;
              })}
            </GridContainer>
          ) : (
            <EmptyAssetContainer>
              <EmptyAsset icon={<NoSearchIcon />} title={t('pages.dapp-list.entry.noResultsTitle')} subTitle={t('pages.dapp-list.entry.noResultsSubtitle')} />
            </EmptyAssetContainer>
          )}
        </Container>
      </BaseBody>
      <SortBottomSheet
        optionButtonProps={[
          {
            sortKey: DAPP_LIST_SORT_KEY.ALPHABETICAL_ASC,
            children: <Typography variant="b2_M">{t('pages.dapp-list.entry.alphabeticalAsc')}</Typography>,
          },
          {
            sortKey: DAPP_LIST_SORT_KEY.IS_MULTICHAIN_SUPPORT,
            children: <Typography variant="b2_M">{t('pages.dapp-list.entry.multiChainSupport')}</Typography>,
          },
        ]}
        currentSortOption={sortOption}
        open={isOpenSortBottomSheet}
        onClose={() => setIsOpenSortBottomSheet(false)}
        onSelectSortOption={(val) => {
          setSortOption(val as DappListSortKeyType);
        }}
      />
    </>
  );
}
