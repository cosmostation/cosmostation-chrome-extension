import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import CheckLegacyAddressBalanceBottomSheet from '@/components/CheckLegacyAddressBalanceBottomSheet';
import CoinWithMarketTrendButton from '@/components/CoinWithMarketTrendButton';
import CheckBoxTextButton from '@/components/common/CheckBoxTextButton';
import IconTextButton from '@/components/common/IconTextButton';
import { Tab, Tabs } from '@/components/common/Tab';
import { VirtualizedList } from '@/components/common/VirtualizedList';
import EmptyAsset from '@/components/EmptyAsset';
import PortFolio from '@/components/MainBox/Portfolio';
import Search from '@/components/Search';
import SortBottomSheet from '@/components/SortBottomSheet';
import { useScroll } from '@/components/Wrapper/components/ScrollProvider';
import { CURRENCY_TYPE } from '@/constants/currency';
import { DASHBOARD_COIN_SORT_KEY } from '@/constants/sortKey';
import { useAutoBalanceRefresh } from '@/hooks/update/useAutoBalanceRefresh';
import { useUpdateBalance } from '@/hooks/update/useUpdateBalance';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useCurrentAccountAddedNFTsWithMetaData } from '@/hooks/useCurrentAccountAddedNFTsWithMetaData';
import { useGroupAccountAssets } from '@/hooks/useGroupAccountAssets';
import { Route as CoinDetail } from '@/pages/coin-detail/$coinId';
import { Route as CoinOverview } from '@/pages/coin-overview/$coinId';
import { Route as ManageAssets } from '@/pages/manage-assets/visibility/assets';
import type { FlatAccountAssets } from '@/types/accountAssets';
import type { DashboardCoinSortKeyType } from '@/types/sortKey';
import { getDefaultAssets, getFilteredAssetsByChainId, isStakeableAsset } from '@/utils/asset';
import { isTestnetChain } from '@/utils/chain';
import { gt, gte, minus, times, toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId } from '@/utils/queryParamGenerator';
import { isEqualsIgnoringCase } from '@/utils/string';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import NFTList from './-components/NFTList';
import SkeletonCoinList from './-components/SkeletonCoinList';
import {
  CoinButtonWrapper,
  Container,
  EmptyAssetContainer,
  FilterContaienr,
  ManageCryptoContainer,
  MarginLeftTypography,
  StickyTabContainer,
  StickyTabPanelContentsContainer,
  StyledTabPanel,
} from './-styled';

import NoListIcon from '@/assets/images/icons/NoList70.svg';
import PlusIcon from '@/assets/images/icons/Plus12.svg';

type PortfolioCoinItem = FlatAccountAssets & {
  value: string;
  dollarValue: string;
  totalDisplayAmount: string;
  counts: string;
};

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { scrollToTop } = useScroll();
  const { isLoading: isUpdateBalanceLoading } = useUpdateBalance();

  const { data: accountAllAssets } = useAccountAllAssets({ filterByPreferAccountType: true });
  const { data: coinGeckoPrice, isLoading: isCoinGeckoPriceLoading } = useCoinGeckoPrice();
  const { data: usdCoinGeckoPrice, isLoading: isCoinGeckoPriceUSDLoading } = useCoinGeckoPrice('usd');

  const dashboardCoinSortKey = useExtensionStorageStore((state) => state.dashboardCoinSortKey);
  const userCurrencyPreference = useExtensionStorageStore((state) => state.userCurrencyPreference);
  const isHideSmalValue = useExtensionStorageStore((state) => state.isHideSmalValue);
  const selectedChainFilterId = useExtensionStorageStore((state) => state.selectedChainFilterId);
  const updateExtensionStorageStore = useExtensionStorageStore((state) => state.updateExtensionStorageStore);

  useAutoBalanceRefresh(selectedChainFilterId && [selectedChainFilterId]);
  useCurrentAccountAddedNFTsWithMetaData();
  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);

  const isDebouncing = !!search && isPending();

  const [isOpenSortBottomSheet, setIsOpenSortBottomSheet] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const tabLabels = ['Crypto', 'NFTs'];

  const { groupAccountAssets, isLoading: isGroupAssetsLoading } = useGroupAccountAssets();

  const isFirstBalanceLoading = !groupAccountAssets?.singleAccountAssets.length && !groupAccountAssets?.groupAccountAssets.length && isUpdateBalanceLoading;
  const isLoading = isFirstBalanceLoading || isGroupAssetsLoading || isCoinGeckoPriceLoading || isCoinGeckoPriceUSDLoading;

  const chainDefaultCoins = useMemo<PortfolioCoinItem[] | undefined>(() => {
    const chainFilteredAllCoins = getFilteredAssetsByChainId(accountAllAssets?.flatAccountAssets, selectedChainFilterId || undefined);

    const chainDefaultCoins = getDefaultAssets(chainFilteredAllCoins)
      ?.slice()
      .sort((a, b) => {
        const denoms = a.chain.chainDefaultCoinDenoms ?? [];
        const idxA = denoms.findIndex((d) => isEqualsIgnoringCase(d, a.asset.id));
        const idxB = denoms.findIndex((d) => isEqualsIgnoringCase(d, b.asset.id));

        return (idxA < 0 ? Number.MAX_SAFE_INTEGER : idxA) - (idxB < 0 ? Number.MAX_SAFE_INTEGER : idxB);
      });

    if (!chainDefaultCoins || chainDefaultCoins?.length === 0) return undefined;

    return chainDefaultCoins.map((item) => {
      const balance = isStakeableAsset(item) ? item.totalBalance || '0' : item.balance;
      const totalDisplayAmount = toDisplayDenomAmount(balance, item.asset.decimals) || '0';

      const coinPrice = (item.asset.coinGeckoId && coinGeckoPrice?.[item.asset.coinGeckoId]?.[userCurrencyPreference]) || 0;
      const coinPriceInDolalr = (item.asset.coinGeckoId && usdCoinGeckoPrice?.[item.asset.coinGeckoId]?.[CURRENCY_TYPE.USD]) || 0;

      const value = times(totalDisplayAmount, coinPrice);
      const valueInDollar = times(totalDisplayAmount, coinPriceInDolalr);
      return {
        ...item,
        counts: '1',
        totalDisplayAmount,
        value,
        dollarValue: valueInDollar,
      };
    });
  }, [accountAllAssets?.flatAccountAssets, coinGeckoPrice, selectedChainFilterId, usdCoinGeckoPrice, userCurrencyPreference]);

  const computedAssetValues = useMemo<PortfolioCoinItem[]>(() => {
    const baseCoinList = [...(groupAccountAssets?.groupAccountAssets || []), ...(groupAccountAssets?.singleAccountAssets || [])];

    const unGroupedAccountAssets = Object.values(groupAccountAssets?.groupMap || []).flat();
    const mappedUngroupAccountAssets = unGroupedAccountAssets.map((item) => {
      const balance = isStakeableAsset(item) ? item.totalBalance || '0' : item.balance;
      const totalDisplayAmount = toDisplayDenomAmount(balance, item.asset.decimals);

      return {
        ...item,
        counts: '1',
        totalDisplayAmount,
      };
    });

    const displayedAssets =
      (!!search && debouncedSearch.length > 1) || selectedChainFilterId
        ? [...mappedUngroupAccountAssets, ...(groupAccountAssets?.singleAccountAssets || [])]
        : baseCoinList;

    return displayedAssets.map((item) => {
      const displayAmount = item.totalDisplayAmount || '0';

      const coinPrice = (item.asset.coinGeckoId && coinGeckoPrice?.[item.asset.coinGeckoId]?.[userCurrencyPreference]) || 0;
      const coinPriceInDolalr = (item.asset.coinGeckoId && usdCoinGeckoPrice?.[item.asset.coinGeckoId]?.[CURRENCY_TYPE.USD]) || 0;

      const value = times(displayAmount, coinPrice);
      const valueInDollar = times(displayAmount, coinPriceInDolalr);

      return {
        ...item,
        value,
        dollarValue: valueInDollar,
      };
    });
  }, [
    coinGeckoPrice,
    debouncedSearch.length,
    groupAccountAssets?.groupAccountAssets,
    groupAccountAssets?.groupMap,
    groupAccountAssets?.singleAccountAssets,
    search,
    selectedChainFilterId,
    usdCoinGeckoPrice,
    userCurrencyPreference,
  ]);

  const hideSmallValueAssets = useMemo(() => {
    if (isHideSmalValue) {
      return computedAssetValues.filter((coin) => {
        return gte(coin.dollarValue, '1');
      });
    }

    return computedAssetValues;
  }, [computedAssetValues, isHideSmalValue]);

  const sortedAssets = useMemo(
    () =>
      hideSmallValueAssets.toSorted((a, b) => {
        if (dashboardCoinSortKey === DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER) {
          return Number(minus(b.value, a.value));
        }

        if (dashboardCoinSortKey === DASHBOARD_COIN_SORT_KEY.ALPHABETICAL_ASC) {
          return a.asset.symbol.localeCompare(b.asset.symbol);
        }

        return 0;
      }),
    [dashboardCoinSortKey, hideSmallValueAssets],
  );

  const filteredAssetsBySearch = useMemo(() => {
    const filterdByChain = getFilteredAssetsByChainId(sortedAssets, selectedChainFilterId || undefined);
    if (!!search && debouncedSearch.length > 1) {
      return (
        filterdByChain.filter((asset) => {
          const condition = [asset.asset.symbol, asset.asset.id];

          return condition.some((item) => item.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1);
        }) || []
      );
    }
    if (selectedChainFilterId) {
      return [...(chainDefaultCoins || []), ...filterdByChain].reduce((acc: PortfolioCoinItem[], item) => {
        if (!acc.some((existing) => existing.asset.id === item.asset.id)) {
          acc.push(item as PortfolioCoinItem);
        }
        return acc;
      }, []);
    } else {
      return filterdByChain;
    }
  }, [chainDefaultCoins, debouncedSearch, search, selectedChainFilterId, sortedAssets]);

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  };

  useEffect(() => {
    if (search.length > 1 || search.length === 0) {
      scrollToTop();
    }
  }, [scrollToTop, search.length]);

  return (
    <>
      <BaseBody>
        <EdgeAligner
          style={{
            flex: '1',
          }}
        >
          <Container>
            <PortFolio
              selectedChainId={selectedChainFilterId || undefined}
              accountAllAssetsForValueAggregate={filteredAssetsBySearch}
              onChangeChaindId={(chainId) => {
                updateExtensionStorageStore('selectedChainFilterId', chainId || null);
              }}
            />

            <StickyTabContainer>
              <Tabs value={tabValue} onChange={handleChange} variant="fullWidth">
                {tabLabels.map((item) => (
                  <Tab key={item} label={item} />
                ))}
              </Tabs>
            </StickyTabContainer>
            <StyledTabPanel value={tabValue} index={0} data-is-active={tabValue === 0}>
              <StickyTabPanelContentsContainer>
                <FilterContaienr>
                  <Search
                    value={search}
                    onChange={(event) => {
                      setSearch(event.currentTarget.value);
                    }}
                    placeholder={t('pages.index.searchPlaceholder')}
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
                <ManageCryptoContainer>
                  <CheckBoxTextButton
                    isChecked={isHideSmalValue}
                    onClick={() => {
                      updateExtensionStorageStore('isHideSmalValue', !isHideSmalValue);
                    }}
                  >
                    <Typography variant="b3_R">{t('pages.index.hideSmallBalance')}</Typography>
                  </CheckBoxTextButton>
                  <IconTextButton
                    onClick={() => {
                      navigate({
                        to: ManageAssets.to,
                      });
                    }}
                    leadingIcon={<PlusIcon />}
                  >
                    <MarginLeftTypography variant="b3_M">{t('pages.index.manageCrypto')}</MarginLeftTypography>
                  </IconTextButton>
                </ManageCryptoContainer>
              </StickyTabPanelContentsContainer>
              <CoinButtonWrapper>
                {isLoading ? (
                  <SkeletonCoinList />
                ) : filteredAssetsBySearch.length > 0 ? (
                  <VirtualizedList
                    items={filteredAssetsBySearch}
                    estimateSize={() => 60}
                    renderItem={(coin, virtualItem) => {
                      if (!coin) return null;

                      const isGroupToken = gt(coin.counts || '0', '1');
                      const destinationRoute = isGroupToken ? CoinOverview.to : CoinDetail.to;

                      const resolvedSymbol = coin.asset.symbol + `${isTestnetChain(coin.chain.id) ? ' (Testnet)' : ''}`;
                      return (
                        <CoinWithMarketTrendButton
                          key={getCoinId(coin.asset) + virtualItem.index}
                          onClick={() => {
                            navigate({
                              to: destinationRoute,
                              params: {
                                coinId: getCoinId(coin.asset),
                              },
                            });
                          }}
                          fetchStatus={coin.fetchStatus?.balance}
                          displayAmount={coin.totalDisplayAmount || '0'}
                          symbol={resolvedSymbol}
                          coinGeckoId={coin.asset.coinGeckoId}
                          coinImageProps={{
                            imageURL: coin.asset.image,
                            isAggregatedCoin: gt(coin.counts || '0', '1'),
                            badgeImageURL: isGroupToken ? undefined : coin.chain.image || undefined,
                          }}
                        />
                      );
                    }}
                    overscan={5}
                  />
                ) : (
                  <EmptyAssetContainer>
                    <EmptyAsset icon={<NoListIcon />} title={t('pages.index.noTokens')} subTitle={t('pages.index.noTokensDescription')} />
                  </EmptyAssetContainer>
                )}
              </CoinButtonWrapper>
            </StyledTabPanel>
            <StyledTabPanel value={tabValue} index={1} data-is-active={tabValue === 1}>
              <NFTList selectedChainId={selectedChainFilterId || undefined} />
            </StyledTabPanel>
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
              onClose={() => setIsOpenSortBottomSheet(false)}
              onSelectSortOption={(val) => {
                updateExtensionStorageStore('dashboardCoinSortKey', val as DashboardCoinSortKeyType);
              }}
            />
          </Container>
        </EdgeAligner>
      </BaseBody>
      <CheckLegacyAddressBalanceBottomSheet />
    </>
  );
}
