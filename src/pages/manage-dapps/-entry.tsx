import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { Typography } from '@mui/material';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1000Text from '@/components/common/Base1000Text';
import Search from '@/components/Search';
import SortBottomSheet from '@/components/SortBottomSheet';
import { DAPPS_SORT_KEY } from '@/constants/sortKey';
import type { CommonSortKeyType } from '@/types/sortKey';

import CurrentDapp from './-components/CurrentDapp';
import DappItem from './-components/DappItem';
import { Container, DappItemContainer, Divider, RowContainer, StickyContainer } from './-styled';

export default function Entry() {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);
  const [isOpenSortBottomSheet, setIsOpenSortBottomSheet] = useState(false);
  const [sortOption, setSortOption] = useState<CommonSortKeyType>(DAPPS_SORT_KEY.CONNECTED_DATE_DESC);

  console.log('🚀 ~ Entry ~ debouncedSearch:', debouncedSearch);

  const isDebouncing = !!search && isPending();

  const connectedDappCount = 4;

  const testDappDatas = [
    {
      name: 'Osmosis.Zone',
      url: 'https://osmosis.zone',
      image: 'https://osmosis.zone/favicon.ico',
    },
    {
      name: 'Osmosis.Zone',
      url: 'https://osmosis.zone',
      image: 'https://osmosis.zone/favicon.ico',
    },
    {
      name: 'Osmosis.Zone',
      url: 'https://osmosis.zone',
      image: 'https://osmosis.zone/favicon.ico',
    },
    {
      name: 'Osmosis.Zone',
      url: 'https://osmosis.zone',
      image: 'https://osmosis.zone/favicon.ico',
    },

    {
      name: 'Osmosis.Zone',
      url: 'https://osmosis.zone',
      image: 'https://osmosis.zone/favicon.ico',
    },
    {
      name: 'Osmosis.Zone',
      url: 'https://osmosis.zone',
      image: 'https://osmosis.zone/favicon.ico',
    },
    {
      name: 'Osmosis.Zone',
      url: 'https://osmosis.zone',
      image: 'https://osmosis.zone/favicon.ico',
    },
    {
      name: 'Osmosis.Zone',
      url: 'https://osmosis.zone',
      image: 'https://osmosis.zone/favicon.ico',
    },

    {
      name: 'Osmosis.Zone',
      url: 'https://osmosis.zone',
      image: 'https://osmosis.zone/favicon.ico',
    },
    {
      name: 'Osmosis.Zone',
      url: 'https://osmosis.zone',
      image: 'https://osmosis.zone/favicon.ico',
    },
    {
      name: 'Osmosis.Zone',
      url: 'https://osmosis.zone',
      image: 'https://osmosis.zone/favicon.ico',
    },
    {
      name: 'Osmosis.Zone',
      url: 'https://osmosis.zone',
      image: 'https://osmosis.zone/favicon.ico',
    },

    {
      name: 'Osmosis.Zone',
      url: 'https://osmosis.zone',
      image: 'https://osmosis.zone/favicon.ico',
    },
    {
      name: 'Osmosis.Zone',
      url: 'https://osmosis.zone',
      image: 'https://osmosis.zone/favicon.ico',
    },
    {
      name: 'Osmosis.Zone',
      url: 'https://osmosis.zone',
      image: 'https://osmosis.zone/favicon.ico',
    },
    {
      name: 'Osmosis.Zone',
      url: 'https://osmosis.zone',
      image: 'https://osmosis.zone/favicon.ico',
    },
  ];
  return (
    <>
      <BaseBody>
        <EdgeAligner>
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
              {!isDebouncing &&
                testDappDatas.map((item, i) => {
                  return <DappItem key={item.name.concat(i.toString())} websiteName={item.name} websiteImage={item.image} totalTxCount={'10'} />;
                })}
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
