import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { produce } from 'immer';
import { useDebounce } from 'use-debounce';
import { Typography } from '@mui/material';

import AllNetworkButton from '@/components/AllNetworkButton';
import CoinWithChainNameButton from '@/components/CoinWithChainNameButton';
import IntersectionObserver from '@/components/common/IntersectionObserver';
import Search from '@/components/Search';
import SortBottomSheet from '@/components/SortBottomSheet';
import { useScroll } from '@/components/Wrapper/components/ScrollProvider';
import { DASHBOARD_COIN_SORT_KEY } from '@/constants/sortKey';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useChainList } from '@/hooks/useChainList';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentHiddenAssetIds } from '@/hooks/useCurrentHiddenAssetIds';
import type { FlatAccountAssets } from '@/types/accountAssets';
import type { CommonSortKeyType } from '@/types/sortKey';
import { minus, times, toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId, getCoinIdWithManual, parseCoinId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { CoinButtonWrapper, FilterContaienr, IconContainer, StickyTabPanelContentsContainer } from './styled';

import AddIcon from '@/assets/images/icons/Add20.svg';
import RemoveIcon from '@/assets/images/icons/Remove20.svg';

export default function SupportedAssets() {
  const { t } = useTranslation();
  const { scrollToTop } = useScroll();
  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const { currency, preferAccountType } = useExtensionStorageStore((state) => state);

  const { currentAccount } = useCurrentAccount();

  const { currentHiddenAssetIds, addHiddenAssetId, removeHiddenAssetId } = useCurrentHiddenAssetIds();

  const { data: currentAccountAllAssets } = useAccountAllAssets();

  const { flatChainList } = useChainList();

  const [viewLimit, setViewLimit] = useState(30);

  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);
  const isDebouncing = !!search && isPending();

  const [isOpenSortBottomSheet, setIsOpenSortBottomSheet] = useState(false);
  const [sortOption, setSortOption] = useState<CommonSortKeyType>(DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER);

  const [currentSelectedChainId, setCurrentSelectedChainId] = useState<string>('');

  const hiddenAssetCoinIds = useMemo(() => currentHiddenAssetIds?.map((item) => getCoinIdWithManual(item)), [currentHiddenAssetIds]);

  const currentPreferAccountType = useMemo(() => preferAccountType[currentAccount.id], [currentAccount.id, preferAccountType]);

  const baseCoinList = useMemo(() => {
    if (!currentAccountAllAssets) return [];

    const filteredCosmos = currentAccountAllAssets.cosmosAccountAssets
      .filter((item) => {
        const selectedChainAccountType = currentPreferAccountType[item.chain.id];

        if (selectedChainAccountType) {
          return (
            selectedChainAccountType.hdPath === item.address.accountType.hdPath &&
            selectedChainAccountType.pubKeyType === item.address.accountType.pubKeyType &&
            selectedChainAccountType.pubkeyStyle === item.address.accountType.pubkeyStyle
          );
        }
        return true;
      })
      // NOTE 60패스 evm, cosmos 중복 에셋 코스모스 쪽 리스트에서 필터링.
      .filter((item) => {
        const isDuplicatedEVMAsset = item.chain.chainType === 'cosmos' && item.chain.isEvm && item.chain.mainAssetDenom === item.asset.id;
        if (isDuplicatedEVMAsset) {
          return false;
        }

        return true;
      });

    const filteredCW20 = currentAccountAllAssets.cw20AccountAssets.filter((item) => {
      const selectedChainAccountType = currentPreferAccountType[item.chain.id];

      if (selectedChainAccountType) {
        return (
          selectedChainAccountType.hdPath === item.address.accountType.hdPath &&
          selectedChainAccountType.pubKeyType === item.address.accountType.pubKeyType &&
          selectedChainAccountType.pubkeyStyle === item.address.accountType.pubkeyStyle
        );
      }
      return true;
    });

    const filteredAccountAssets = produce(currentAccountAllAssets, (draft) => {
      draft.cosmosAccountAssets = filteredCosmos;
      draft.cw20AccountAssets = filteredCW20;
    });

    const flatAccountAssets = Object.values(filteredAccountAssets).flat() as FlatAccountAssets[];

    return flatAccountAssets;
  }, [currentAccountAllAssets, currentPreferAccountType]);

  const chainList = useMemo(
    () =>
      flatChainList.filter((item) =>
        baseCoinList.some((coin) => coin.chain.id === item.id && coin.chain.chainType === item.chainType && coin.chain.chainId === item.chainId),
      ),
    [baseCoinList, flatChainList],
  );

  const currentSelectedChain = useMemo(() => chainList.find((item) => item.id === currentSelectedChainId), [chainList, currentSelectedChainId]);

  const isShowAssetId = useMemo(() => !!currentSelectedChain || !!debouncedSearch, [currentSelectedChain, debouncedSearch]);

  const computedAssetValues = useMemo(() => {
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
          filteredAssetsByChain
            .filter((asset) => {
              const condition = [asset.asset.symbol, asset.asset.id];

              return condition.some((item) => item.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1);
            })
            .slice(0, viewLimit) || []
        );
      }
      return filteredAssetsByChain.slice(0, viewLimit);
    })();

    return filteredAssetsBySearch;
  }, [debouncedSearch, filteredCoinListWithChain, search, viewLimit]);

  const sortedCoinListByHidden = useMemo(() => {
    const hiddenAssets = filteredCoinListBySearch.filter((item) => hiddenAssetCoinIds?.includes(getCoinId(item.asset)));

    const visibleAssets = filteredCoinListBySearch.filter((item) => !hiddenAssetCoinIds?.includes(getCoinId(item.asset)));

    return [...visibleAssets, ...hiddenAssets];
  }, [filteredCoinListBySearch, hiddenAssetCoinIds]);

  const handleHiddenAsset = async (assetId: string) => {
    const isHiddenAsset = hiddenAssetCoinIds?.includes(assetId);

    if (isHiddenAsset) {
      await removeHiddenAssetId(parseCoinId(assetId));
    } else {
      await addHiddenAssetId(parseCoinId(assetId));
    }
  };

  useEffect(() => {
    if (search.length > 1 || search.length === 0) {
      scrollToTop();
      setViewLimit(30);
    }
  }, [scrollToTop, search.length]);

  return (
    <>
      <StickyTabPanelContentsContainer>
        <FilterContaienr>
          <Search
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
            }}
            isPending={isDebouncing}
            onClickFilter={() => {
              setIsOpenSortBottomSheet(true);
            }}
            onClear={() => {
              setSearch('');
              setViewLimit(30);
              cancel();
            }}
          />
        </FilterContaienr>
        <AllNetworkButton
          sizeVariant="medium"
          typoVarient="b2_M"
          currentChainId={currentSelectedChainId}
          chainList={flatChainList}
          isManageAssets
          selectChainOption={(id) => {
            setCurrentSelectedChainId(id);
          }}
        />
      </StickyTabPanelContentsContainer>
      <CoinButtonWrapper>
        {!isDebouncing && (
          <>
            {sortedCoinListByHidden?.map((coin) => {
              const isHiddenAsset = hiddenAssetCoinIds?.includes(getCoinId(coin.asset));

              const displayAmount = toDisplayDenomAmount(coin.balance, coin.asset.decimals);
              return (
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
                    isHiddenAsset ? (
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
                    handleHiddenAsset(getCoinId(coin.asset));
                  }}
                />
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
