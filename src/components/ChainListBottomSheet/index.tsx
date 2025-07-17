import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import Typography from '@mui/material/Typography';
import { useNavigate } from '@tanstack/react-router';

import { ADDRESS_FORMAT_MAPPING } from '@/constants/bitcoin/common';
import { DEFAULT_MAJOR_CHAINS } from '@/constants/common';
import { CHAINLIST_SORT_KEY } from '@/constants/sortKey';
import { usePortfolioValuesByChain } from '@/hooks/current/usePortfolioValuesByChain';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useChainList } from '@/hooks/useChainList';
import { useChangeCoinAccountType } from '@/hooks/useChangeCoinAccountType';
import { useCurrentPreferAccountTypes } from '@/hooks/useCurrentPreferAccountTypes';
import { Route as SwitchAccountType } from '@/pages/manage-assets/switch-accout-type';
import CoinTypeBottomSheet from '@/pages/manage-assets/switch-accout-type/-components/CoinTypeBottomSheet';
import { Route as ManageCustomNetwork } from '@/pages/manage-assets/visibility/network';
import type { FlatAccountAssets } from '@/types/accountAssets';
import type { ChainAccountType, ChainBase, UniqueChainId } from '@/types/chain';
import type { ChainlistSortKeyType } from '@/types/sortKey';
import { getMainAssetByChainId } from '@/utils/asset';
import { isTestnetChain } from '@/utils/chain';
import { devLogger } from '@/utils/devLogger';
import { equal, minus, plus } from '@/utils/numbers';
import { getUniqueChainId, isMatchingUniqueChainId, isSameChain } from '@/utils/queryParamGenerator';
import { toastError, toastSuccess } from '@/utils/toast';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import OptionButton from './components/OptionButton';
import { AmountContainer } from './components/OptionButton/styled';
import {
  Body,
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
} from './styled';
import BalanceDisplay from '../BalanceDisplay';
import BalanceSyncStatusIcon from '../BalanceSyncStatusIcon';
import Base1000Text from '../common/Base1000Text';
import Base1300Text from '../common/Base1300Text';
import IconTextButton from '../common/IconTextButton';
import Search from '../Search';
import SortBottomSheet from '../SortBottomSheet';

import ChangeIcon from 'assets/images/icons/Change14.svg';
import Close24Icon from 'assets/images/icons/Close24.svg';
import CustomNetworkIcon from 'assets/images/icons/CustomNetwork28.svg';
import RightChevronIcon from 'assets/images/icons/RightChevron20.svg';

import AllNetworkImage from 'assets/images/network.png';

interface ChainWithValue extends ChainBase {
  isActive: boolean;
  value: string;
  mainAsset?: FlatAccountAssets;
}

interface CategorizedChain {
  testnet: ChainWithValue[];
  mainnet: ChainWithValue[];
}

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
  const ref = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const { userCurrencyPreference, chainListSortKey, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);
  const { currentPreferAccountType } = useCurrentPreferAccountTypes();
  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
  });

  const { flatChainList } = useChainList();

  const { changeCoinType } = useChangeCoinAccountType();
  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);

  const isDebouncing = !!search && isPending();

  const AllNetworkOptionId = undefined;

  const { portfolioValuesByChain } = usePortfolioValuesByChain();

  const totalValue = isShowValue
    ? portfolioValuesByChain.reduce((acc, item) => {
        return plus(acc, item.totalValue);
      }, '0')
    : '0';

  const categorizedChainsWithValue = useMemo(() => {
    return chainList.reduce(
      (acc: CategorizedChain, item) => {
        const isActive = isMatchingUniqueChainId(item, currentChainId);
        const value = portfolioValuesByChain.find((chain) => isSameChain(chain.chain, item));
        const mainAsset = customType === 'manageAssets' ? getMainAssetByChainId(accountAllAssets?.flatAccountAssets, getUniqueChainId(item)) : undefined;

        const chainWithValue: ChainWithValue = {
          ...item,
          isActive: isActive,
          value: value?.totalValue || '0',
          mainAsset,
        };

        (isTestnetChain(chainWithValue.id) ? acc.testnet : acc.mainnet).push(chainWithValue);

        return acc;
      },
      { testnet: [], mainnet: [] },
    );
  }, [accountAllAssets?.flatAccountAssets, chainList, currentChainId, customType, portfolioValuesByChain]);

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

  const chainsCount = chainList.length.toString();

  const currentTempChain = flatChainList.find((chain) => isMatchingUniqueChainId(chain, selectedChangeCoinTypeChainId));

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

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

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
          <Body>
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
            {!isDebouncing &&
              filteredChainList.mainnet?.length > 0 &&
              filteredChainList.mainnet.map((item) => {
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
                    key={getUniqueChainId(item)}
                    isActive={item.isActive}
                    ref={item.isActive ? ref : undefined}
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
                      isShowValue ? (
                        <AmountContainer>
                          <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency={userCurrencyPreference}>
                            {item.value}
                          </BalanceDisplay>
                        </AmountContainer>
                      ) : undefined
                    }
                  />
                );
              })}

            {!isDebouncing &&
              filteredChainList.testnet?.length > 0 &&
              filteredChainList.testnet.map((item) => {
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
                    key={getUniqueChainId(item)}
                    isActive={item.isActive}
                    ref={item.isActive ? ref : undefined}
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
                                  <Base1000Text variant="h6n_M">{coinTypeText}</Base1000Text>
                                </span>
                              </Base1000Text>
                            </IconTextButton>
                          ) : undefined}
                        </CoinTypeButtonContainer>
                      ) : undefined
                    }
                  />
                );
              })}
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
