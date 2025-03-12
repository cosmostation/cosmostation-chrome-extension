import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { Typography } from '@mui/material';

import AllNetworkButton from '@/components/AllNetworkButton';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import CheckBoxTextButton from '@/components/common/CheckBoxTextButton';
import Search from '@/components/Search';
import SortBottomSheet from '@/components/SortBottomSheet';
import { DAPP_LIST_SORT_KEY } from '@/constants/sortKey';
import { useChainList } from '@/hooks/useChainList';
import type { UniqueChainId } from '@/types/chain';
import type { DappListSortKeyType } from '@/types/sortKey';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { Container, FilterContaienr, SortConditionContainer, StickyContentsContainer } from './-styled';

const dappList = [
  {
    id: 1,
    name: '1inch',
    description:
      'The 1inch Network unites decentralized protocols whose synergy enables the most lucrative, fastest and protected operations in the DeFi space.',
    thumbnail: 'https://raw.githubusercontent.com/cosmostation/chainlist/ecosystem_dev/wallet_mobile/resource/1inch.png',
    link: 'https://app.1inch.io',
    chains: ['ethereum', 'arbitrum', 'avalanche', 'fantom', 'kaia', 'optimism', 'polygon'],
    socials: {
      github: 'https://github.com/1inch',
      telegram: 'https://t.me/OneInchNetworkNews',
      twitter: 'https://x.com/intent/follow?screen_name=1inch',
      discord: 'https://discord.com/invite/1inch',
      reddit: 'https://www.reddit.com/r/1inch/',
    },
    is_default: true,
    type: 'DEX',
  },
  {
    id: 2,
    name: 'Osmosis Zone',
    description: 'Interchain Liquidity Lab - Swap, earn and build on the leading decentralized Cosmos exchange.',
    thumbnail: 'https://raw.githubusercontent.com/cosmostation/chainlist/ecosystem_dev/wallet_mobile/resource/osmosiszone.png',
    link: 'https://app.osmosis.zone',
    chains: ['osmosis'],
    socials: {
      github: 'https://github.com/osmosis-labs/osmosis',
      telegram: 'https://t.me/osmosis_chat',
      twitter: 'https://x.com/osmosiszone',
      discord: 'https://discord.com/invite/osmosis',
      reddit: 'https://www.reddit.com/r/OsmosisLab/',
    },
    type: 'DeFi',
  },
  {
    id: 3,
    name: 'Drop Money',
    description:
      'Drop is a DeFi platform focused on providing liquidity across multiple blockchain networks, enhancing interoperability and transaction efficiency.',
    thumbnail: 'https://raw.githubusercontent.com/cosmostation/chainlist/ecosystem_dev/wallet_mobile/resource/dropmoney.png',
    link: 'https://app.drop.money',
    chains: ['cosmos', 'neutron'],
    socials: {
      github: 'https://github.com/hadronlabs-org/drop-contracts',
      telegram: 'https://t.me/drop_protocol',
      twitter: 'https://x.com/Dropdotmoney',
      discord: 'https://discord.com/invite/dropdotmoney',
    },
    type: 'DeFi',
  },
  {
    id: 4,
    name: 'Uniswap',
    description:
      'Uniswap V3 is a noncustodial automated market maker implemented for the Ethereum Virtual Machine. It provides increased capital efficiency, fine-tuned control of liquidity provider, and improve accuracy and convenience of its price oracle.',
    thumbnail: 'https://raw.githubusercontent.com/cosmostation/chainlist/ecosystem_dev/wallet_mobile/resource/uniswap.png',
    link: 'https://app.uniswap.org/swap',
    chains: ['ethereum', 'arbitrum', 'avalanche', 'base', 'optimism'],
    socials: {
      github: 'https://github.com/Uniswap',
      twitter: 'https://x.com/Uniswap',
      discord: 'https://discord.com/invite/uniswap',
    },
    type: 'DeFi',
  },
];

export default function Entry() {
  const { t } = useTranslation();

  const { pinnedDappIds } = useExtensionStorageStore((state) => state);

  const { flatChainList } = useChainList();

  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);

  const [currentSelectedChainId, setCurrentSelectedChainId] = useState<UniqueChainId | undefined>();
  const [isShowPinnedOnly, setIsShowPinnedOnly] = useState(false);

  const isDebouncing = !!search && isPending();

  const [sortOption, setSortOption] = useState<DappListSortKeyType>(DAPP_LIST_SORT_KEY.ALPHABETICAL_ASC);
  const [isOpenSortBottomSheet, setIsOpenSortBottomSheet] = useState(false);

  const soretedDappList = useMemo(() => {
    return dappList.sort((a, b) => {
      if (sortOption === DAPP_LIST_SORT_KEY.ALPHABETICAL_ASC) {
        return a.name.localeCompare(b.name);
      }
      if (sortOption === DAPP_LIST_SORT_KEY.IS_MULTICHAIN_SUPPORT) {
        return a.chains.length > 1 ? -1 : 1;
      }
      return 0;
    });
  }, [sortOption]);

  const filteredDappList = useMemo(() => {
    const filteredByPinned = isShowPinnedOnly ? soretedDappList.filter((dapp) => pinnedDappIds.includes(String(dapp.id))) : soretedDappList;

    // NOTE all. defi 등 타입별 필터링 추가

    const filteredDappsByChain = currentSelectedChainId ? filteredByPinned.filter((dapp) => dapp.chains.includes(currentSelectedChainId)) : filteredByPinned;

    if (!!search && debouncedSearch.length > 1) {
      return (
        filteredDappsByChain.filter((asset) => {
          const condition = [...asset.chains, asset.name, asset.type];

          return condition.some((item) => item.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1);
        }) || []
      );
    }
    return filteredDappsByChain;
  }, [currentSelectedChainId, debouncedSearch, isShowPinnedOnly, pinnedDappIds, search, soretedDappList]);

  console.log('🚀 ~ filteredDappList ~ filteredDappList:', filteredDappList);

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
            {/* NOTE 슬라이더 컴포넌트 */}
            {/* <Pagination
  count={10}
  renderItem={(item) => (
    <PaginationItem
      slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
      {...item}
    />
  )}
/> */}
            <SortConditionContainer>
              <AllNetworkButton
                sizeVariant="medium"
                typoVarient="b2_M"
                currentChainId={currentSelectedChainId}
                chainList={flatChainList}
                selectChainOption={(id) => {
                  setCurrentSelectedChainId(id);
                }}
              />

              <CheckBoxTextButton
                isChecked={!isShowPinnedOnly}
                onClick={() => {
                  setIsShowPinnedOnly(false);
                }}
              >
                <Typography variant="b3_R">{t('pages.dapp-list.entry.pinnedDapps')}</Typography>
              </CheckBoxTextButton>
            </SortConditionContainer>
          </StickyContentsContainer>
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
