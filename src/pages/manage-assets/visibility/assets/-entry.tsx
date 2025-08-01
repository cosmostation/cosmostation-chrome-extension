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
import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import { DASHBOARD_COIN_SORT_KEY } from '@/constants/sortKey';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useCurrentCustomCW20Tokens } from '@/hooks/useCurrentCustomCW20Tokens';
import { useCurrentCustomERC20Tokens } from '@/hooks/useCurrentCustomERC20Tokens';
import { useCurrentHiddenAssetIds } from '@/hooks/useCurrentHiddenAssetIds';
import { useCurrentVisibleAssetIds } from '@/hooks/useCurrentVisibleAssetIds';
import { useCustomAssets } from '@/hooks/useCustomAssets';
import { Route as ImportToken } from '@/pages/manage-assets/import/assets';
import type { FlatAccountAssets } from '@/types/accountAssets';
import type { UniqueChainId } from '@/types/chain';
import type { CommonSortKeyType } from '@/types/sortKey';
import { getFilteredAssetsByChainId, getFilteredChainsByChainId } from '@/utils/asset';
import { gt, minus, times, toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId, getCoinIdWithManual, isMatchingCoinId, isMatchingUniqueChainId, isSameCoin, parseCoinId } from '@/utils/queryParamGenerator';
import { isEqualsIgnoringCase, shorterAddress } from '@/utils/string';
import { toastError } from '@/utils/toast';
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

type FlatAccountAssetsWithValue = FlatAccountAssets & {
  value: string;
};

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { scrollToTop } = useScroll();
  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const userCurrencyPreference = useExtensionStorageStore((state) => state.userCurrencyPreference);
  const selectedChainFilterId = useExtensionStorageStore((state) => state.selectedChainFilterId);

  const { currentHiddenAssetIds, hideAsset, showAsset } = useCurrentHiddenAssetIds();

  const { currentVisibleAssetIds, removeVisibleAsset, addVisibleAsset } = useCurrentVisibleAssetIds();

  const { customHiddenAssetIds, hideCustomAsset, showCustomAsset } = useCustomAssets();

  const { currentCustomERC20Tokens, removeCustomERC20Token } = useCurrentCustomERC20Tokens();
  const { currentCustomCW20Tokens, removeCustomCW20Token } = useCurrentCustomCW20Tokens();

  const { data: currentAccountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
  });

  const { customAssets } = useCustomAssets();

  const [tokenToDelete, setTokenToDelete] = useState<FlatAccountAssetsWithValue | undefined>();

  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);
  const isDebouncing = !!search && isPending();

  const [isOpenSortBottomSheet, setIsOpenSortBottomSheet] = useState(false);
  const [sortOption, setSortOption] = useState<CommonSortKeyType>(DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER);

  const [userSelectedChainId, setUserSelectedChainId] = useState<UniqueChainId | undefined>();

  const currentSelectedChainId = useMemo(() => {
    if (selectedChainFilterId) {
      return selectedChainFilterId;
    }

    return userSelectedChainId;
  }, [selectedChainFilterId, userSelectedChainId]);

  const visibleAssetCoinIds = useMemo(() => currentVisibleAssetIds?.map((item) => getCoinIdWithManual(item)), [currentVisibleAssetIds]);

  const [initVisibleAssetCoinIds, setInitVisibleAssetCoinIds] = useState<string[] | undefined>(undefined);

  const hiddenAssetCoinIds = useMemo(() => currentHiddenAssetIds?.map((item) => getCoinIdWithManual(item)), [currentHiddenAssetIds]);

  const [initHiddenAssetCoinIds, setInitHiddenAssetCoinIds] = useState<string[] | undefined>(undefined);

  const hiddenCustomAssetCoinIds = useMemo(() => customHiddenAssetIds?.map((item) => getCoinIdWithManual(item)), [customHiddenAssetIds]);

  const [initHiddenCustomAssetCoinIds, setInitHiddenCustomAssetCoinIds] = useState<string[] | undefined>(undefined);

  const baseCoinList = useMemo(() => currentAccountAllAssets?.flatAccountAssets || [], [currentAccountAllAssets?.flatAccountAssets]);

  const chainList = useMemo(() => getFilteredChainsByChainId(baseCoinList), [baseCoinList]);

  const currentSelectedChain = useMemo(
    () => chainList.find((item) => isMatchingUniqueChainId(item, currentSelectedChainId)),
    [chainList, currentSelectedChainId],
  );

  const isShowAssetId = useMemo(() => !!currentSelectedChain || !!debouncedSearch, [currentSelectedChain, debouncedSearch]);

  const computedAssetValues = useMemo<FlatAccountAssetsWithValue[]>(() => {
    return (
      baseCoinList?.map((item) => {
        const displayAmount = toDisplayDenomAmount(item.balance, item.asset.decimals);

        const coinPrice = (item.asset.coinGeckoId && coinGeckoPrice?.[item.asset.coinGeckoId]?.[userCurrencyPreference]) || 0;

        const value = times(displayAmount, coinPrice, 10);

        return {
          ...item,
          value,
        };
      }) || []
    );
  }, [baseCoinList, coinGeckoPrice, userCurrencyPreference]);

  const sortedAssets = useMemo(
    () =>
      computedAssetValues.sort((a, b) => {
        if (sortOption === DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER) {
          return Number(minus(b.value, a.value));
        }

        if (sortOption === DASHBOARD_COIN_SORT_KEY.ALPHABETICAL_ASC) {
          return a.asset.symbol.localeCompare(b.asset.symbol);
        }

        return 0;
      }),
    [computedAssetValues, sortOption],
  );

  const filteredCoinListWithChain = useMemo(() => getFilteredAssetsByChainId(sortedAssets, currentSelectedChainId), [currentSelectedChainId, sortedAssets]);

  const filteredCoinListBySearch = useMemo(() => {
    const filteredAssetsByChain = filteredCoinListWithChain;

    const filteredAssetsBySearch = (() => {
      if (!!search && debouncedSearch.length > 1) {
        return (
          filteredAssetsByChain.filter((asset) => {
            const condition = [asset.asset.symbol, asset.asset.id];

            return condition.some((item) => item.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1);
          }) || []
        );
      }
      return filteredAssetsByChain;
    })();

    return filteredAssetsBySearch;
  }, [debouncedSearch, filteredCoinListWithChain, search]);

  const sortedCoinListByHidden = useMemo(() => {
    const mergedHiddenCoinIds = [...(initHiddenAssetCoinIds || []), ...(initHiddenCustomAssetCoinIds || [])];

    const visibleAssets = filteredCoinListBySearch.filter((item) => {
      const isCustomERC20Token = currentCustomERC20Tokens.some((token) => isMatchingCoinId(token, getCoinId(item.asset)));
      const isCustomCW20Token = currentCustomCW20Tokens.some((token) => isMatchingCoinId(token, getCoinId(item.asset)));

      const isVisibleAsset = initVisibleAssetCoinIds?.includes(getCoinId(item.asset));

      if (isCustomERC20Token || isCustomCW20Token || isVisibleAsset) {
        return true;
      }

      const isHidden = mergedHiddenCoinIds?.includes(getCoinId(item.asset));
      const isBalanceZero = item.balance === '0';

      if (isHidden || isBalanceZero) {
        return false;
      }
      return true;
    });

    const hiddenAssets = filteredCoinListBySearch.filter((item) => !visibleAssets.some((visibleAsset) => isSameCoin(visibleAsset.asset, item.asset)));

    const displayAssets = [...visibleAssets, ...hiddenAssets];

    return currentSelectedChainId
      ? displayAssets.sort((a, b) => {
          const denoms = a.chain.chainDefaultCoinDenoms ?? [];
          const idxA = denoms.findIndex((d) => isEqualsIgnoringCase(d, a.asset.id));
          const idxB = denoms.findIndex((d) => isEqualsIgnoringCase(d, b.asset.id));

          return (idxA < 0 ? Number.MAX_SAFE_INTEGER : idxA) - (idxB < 0 ? Number.MAX_SAFE_INTEGER : idxB);
        })
      : displayAssets;
  }, [
    currentCustomCW20Tokens,
    currentCustomERC20Tokens,
    currentSelectedChainId,
    filteredCoinListBySearch,
    initHiddenAssetCoinIds,
    initHiddenCustomAssetCoinIds,
    initVisibleAssetCoinIds,
  ]);

  const finalCoinList = useMemo(
    () =>
      sortedCoinListByHidden.map((coin) => {
        const currentCoinId = getCoinId(coin.asset);

        const currentCustomTokens = [...currentCustomERC20Tokens, ...currentCustomCW20Tokens];
        const customToken = currentCustomTokens.find((item) => isMatchingCoinId(item, currentCoinId));

        const isHiddenManagedAsset = hiddenAssetCoinIds?.includes(currentCoinId);
        const isHiddenCustomAsset = hiddenCustomAssetCoinIds?.includes(currentCoinId);

        const isCustomAsset = customAssets.some((item) => isMatchingCoinId(item, currentCoinId));

        const isHiddenAsset = isCustomAsset ? isHiddenCustomAsset : isHiddenManagedAsset;
        const isBalanceZero = coin.balance === '0';

        const isVisibleAsset = visibleAssetCoinIds?.includes(currentCoinId);

        const isHiddenState = (() => {
          if (customToken || isVisibleAsset) {
            return false;
          }

          if (isHiddenAsset || isBalanceZero) {
            return true;
          }
          return false;
        })();
        const displayAmount = toDisplayDenomAmount(coin.balance, coin.asset.decimals);

        const resolvedAssetId =
          coin.chain.mainAssetDenom === coin.asset.id || coin.asset.id === NATIVE_EVM_COIN_ADDRESS
            ? coin.asset.description
            : coin.asset.id.length > 15
              ? shorterAddress(coin.asset.id, 16)
              : coin.asset.id;
        return {
          ...coin,
          isHiddenState,
          displayAmount,
          resolvedAssetId,
          isBalanceZero,
          isCustomToken: !!customToken,
        };
      }),
    [
      currentCustomCW20Tokens,
      currentCustomERC20Tokens,
      customAssets,
      hiddenAssetCoinIds,
      hiddenCustomAssetCoinIds,
      sortedCoinListByHidden,
      visibleAssetCoinIds,
    ],
  );

  const isLastStanding = useMemo(
    () =>
      baseCoinList
        .filter((item) => {
          const mergedHiddenCoinIds = [...hiddenAssetCoinIds, ...hiddenCustomAssetCoinIds];
          return !mergedHiddenCoinIds?.includes(getCoinId(item.asset));
        })
        .filter((item) => {
          const isVisibleState = (() => {
            const isBalance = gt(item.balance, '0');
            const isVisble = visibleAssetCoinIds?.includes(getCoinId(item.asset));

            return isBalance || isVisble;
          })();

          return isVisibleState;
        }).length === 1,
    [baseCoinList, hiddenAssetCoinIds, hiddenCustomAssetCoinIds, visibleAssetCoinIds],
  );

  const handleAssetVisibility = async (assetId: string, isBalanceZero: boolean) => {
    const isCustomERC20Token = currentCustomERC20Tokens.some((item) => isMatchingCoinId(item, assetId));
    const isCustomCW20Token = currentCustomCW20Tokens.some((item) => isMatchingCoinId(item, assetId));

    const isCustomAsset = customAssets.some((item) => isMatchingCoinId(item, assetId));

    const isHiddenManagedAsset = hiddenAssetCoinIds?.includes(assetId);

    const isHiddenCustomAsset = hiddenCustomAssetCoinIds?.includes(assetId);

    const isHiddenAsset = isCustomAsset ? isHiddenCustomAsset : isHiddenManagedAsset;

    const isVisibleAsset = visibleAssetCoinIds?.includes(assetId);

    const isHiddenState = (() => {
      if (isCustomCW20Token || isCustomERC20Token || isVisibleAsset) {
        return false;
      }

      if (isHiddenAsset || isBalanceZero) {
        return true;
      }
      return false;
    })();

    if (isCustomERC20Token) {
      await removeCustomERC20Token(assetId);
      return;
    }

    if (isCustomCW20Token) {
      await removeCustomCW20Token(assetId);
      return;
    }

    if (isCustomAsset) {
      const isHiddenCustomAsset = hiddenCustomAssetCoinIds?.includes(assetId);

      if (isHiddenState) {
        if (isHiddenCustomAsset) {
          await showCustomAsset(parseCoinId(assetId));
          if (isBalanceZero) {
            await addVisibleAsset(parseCoinId(assetId));
          }
        } else {
          await addVisibleAsset(parseCoinId(assetId));
        }
      } else {
        if (isLastStanding) {
          toastError(t('pages.manage-assets.visibility.assets.entry.lastStandingError'));
          return;
        }

        if (isVisibleAsset) {
          await removeVisibleAsset(parseCoinId(assetId));
        }

        if (!isBalanceZero) {
          await hideCustomAsset(parseCoinId(assetId));
        }
        return;
      }
    }

    if (isHiddenState) {
      if (isHiddenManagedAsset) {
        await showAsset(parseCoinId(assetId));

        if (isBalanceZero) {
          await addVisibleAsset(parseCoinId(assetId));
        }
      } else {
        await addVisibleAsset(parseCoinId(assetId));
      }
    } else {
      if (isLastStanding) {
        toastError(t('pages.manage-assets.visibility.assets.entry.lastStandingError'));
        return;
      }

      if (isVisibleAsset) {
        await removeVisibleAsset(parseCoinId(assetId));
      }

      if (!isBalanceZero) {
        await hideAsset(parseCoinId(assetId));
      }
    }
  };

  useEffect(() => {
    if (initVisibleAssetCoinIds === undefined && currentVisibleAssetIds?.length > 0) {
      setInitVisibleAssetCoinIds(currentVisibleAssetIds.map((item) => getCoinIdWithManual(item)));
    }
  }, [currentVisibleAssetIds, initVisibleAssetCoinIds]);

  useEffect(() => {
    if (initHiddenAssetCoinIds === undefined && currentHiddenAssetIds?.length > 0) {
      setInitHiddenAssetCoinIds(currentHiddenAssetIds.map((item) => getCoinIdWithManual(item)));
    }
  }, [currentHiddenAssetIds, initHiddenAssetCoinIds]);

  useEffect(() => {
    if (initHiddenCustomAssetCoinIds === undefined && customHiddenAssetIds?.length > 0) {
      setInitHiddenCustomAssetCoinIds(customHiddenAssetIds.map((item) => getCoinIdWithManual(item)));
    }
  }, [customHiddenAssetIds, initHiddenCustomAssetCoinIds]);

  useEffect(() => {
    if (search.length > 1 || search.length === 0 || currentSelectedChainId) {
      scrollToTop();
    }
  }, [scrollToTop, search.length, currentSelectedChainId]);

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
                onChange={(event) => {
                  setSearch(event.currentTarget.value);
                }}
                isPending={isDebouncing}
                disableFilter
                onClear={() => {
                  setSearch('');
                  cancel();
                }}
              />

              <RowContainer>
                <AllNetworkButton
                  currentChainId={currentSelectedChainId}
                  chainList={chainList}
                  disabled={!!selectedChainFilterId}
                  selectChainOption={(id) => {
                    setUserSelectedChainId(id);
                  }}
                />

                <IconTextButton
                  onClick={() => {
                    navigate({
                      to: ImportToken.to,
                    });
                  }}
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
            {sortedCoinListByHidden && sortedCoinListByHidden.length > 0 ? (
              <CoinButtonWrapper>
                {!isDebouncing && (
                  <VirtualizedList
                    items={finalCoinList}
                    estimateSize={() => 60}
                    renderItem={(coin) => {
                      return (
                        <>
                          <CoinWithChainNameButton
                            key={getCoinId(coin.asset).concat(coin.chain.id).concat(String(coin.chain.chainId))}
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
                            rightComponent={
                              coin.isHiddenState ? (
                                <IconContainer>
                                  <AddIcon />
                                </IconContainer>
                              ) : (
                                <IconContainer>
                                  <RemoveIcon />
                                </IconContainer>
                              )
                            }
                            onClick={() => {
                              if (coin.isCustomToken) {
                                setTokenToDelete(coin);
                              } else {
                                handleAssetVisibility(getCoinId(coin.asset), coin.isBalanceZero);
                              }
                            }}
                          />
                        </>
                      );
                    }}
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
        currentSortOption={DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER}
        open={isOpenSortBottomSheet}
        onClose={() => setIsOpenSortBottomSheet(false)}
        onSelectSortOption={(val) => {
          setSortOption(val);
        }}
      />
      <DeleteConfirmBottomSheet
        open={!!tokenToDelete?.asset}
        onClose={() => setTokenToDelete(undefined)}
        contents={
          <CoinContainer>
            <CoinImage imageURL={tokenToDelete?.asset.image} badgeImageURL={tokenToDelete?.chain.image || undefined} />
            <CoinSymbolContainer>
              <Base1300Text variant="b1_B">{tokenToDelete?.asset.symbol}</Base1300Text>
              <CoinIdContainer>
                <Base1000Text variant="b4_R">{t('pages.manage-assets.visibility.assets.entry.contract')}</Base1000Text>
                &nbsp;
                <Base1000Text variant="b3_M">{shorterAddress(tokenToDelete?.asset.id, 16)}</Base1000Text>
              </CoinIdContainer>
            </CoinSymbolContainer>
          </CoinContainer>
        }
        descriptionText={t('pages.manage-assets.visibility.assets.entry.deleteDescription')}
        onClickConfirm={() => {
          handleAssetVisibility(tokenToDelete?.asset ? getCoinId(tokenToDelete?.asset) : '', tokenToDelete?.balance === '0');
          setTokenToDelete(undefined);
        }}
      />
    </>
  );
}
