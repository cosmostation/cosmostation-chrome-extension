import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import AllNetworkButton from '@/components/AllNetworkButton';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import CoinWithChainNameButton from '@/components/CoinWithChainNameButton';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import IconTextButton from '@/components/common/IconTextButton';
import IntersectionObserver from '@/components/common/IntersectionObserver';
import DeleteConfirmBottomSheet from '@/components/DeleteConfirmBottomSheet';
import Search from '@/components/Search';
import SortBottomSheet from '@/components/SortBottomSheet';
import { useScroll } from '@/components/Wrapper/components/ScrollProvider';
import { DASHBOARD_COIN_SORT_KEY } from '@/constants/sortKey';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useChainList } from '@/hooks/useChainList';
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
import { gt, minus, times, toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId, getCoinIdWithManual, isMatchingCoinId, isMatchingUniqueChainId, isSameCoin, parseCoinId } from '@/utils/queryParamGenerator';
import { shorterAddress } from '@/utils/string';
import { toastError } from '@/utils/toast';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  CoinButtonWrapper,
  CoinContainer,
  CoinIdContainer,
  CoinImage,
  CoinSymbolContainer,
  Container,
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
  const { currency } = useExtensionStorageStore((state) => state);

  const { currentHiddenAssetIds, hideAsset, showAsset } = useCurrentHiddenAssetIds();

  // NOTE 화이트 리스트 관리에서 커스텀 코인들은 어떻게?? 같이 해 아니면 따로해
  const { currentVisibleAssetIds, removeVisibleAsset, addVisibleAsset } = useCurrentVisibleAssetIds();

  const { customHiddenAssetIds, hideCustomAsset, showCustomAsset } = useCustomAssets();

  const { currentCustomERC20Tokens, removeCustomERC20Token } = useCurrentCustomERC20Tokens();
  const { currentCustomCW20Tokens, removeCustomCW20Token } = useCurrentCustomCW20Tokens();

  const currentCustomTokens = [...currentCustomERC20Tokens, ...currentCustomCW20Tokens];

  const { data: currentAccountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
  });

  const { customAssets } = useCustomAssets();

  const { flatChainList } = useChainList();

  const [viewLimit, setViewLimit] = useState(30);

  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);
  const isDebouncing = !!search && isPending();

  const [isOpenSortBottomSheet, setIsOpenSortBottomSheet] = useState(false);
  const [sortOption, setSortOption] = useState<CommonSortKeyType>(DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER);

  const [isOpenDeleteCoinBottomSheet, setIsOpenDeleteCoinBottomSheet] = useState(false);

  const [currentSelectedChainId, setCurrentSelectedChainId] = useState<UniqueChainId | undefined>();

  const visibleAssetCoinIds = useMemo(() => currentVisibleAssetIds?.map((item) => getCoinIdWithManual(item)), [currentVisibleAssetIds]);

  const [initVisibleAssetCoinIds, setInitVisibleAssetCoinIds] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    if (initVisibleAssetCoinIds === undefined && currentVisibleAssetIds?.length > 0) {
      setInitVisibleAssetCoinIds(currentVisibleAssetIds.map((item) => getCoinIdWithManual(item)));
    }
  }, [currentVisibleAssetIds, initVisibleAssetCoinIds]);

  const hiddenAssetCoinIds = useMemo(() => currentHiddenAssetIds?.map((item) => getCoinIdWithManual(item)), [currentHiddenAssetIds]);

  const [initHiddenAssetCoinIds, setInitHiddenAssetCoinIds] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    if (initHiddenAssetCoinIds === undefined && currentHiddenAssetIds?.length > 0) {
      setInitHiddenAssetCoinIds(currentHiddenAssetIds.map((item) => getCoinIdWithManual(item)));
    }
  }, [currentHiddenAssetIds, initHiddenAssetCoinIds]);

  const hiddenCustomAssetCoinIds = useMemo(() => customHiddenAssetIds?.map((item) => getCoinIdWithManual(item)), [customHiddenAssetIds]);

  const [initHiddenCustomAssetCoinIds, setInitHiddenCustomAssetCoinIds] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    if (initHiddenCustomAssetCoinIds === undefined && customHiddenAssetIds?.length > 0) {
      setInitHiddenCustomAssetCoinIds(customHiddenAssetIds.map((item) => getCoinIdWithManual(item)));
    }
  }, [customHiddenAssetIds, initHiddenCustomAssetCoinIds]);

  const baseCoinList = useMemo(() => currentAccountAllAssets?.flatAccountAssets || [], [currentAccountAllAssets?.flatAccountAssets]);

  const chainList = useMemo(
    () =>
      flatChainList.filter((item) =>
        baseCoinList.some((coin) => coin.chain.id === item.id && coin.chain.chainType === item.chainType && coin.chain.chainId === item.chainId),
      ),
    [baseCoinList, flatChainList],
  );

  const currentSelectedChain = useMemo(
    () => chainList.find((item) => isMatchingUniqueChainId(item, currentSelectedChainId)),
    [chainList, currentSelectedChainId],
  );

  const isShowAssetId = useMemo(() => !!currentSelectedChain || !!debouncedSearch, [currentSelectedChain, debouncedSearch]);

  const computedAssetValues = useMemo<FlatAccountAssetsWithValue[]>(() => {
    return (
      baseCoinList?.map((item) => {
        const displayAmount = toDisplayDenomAmount(item.balance, item.asset.decimals);

        const coinPrice = (item.asset.coinGeckoId && coinGeckoPrice?.[item.asset.coinGeckoId]?.[currency]) || 0;

        const value = times(displayAmount, coinPrice, 10);

        return {
          ...item,
          value,
        };
      }) || []
    );
  }, [baseCoinList, coinGeckoPrice, currency]);

  const sortedAssets = computedAssetValues.sort((a, b) => {
    if (sortOption === DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER) {
      return Number(minus(b.value, a.value));
    }

    if (sortOption === DASHBOARD_COIN_SORT_KEY.ALPHABETICAL_ASC) {
      return a.asset.symbol.localeCompare(b.asset.symbol);
    }

    return 0;
  });

  const filteredCoinListWithChain = useMemo(
    () =>
      currentSelectedChain
        ? sortedAssets.filter((item) => currentSelectedChain?.id === item.chain.id && currentSelectedChain.chainId === item.chain.chainId) || []
        : sortedAssets || [],
    [currentSelectedChain, sortedAssets],
  );

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

    return [...visibleAssets, ...hiddenAssets].slice(0, viewLimit);
  }, [
    currentCustomCW20Tokens,
    currentCustomERC20Tokens,
    filteredCoinListBySearch,
    initHiddenAssetCoinIds,
    initHiddenCustomAssetCoinIds,
    initVisibleAssetCoinIds,
    viewLimit,
  ]);

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

  // FIXME 포폴에 보여지는 코인이 1개도 없을때는 히든 처리 방지.
  // TODO 디바운싱 혹은 플래그를 통해서 무작위 클릭 방지. // 플래그를 통해서 버튼 disable 처리도 가능.
  // NOTE 큐 형식으로 처리하는 방식 고려.
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
        // NOTE 블랙리스트에 있을때
        if (isHiddenCustomAsset) {
          await showCustomAsset(parseCoinId(assetId));
          // NOTE 블랙리스트에 있는데 밸런스도 없는 케이스는? => 단순히 블랙리스트에서 뺸다고 해도 리스팅되지 않을것 => 화이트리스트 추가
          if (isBalanceZero) {
            await addVisibleAsset(parseCoinId(assetId));
          }
        } else {
          // NOTE 블랙리스트에 없는데 밸런스가 없어서 안보여지고 있는 상태
          await addVisibleAsset(parseCoinId(assetId));
        }
      } else {
        if (isLastStanding) {
          toastError(t('pages.manage-assets.visibility.assets.entry.lastStandingError'));
          return;
        }

        if (isVisibleAsset) {
          await removeVisibleAsset(parseCoinId(assetId));

          if (!isBalanceZero) {
            await hideCustomAsset(parseCoinId(assetId));
          }
        }

        await hideCustomAsset(parseCoinId(assetId));
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

        if (!isBalanceZero) {
          await hideAsset(parseCoinId(assetId));
        }
      }

      await hideAsset(parseCoinId(assetId));
    }
  };

  // FIXME 체인 필터링이 걸리는 케이스도 스크롤 탑해야함.
  useEffect(() => {
    if (search.length > 1 || search.length === 0 || currentSelectedChainId) {
      scrollToTop();
      setViewLimit(30);
    }
  }, [scrollToTop, search.length, currentSelectedChainId]);

  return (
    <>
      <BaseBody>
        <EdgeAligner>
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
                  setViewLimit(30);
                  cancel();
                }}
              />

              <RowContainer>
                <AllNetworkButton
                  sizeVariant="medium"
                  typoVarient="b2_M"
                  currentChainId={currentSelectedChainId}
                  chainList={chainList}
                  selectChainOption={(id) => {
                    setCurrentSelectedChainId(id);
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
            <CoinButtonWrapper>
              {!isDebouncing && (
                <>
                  {sortedCoinListByHidden?.map((coin) => {
                    const customToken = currentCustomTokens.find((item) => isMatchingCoinId(item, getCoinId(coin.asset)));

                    const isHiddenManagedAsset = hiddenAssetCoinIds?.includes(getCoinId(coin.asset));
                    const isHiddenCustomAsset = hiddenCustomAssetCoinIds?.includes(getCoinId(coin.asset));

                    const isCustomAsset = customAssets.some((item) => isMatchingCoinId(item, getCoinId(coin.asset)));

                    const isHiddenAsset = isCustomAsset ? isHiddenCustomAsset : isHiddenManagedAsset;
                    const isBalanceZero = coin.balance === '0';

                    const isVisibleAsset = visibleAssetCoinIds?.includes(getCoinId(coin.asset));

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
                    return (
                      <>
                        <CoinWithChainNameButton
                          key={getCoinId(coin.asset).concat(coin.chain.id).concat(String(coin.chain.chainId))}
                          displayAmount={displayAmount}
                          symbol={coin.asset.symbol}
                          chainName={coin.chain.name}
                          assetId={coin.asset.id}
                          coinGeckoId={coin.asset.coinGeckoId}
                          displayAssetId={isShowAssetId}
                          coinImageProps={{
                            imageURL: coin.asset.image,
                            badgeImageURL: coin.asset.type === 'native' ? '' : coin.chain.image || '',
                          }}
                          rightComponent={
                            isHiddenState ? (
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
                            if (customToken) {
                              setIsOpenDeleteCoinBottomSheet(true);
                            } else {
                              handleAssetVisibility(getCoinId(coin.asset), isBalanceZero);
                            }
                          }}
                        />
                        {customToken && (
                          <DeleteConfirmBottomSheet
                            open={isOpenDeleteCoinBottomSheet}
                            onClose={() => setIsOpenDeleteCoinBottomSheet(false)}
                            contents={
                              <CoinContainer>
                                <CoinImage imageURL={customToken.image} badgeImageURL={coin.chain.image || ''} />
                                <CoinSymbolContainer>
                                  <Base1300Text variant="b1_B">{customToken.symbol}</Base1300Text>
                                  <CoinIdContainer>
                                    <Base1000Text variant="b4_R">{t('pages.manage-assets.visibility.assets.entry.contract')}</Base1000Text>
                                    &nbsp;
                                    <Base1000Text variant="b3_M">{shorterAddress(customToken.id, 16)}</Base1000Text>
                                  </CoinIdContainer>
                                </CoinSymbolContainer>
                              </CoinContainer>
                            }
                            descriptionText={t('pages.manage-assets.visibility.assets.entry.deleteDescription')}
                            onClickConfirm={() => {
                              handleAssetVisibility(getCoinId(coin.asset), isBalanceZero);
                              setIsOpenDeleteCoinBottomSheet(false);
                            }}
                          />
                        )}
                      </>
                    );
                  })}

                  {filteredCoinListBySearch?.length > viewLimit - 1 && (
                    <IntersectionObserver
                      onIntersect={() => {
                        setViewLimit((limit) => limit + 30);
                      }}
                    />
                  )}
                </>
              )}
            </CoinButtonWrapper>
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
    </>
  );
}
