import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import { ADDRESS_FORMAT_MAPPING } from '@/constants/bitcoin/common';
import { DEFAULT_MAJOR_CHAINS } from '@/constants/common';
import { CHAINLIST_SORT_KEY } from '@/constants/sortKey';
import { usePortfolioValuesByChain } from '@/hooks/current/usePortfolioValuesByChain';
import { useChangeCoinAccountType } from '@/hooks/useChangeCoinAccountType';
import { useCurrentPreferAccountTypes } from '@/hooks/useCurrentPreferAccountTypes';
import { Route as SwitchAccountType } from '@/pages/manage-assets/switch-accout-type';
import CoinTypeBottomSheet from '@/pages/manage-assets/switch-accout-type/-components/CoinTypeBottomSheet';
import { Route as ManageCustomNetwork } from '@/pages/manage-assets/visibility/network';
import type { ChainAccountType, ChainBase, UniqueChainId } from '@/types/chain';
import type { ChainlistSortKeyType } from '@/types/sortKey';
import { devLogger } from '@/utils/devLogger';
import { equal, minus, plus } from '@/utils/numbers';
import { getUniqueChainId, isMatchingUniqueChainId, isSameChain } from '@/utils/queryParamGenerator';
import { toastError, toastSuccess } from '@/utils/toast';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import OptionButton from './components/OptionButton';
import { AmountContainer } from './components/OptionButton/styled';
import {
  Body,
  ChainButtonWrapper,
  ChainNameContainer,
  ChevronIconContainer,
  CoinTypeButtonContainer,
  Container,
  CustomNetworkButton,
  CustomNetworkTextContaienr,
  FilterContaienr,
  Header,
  HeaderTitle,
  ManageAssetsContaienr,
  NetworkCounts,
  NetworkInfoContainer,
  StickyContainer,
  StyledBottomSheet,
  StyledButton,
  SwtichCoinType,
  VirtualizedListContainer,
} from './styled';
import BalanceDisplay from '../BalanceDisplay';
import BalanceSyncStatusIcon from '../BalanceSyncStatusIcon';
import Base1000Text from '../common/Base1000Text';
import Base1300Text from '../common/Base1300Text';
import IconTextButton from '../common/IconTextButton';
import { ForwardRefVirtualizedList } from '../common/VirtualizedList/ForwardRefVirtualizedList';
import Search from '../Search';
import SortBottomSheet from '../SortBottomSheet';

import ChangeIcon from 'assets/images/icons/Change14.svg';
import Close24Icon from 'assets/images/icons/Close24.svg';
import CustomNetworkIcon from 'assets/images/icons/CustomNetwork28.svg';
import RightChevronIcon from 'assets/images/icons/RightChevron20.svg';

import AllNetworkImage from 'assets/images/network.png';

type ChainListBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  chainList: ChainBase[];
  currentChainId?: UniqueChainId;
  disableAllNetwork?: boolean;
  disableSort?: boolean;
  title?: string;
  searchPlaceholder?: string;
  customType?: 'normal' | 'manageAssets';
  isShowValue?: boolean;
  buttonVarients?: 'indicator' | 'label';
  onClickChain: (id?: UniqueChainId) => void;
};

export default function ChainListBottomSheet({
  currentChainId,
  chainList,
  onClose,
  onClickChain,
  disableAllNetwork = false,
  disableSort = false,
  title,
  searchPlaceholder,
  customType = 'normal',
  isShowValue = false,
  buttonVarients = 'indicator',
  ...remainder
}: ChainListBottomSheetProps) {
  const [isOpenSortBottomSheet, setIsOpenSortBottomSheet] = useState(false);
  const [selectedChangeCoinTypeChainId, setSelectedChangeCoinTypeChainId] = useState<UniqueChainId | undefined>();

  const { t } = useTranslation();
  const bodyRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const userCurrencyPreference = useExtensionStorageStore((state) => state.userCurrencyPreference);
  const chainListSortKey = useExtensionStorageStore((state) => state.chainListSortKey);
  const updateExtensionStorageStore = useExtensionStorageStore((state) => state.updateExtensionStorageStore);

  const { currentPreferAccountType } = useCurrentPreferAccountTypes();

  const { changeCoinType } = useChangeCoinAccountType();
  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);

  const isDebouncing = !!search && isPending();

  const AllNetworkOptionId = undefined;

  const { portfolioValuesByChain, categorizedChainsWithValue } = usePortfolioValuesByChain({
    chainList,
    currentChainId,
    isManageAsset: customType === 'manageAssets',
  });

  const totalValue = useMemo(
    () =>
      isShowValue
        ? portfolioValuesByChain.reduce((acc, item) => {
            return plus(acc, item.totalValue);
          }, '0')
        : '0',
    [isShowValue, portfolioValuesByChain],
  );

  const sortedChainList = useMemo(
    () =>
      disableSort
        ? categorizedChainsWithValue
        : {
            testnet: [...categorizedChainsWithValue.testnet].sort((a, b) => {
              return a.name.localeCompare(b.name);
            }),
            mainnet: [...categorizedChainsWithValue.mainnet].sort((a, b) => {
              const aIndex = DEFAULT_MAJOR_CHAINS.findIndex((defaultChain) => isSameChain(defaultChain, a));
              const bIndex = DEFAULT_MAJOR_CHAINS.findIndex((defaultChain) => isSameChain(defaultChain, b));

              if (aIndex !== -1 || bIndex !== -1) {
                return (aIndex === -1 ? Infinity : aIndex) - (bIndex === -1 ? Infinity : bIndex);
              }

              if (chainListSortKey === CHAINLIST_SORT_KEY.VALUE_HIGH_ORDER) {
                if (equal(b.value, a.value)) {
                  return a.name.localeCompare(b.name);
                }

                return Number(minus(b.value, a.value));
              }

              if (chainListSortKey === CHAINLIST_SORT_KEY.ALPHABETICAL_ASC) {
                return a.name.localeCompare(b.name);
              }

              return 0;
            }),
          },

    [chainListSortKey, disableSort, categorizedChainsWithValue],
  );

  const filteredChainList = useMemo(() => {
    if (!!search && debouncedSearch.length > 1) {
      return {
        testnet: sortedChainList.testnet?.filter((chain) => chain.name.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1),
        mainnet: sortedChainList.mainnet?.filter((chain) => chain.name.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1),
      };
    }
    return sortedChainList;
  }, [debouncedSearch, search, sortedChainList]);

  const mergedChainList = useMemo(
    () => [...(filteredChainList.mainnet || []), ...(filteredChainList.testnet || [])],
    [filteredChainList.mainnet, filteredChainList.testnet],
  );

  const chainsCount = chainList.length.toString();

  const currentTempChain = useMemo(
    () => chainList.find((chain) => isMatchingUniqueChainId(chain, selectedChangeCoinTypeChainId)),
    [chainList, selectedChangeCoinTypeChainId],
  );

  const activeItemIndex = useMemo(() => mergedChainList.findIndex((item) => item.isActive), [mergedChainList]);

  const handleClose = () => {
    setSearch('');
    onClose?.({}, 'backdropClick');
  };

  const handleChangeAccountType = useCallback(
    async (id: string, accountType: ChainAccountType) => {
      try {
        await changeCoinType(id, accountType);
        toastSuccess(t('pages.manage-assets.switch-account-type.entry.successSwitch'));
        setSelectedChangeCoinTypeChainId(undefined);
      } catch (error) {
        devLogger.error(`[ChangeAccountType in ChainlistBottomSheet] Error`, error);
        toastError(t('pages.manage-assets.switch-account-type.entry.failSwitch'));
        setSelectedChangeCoinTypeChainId(undefined);
      }
    },
    [changeCoinType, t],
  );

  return (
    <>
      <StyledBottomSheet {...remainder} onClose={handleClose}>
        <Container>
          <Header>
            <HeaderTitle>
              <Typography variant="h2_B">{title || t('components.ChainListBottomSheet.index.title')}</Typography>
            </HeaderTitle>
            <StyledButton onClick={handleClose}>
              <Close24Icon />
            </StyledButton>
          </Header>
          <FilterContaienr>
            <Search
              value={search}
              onChange={(event) => {
                setSearch(event.currentTarget.value);
              }}
              searchPlaceholder={searchPlaceholder || t('components.ChainListBottomSheet.index.searchPlaceholder')}
              isPending={isDebouncing}
              onClickFilter={() => {
                setIsOpenSortBottomSheet(true);
              }}
              onClear={() => {
                setSearch('');
                cancel();
              }}
            />
          </FilterContaienr>
          <Body ref={bodyRef}>
            {customType === 'manageAssets' && (
              <ManageAssetsContaienr>
                <CustomNetworkButton
                  onClick={() => {
                    navigate({
                      to: ManageCustomNetwork.to,
                    });
                  }}
                  leftContent={<CustomNetworkIcon />}
                  leftSecondBody={
                    <CustomNetworkTextContaienr>
                      <Base1300Text variant="b3_M_Multiline">{t('components.ChainListBottomSheet.index.customNetwork')}</Base1300Text>
                    </CustomNetworkTextContaienr>
                  }
                />
                <NetworkInfoContainer>
                  <Base1300Text variant={'h4_B'}>
                    {t('components.ChainListBottomSheet.index.network')}
                    &nbsp;
                    <NetworkCounts>{chainsCount}</NetworkCounts>
                  </Base1300Text>

                  <IconTextButton
                    onClick={() => {
                      navigate({
                        to: SwitchAccountType.to,
                      });
                    }}
                    leadingIcon={<ChangeIcon />}
                  >
                    <SwtichCoinType>
                      <Typography variant="b3_M">{t('components.ChainListBottomSheet.index.switchCoinType')}</Typography>
                    </SwtichCoinType>
                  </IconTextButton>
                </NetworkInfoContainer>
              </ManageAssetsContaienr>
            )}
            <ChainButtonWrapper>
              {!disableAllNetwork && !isDebouncing && (
                <StickyContainer>
                  <OptionButton
                    key={'all-network'}
                    isActive={!currentChainId}
                    onSelectChain={(id) => {
                      onClickChain(id);
                      handleClose();
                    }}
                    name={t('components.ChainListBottomSheet.index.allNetwork')}
                    image={AllNetworkImage}
                    id={AllNetworkOptionId}
                    varient={buttonVarients}
                    rightComponent={
                      isShowValue ? (
                        <AmountContainer>
                          <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency={userCurrencyPreference}>
                            {totalValue}
                          </BalanceDisplay>
                        </AmountContainer>
                      ) : undefined
                    }
                  />
                </StickyContainer>
              )}
              <VirtualizedListContainer>
                {!isDebouncing && mergedChainList.length > 0 && (
                  <ForwardRefVirtualizedList
                    items={mergedChainList}
                    estimateSize={() => 60}
                    renderItem={(item, virtualItem) => {
                      const multiPath = currentPreferAccountType?.[item.id];
                      const coinTypeText = (() => {
                        if (multiPath) {
                          const hdPathParts = multiPath?.hdPath.split('/');
                          const coinTypeLevel = item?.chainType === 'bitcoin' ? hdPathParts?.[1] : hdPathParts?.[2];
                          const addressTypeLabel = (() => {
                            if (item.chainType === 'bitcoin') {
                              return ADDRESS_FORMAT_MAPPING[coinTypeLevel as keyof typeof ADDRESS_FORMAT_MAPPING];
                            }
                            return t('pages.manage-assets.switch-account-type.entry.type', {
                              accountType: coinTypeLevel,
                            });
                          })();
                          return addressTypeLabel;
                        }
                        return undefined;
                      })();
                      return (
                        <OptionButton
                          key={getUniqueChainId(item) + virtualItem.index}
                          isActive={item.isActive}
                          onSelectChain={(id) => {
                            onClickChain(id);
                            handleClose();
                          }}
                          name={item.name}
                          image={item.image}
                          id={getUniqueChainId(item)}
                          varient={buttonVarients}
                          leftSecondHeader={
                            customType === 'manageAssets' ? (
                              <CoinTypeButtonContainer>
                                <ChainNameContainer>
                                  <Base1300Text variant="b2_M">{item.name}</Base1300Text>
                                  {item.mainAsset?.lastUpdatedAtMs && <BalanceSyncStatusIcon lastUpdatedAtMs={item.mainAsset.lastUpdatedAtMs} />}
                                </ChainNameContainer>
                                {multiPath && coinTypeText ? (
                                  <IconTextButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedChangeCoinTypeChainId(getUniqueChainId(item));
                                    }}
                                    disabled={!multiPath}
                                    trailingIcon={
                                      multiPath ? (
                                        <ChevronIconContainer>
                                          <RightChevronIcon />
                                        </ChevronIconContainer>
                                      ) : undefined
                                    }
                                  >
                                    <Base1000Text variant="b4_R">
                                      {'Selected :'}
                                      &nbsp;
                                      <span>
                                        <Base1000Text variant="b4_M">{coinTypeText}</Base1000Text>
                                      </span>
                                    </Base1000Text>
                                  </IconTextButton>
                                ) : undefined}
                              </CoinTypeButtonContainer>
                            ) : undefined
                          }
                          rightComponent={
                            isShowValue && !item.isTestnet ? (
                              <AmountContainer>
                                <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency={userCurrencyPreference}>
                                  {item.value}
                                </BalanceDisplay>
                              </AmountContainer>
                            ) : undefined
                          }
                        />
                      );
                    }}
                    overscan={5}
                    ref={bodyRef}
                    scrollToIndex={activeItemIndex}
                  />
                )}
              </VirtualizedListContainer>
            </ChainButtonWrapper>
          </Body>
        </Container>
      </StyledBottomSheet>
      <SortBottomSheet
        optionButtonProps={[
          {
            sortKey: CHAINLIST_SORT_KEY.VALUE_HIGH_ORDER,
            children: <Typography variant="b2_M">{t('components.ChainListBottomSheet.index.valueHighOrder')}</Typography>,
          },
          {
            sortKey: CHAINLIST_SORT_KEY.ALPHABETICAL_ASC,
            children: <Typography variant="b2_M">{t('components.ChainListBottomSheet.index.alphabeticalAsc')}</Typography>,
          },
        ]}
        currentSortOption={chainListSortKey}
        open={isOpenSortBottomSheet}
        onClose={() => setIsOpenSortBottomSheet(false)}
        onSelectSortOption={(val) => {
          updateExtensionStorageStore('chainListSortKey', val as ChainlistSortKeyType);
        }}
      />
      <CoinTypeBottomSheet
        open={!!currentTempChain}
        onClose={() => {
          setSelectedChangeCoinTypeChainId(undefined);
        }}
        chain={currentTempChain}
        onClickChainType={handleChangeAccountType}
      />
    </>
  );
}
