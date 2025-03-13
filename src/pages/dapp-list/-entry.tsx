import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { Typography } from '@mui/material';

import AllNetworkButton from '@/components/AllNetworkButton';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import Carousel from '@/components/common/Carousel';
import CheckBoxTextButton from '@/components/common/CheckBoxTextButton';
import IconButton from '@/components/common/IconButton';
import Search from '@/components/Search';
import SortBottomSheet from '@/components/SortBottomSheet';
import { DAPP_LIST_SORT_KEY } from '@/constants/sortKey';
import { useChainList } from '@/hooks/useChainList';
import type { UniqueChainId } from '@/types/chain';
import type { DappListSortKeyType } from '@/types/sortKey';
import { chunkArray } from '@/utils/array';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import ChipTypeButton from './-components/ChipTypeButton';
import GridDappItem from './-components/GridDappItem';
import {
  CarouselContainer,
  CarouselWrapper,
  ChipButtonContainer,
  ChipButtonContentsContainer,
  Container,
  FilterContaienr,
  GridContainer,
  LeftChevronIconContainer,
  SortConditionContainer,
  StickyContentsContainer,
} from './-styled';

import PopularIcon from '@/assets/images/icons/Popular16.svg';
import RightChevronIcon from '@/assets/images/icons/RightChevron20.svg';

const dappList = [
  {
    id: 1,
    name: '1inch',
    description:
      'The 1inch Network unites decentralized protocols whose synergy enables the most lucrative, fastest and protected operations in the DeFi space.',
    thumbnail: 'https://raw.githubusercontent.com/cosmostation/chainlist/ecosystem_dev/wallet_mobile/resource/1inch.png',
    link: 'https://app.1inch.io',
    chains: ['ethereum', 'arbitrum', 'avalanche', 'fantom', 'kaia', 'optimism', 'polygon', 'bnb-smart-chain'],
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
  {
    id: 5,
    name: 'Eigenlayer',
    description: 'EigenLayer lets Ethereum users restake assets to support other protocols and earn extra rewards.',
    thumbnail: 'https://raw.githubusercontent.com/cosmostation/chainlist/master/wallet_mobile/mobile_ecosystem/ethereum/resource/eigenlayer.png',
    link: 'https://app.eigenlayer.xyz',
    chains: ['ethereum'],
    socials: {
      github: 'https://github.com/eigenfoundation',
      twitter: 'https://x.com/eigenlayer',
      discord: 'https://discord.com/invite/eigenlayer',
    },
    type: 'Liquid staking',
  },
];

const DEFAULT_DAPP_TYPE = 'Popular';
const ALL_DAPP_TYPE = 'All';

export default function Entry() {
  const { t } = useTranslation();

  const { pinnedDappIds } = useExtensionStorageStore((state) => state);

  const { flatChainList } = useChainList();

  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);

  const [currentDappTypeButtonPage, setCurrentDappTypeButtonPate] = useState(0);
  const [selectedDappType, setSelectedDappType] = useState(DEFAULT_DAPP_TYPE);

  const [currentSelectedChainId, setCurrentSelectedChainId] = useState<UniqueChainId | undefined>();
  const [isShowPinnedOnly, setIsShowPinnedOnly] = useState(false);

  const isDebouncing = !!search && isPending();

  const [sortOption, setSortOption] = useState<DappListSortKeyType>(DAPP_LIST_SORT_KEY.ALPHABETICAL_ASC);
  const [isOpenSortBottomSheet, setIsOpenSortBottomSheet] = useState(false);

  const dappTypeList = useMemo(() => {
    const aggregatedDappTypes = dappList.reduce((acc, dapp) => {
      if (!acc.includes(dapp?.type || '')) {
        acc.push(dapp?.type || '');
      }
      return acc;
    }, [] as string[]);

    return [DEFAULT_DAPP_TYPE, ALL_DAPP_TYPE, ...aggregatedDappTypes];
  }, []);

  const dappTypeListChunk = useMemo(() => chunkArray(dappTypeList, 5), [dappTypeList]);

  const sortedDappList = useMemo(() => {
    return dappList
      .sort((a, b) => {
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
  }, [pinnedDappIds, sortOption]);

  const filteredDappList = useMemo(() => {
    const filteredBySortOption =
      sortOption === DAPP_LIST_SORT_KEY.IS_MULTICHAIN_SUPPORT ? sortedDappList.filter((dapp) => dapp.chains.length > 1) : sortedDappList;
    const filteredByPinned = isShowPinnedOnly ? filteredBySortOption.filter((dapp) => pinnedDappIds.includes(dapp.id)) : filteredBySortOption;

    const filteredByType = (() => {
      if (selectedDappType === DEFAULT_DAPP_TYPE) {
        return filteredByPinned.filter((dapp) => dapp.is_default);
      }
      if (selectedDappType === ALL_DAPP_TYPE) {
        return filteredByPinned;
      }
      return filteredByPinned.filter((dapp) => dapp.type === selectedDappType);
    })();

    const filteredDappsByChain = currentSelectedChainId ? filteredByType.filter((dapp) => dapp.chains.includes(currentSelectedChainId)) : filteredByType;

    if (!!search && debouncedSearch.length > 1) {
      return (
        filteredDappsByChain.filter((asset) => {
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

            <CarouselWrapper>
              <IconButton
                sx={{
                  width: 'fit-content',
                  height: 'fit-content',
                  visibility: currentDappTypeButtonPage === 0 ? 'hidden' : 'visible',
                }}
                disabled={currentDappTypeButtonPage === 0}
                onClick={() => setCurrentDappTypeButtonPate(currentDappTypeButtonPage - 1)}
              >
                <LeftChevronIconContainer>
                  <RightChevronIcon />
                </LeftChevronIconContainer>
              </IconButton>
              <CarouselContainer>
                <Carousel
                  hideIndicator
                  currentIndex={currentDappTypeButtonPage}
                  onClickNext={() => setCurrentDappTypeButtonPate(currentDappTypeButtonPage + 1)}
                  onClickPrev={() => setCurrentDappTypeButtonPate(currentDappTypeButtonPage - 1)}
                >
                  {dappTypeListChunk.map((dappTypeListChunk, index) => (
                    <ChipButtonContainer key={index}>
                      {dappTypeListChunk.map((type) => (
                        <ChipTypeButton
                          key={type}
                          isActive={selectedDappType === type}
                          onClick={() => {
                            setSelectedDappType(type);
                          }}
                        >
                          <ChipButtonContentsContainer>
                            {type === DEFAULT_DAPP_TYPE && <PopularIcon />}
                            <Typography variant="h4_B">{type}</Typography>
                          </ChipButtonContentsContainer>
                        </ChipTypeButton>
                      ))}
                    </ChipButtonContainer>
                  ))}
                </Carousel>
              </CarouselContainer>
              <IconButton
                sx={{
                  width: 'fit-content',
                  height: 'fit-content',
                  visibility: currentDappTypeButtonPage === dappTypeListChunk.length - 1 ? 'hidden' : 'visible',
                }}
                onClick={() => setCurrentDappTypeButtonPate(currentDappTypeButtonPage + 1)}
              >
                <RightChevronIcon />
              </IconButton>
            </CarouselWrapper>
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
                isChecked={isShowPinnedOnly}
                onClick={() => {
                  setIsShowPinnedOnly(!isShowPinnedOnly);
                }}
              >
                <Typography variant="b3_R">{t('pages.dapp-list.entry.pinnedDapps')}</Typography>
              </CheckBoxTextButton>
            </SortConditionContainer>
          </StickyContentsContainer>
          <GridContainer>
            {filteredDappList.map((dapp) => {
              return <GridDappItem key={dapp.id} dappItemInfo={dapp} />;
            })}
          </GridContainer>
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
