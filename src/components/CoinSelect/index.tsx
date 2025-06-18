import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { Typography } from '@mui/material';

import AllNetworkButton from '@/components/AllNetworkButton';
import CoinWithChainNameButton from '@/components/CoinWithChainNameButton';
import SortBottomSheet from '@/components/SortBottomSheet';
import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import { COIN_SELECT_SORT_KEY, DASHBOARD_COIN_SORT_KEY } from '@/constants/sortKey';
import { useGetAverageAPY } from '@/hooks/sui/useGetAverageAPY';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import type { FlatAccountAssets } from '@/types/accountAssets';
import type { Chain, UniqueChainId } from '@/types/chain';
import type { CommonSortKeyType } from '@/types/sortKey';
import { getFilteredAssetsByChainId, getFilteredChainsByChainId, isStakeableAsset } from '@/utils/asset';
import { isTestnetChain } from '@/utils/chain';
import { minus, times, toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId, getUniqueChainId, isMatchingUniqueChainId, parseUniqueChainId } from '@/utils/queryParamGenerator';
import { shorterAddress, toPercentages } from '@/utils/string';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { Container, EmptyAssetContainer, FilterContaienr, StickyContentsContainer } from './styled';
import { VirtualizedList } from '../common/VirtualizedList';
import EmptyAsset from '../EmptyAsset';
import Search from '../Search';
import { useScroll } from '../Wrapper/components/ScrollProvider';

import NoSearchIcon from '@/assets/images/icons/NoSearch70.svg';

type CoinSelectProps = {
  currentCoinId?: string;
  chainList?: Chain[];
  coinList?: FlatAccountAssets[];
  isBottomSheet?: boolean;
  searchPlaceholder?: string;
  variant?: 'default' | 'stake' | 'all';
  onSelectCoin: (coinId: string) => void;
};

export default function CoinSelect({
  currentCoinId,
  chainList,
  coinList,
  variant = 'default',
  isBottomSheet = false,
  searchPlaceholder,
  onSelectCoin,
}: CoinSelectProps) {
  const { t } = useTranslation();

  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const { userCurrencyPreference, selectedChainFilterId } = useExtensionStorageStore((state) => state);

  const isDisableDupeEthermint = variant === 'stake';

  const { data } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableBalanceFilter: false,
    disableHiddenFilter: false,
    disableDupeEthermint: isDisableDupeEthermint,
  });

  const suiCoinId = useMemo(() => (data?.suiAccountAssets[0]?.asset.id ? getCoinId(data.suiAccountAssets[0].asset) : ''), [data?.suiAccountAssets]);
  const { averageAPY } = useGetAverageAPY({ coinId: suiCoinId });

  const { scrollToTop } = useScroll();

  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);

  const isDebouncing = !!search && isPending();

  const [isOpenSortBottomSheet, setIsOpenSortBottomSheet] = useState(false);
  const [sortOption, setSortOption] = useState<CommonSortKeyType>(DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER);

  const [userSelectedChainId, setUserSelectedChainId] = useState<UniqueChainId | undefined>();

  const currentSelectedChainId = useMemo(() => {
    if (selectedChainFilterId && variant === 'stake') {
      return selectedChainFilterId;
    }

    return userSelectedChainId;
  }, [selectedChainFilterId, userSelectedChainId, variant]);

  const baseCoinList = useMemo(() => {
    if (coinList) return coinList;

    if (variant === 'stake') {
      return data?.flatAccountAssets.filter((item) => {
        const isCosmosStakingChain = item.chain.chainType === 'cosmos' && item.chain.isSupportStaking && item.asset.id === item.chain.mainAssetDenom;
        const isSuiStakingChain = item.chain.chainType === 'sui' && item.asset.id === item.chain.mainAssetDenom;

        return isCosmosStakingChain || isSuiStakingChain;
      });
    }

    return data?.flatAccountAssets;
  }, [coinList, data?.flatAccountAssets, variant]);

  const baseChainList = useMemo(
    () => chainList || getFilteredChainsByChainId(baseCoinList, { disableDupeEthermint: isDisableDupeEthermint }),
    [baseCoinList, chainList, isDisableDupeEthermint],
  );

  const currentSelectedChain = useMemo(
    () =>
      baseChainList?.find((chain) => {
        if (variant === 'stake' && currentSelectedChainId) {
          return chain.id === parseUniqueChainId(currentSelectedChainId).id;
        }

        return isMatchingUniqueChainId(chain, currentSelectedChainId);
      }),
    [baseChainList, currentSelectedChainId, variant],
  );

  const finalSelectedChainFilterId =
    selectedChainFilterId && variant === 'stake' && currentSelectedChain ? getUniqueChainId(currentSelectedChain) : currentSelectedChainId;

  const isShowAssetId = useMemo(() => !!currentSelectedChain || !!debouncedSearch, [currentSelectedChain, debouncedSearch]);

  const computedAssetValues = useMemo(() => {
    return (
      baseCoinList?.map((item) => {
        const balance = isStakeableAsset(item) ? item.totalBalance || item.balance || '0' : item.balance;

        const displayAmount = toDisplayDenomAmount(balance, item.asset.decimals);

        const chainPrice = (item.asset.coinGeckoId && coinGeckoPrice?.[item.asset.coinGeckoId]?.[userCurrencyPreference]) || 0;

        const value = times(displayAmount, chainPrice);

        const apr = (() => {
          if (variant === 'stake') {
            if (item.chain.chainType === 'cosmos' && item.chain.apr) {
              return toPercentages(item.chain.apr, {
                disableMark: true,
              });
            }

            if (item.chain.chainType === 'sui') {
              return averageAPY;
            }
          }

          return undefined;
        })();

        return {
          ...item,
          value,
          apr,
        };
      }) || []
    );
  }, [averageAPY, baseCoinList, coinGeckoPrice, userCurrencyPreference, variant]);

  const sortedAssets = useMemo(() => {
    const sortedValues = [...computedAssetValues].sort((a, b) => {
      const aIsTestnet = isTestnetChain(a.chain.id);
      const bIsTestnet = isTestnetChain(b.chain.id);

      if (aIsTestnet && !bIsTestnet) return 1;
      if (!aIsTestnet && bIsTestnet) return -1;

      if (sortOption === DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER) {
        const diff = minus(b.value, a.value);
        if (Number(diff) !== 0) return Number(diff);
      }

      if (sortOption === DASHBOARD_COIN_SORT_KEY.ALPHABETICAL_ASC) {
        const result = a.asset.symbol.localeCompare(b.asset.symbol);
        if (result !== 0) return result;
      }

      if (variant === 'stake' && sortOption === COIN_SELECT_SORT_KEY.APR_DESC) {
        const diff = minus(b.apr || 0, a.apr || 0);
        if (Number(diff) !== 0) return Number(diff);
      }

      return 0;
    });

    return sortedValues;
  }, [computedAssetValues, sortOption, variant]);

  const filteredCoinList = useMemo(() => {
    const filteredAssetsByChain = getFilteredAssetsByChainId(sortedAssets, currentSelectedChainId);

    if (!!search && debouncedSearch.length > 1) {
      return (
        filteredAssetsByChain.filter((asset) => {
          const condition = [asset.asset.symbol, asset.asset.id];

          return condition.some((item) => item.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1);
        }) || []
      );
    }
    return filteredAssetsByChain;
  }, [currentSelectedChainId, debouncedSearch, search, sortedAssets]);

  useEffect(() => {
    if (search.length > 1 || search.length === 0 || currentSelectedChainId) {
      scrollToTop();
    }
  }, [currentSelectedChainId, scrollToTop, search.length]);

  return (
    <Container>
      <StickyContentsContainer data-is-bottom-sheet={isBottomSheet}>
        <FilterContaienr>
          <Search
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
            }}
            isPending={isDebouncing}
            placeholder={searchPlaceholder || t('components.CoinSelect.index.searchPlaceholder')}
            onClickFilter={() => {
              setIsOpenSortBottomSheet(true);
            }}
            onClear={() => {
              setSearch('');
              cancel();
            }}
          />
        </FilterContaienr>

        <AllNetworkButton
          currentChainId={finalSelectedChainFilterId}
          chainList={baseChainList}
          selectChainOption={(id) => {
            setUserSelectedChainId(id);
          }}
          disabled={!!selectedChainFilterId && variant === 'stake'}
        />
      </StickyContentsContainer>

      {filteredCoinList.length > 0 ? (
        <VirtualizedList
          items={filteredCoinList}
          estimateSize={() => 60}
          renderItem={(coin) => {
            const balance = isStakeableAsset(coin) ? coin.totalBalance || coin.balance || '0' : coin.balance;
            const displayAmount = toDisplayDenomAmount(balance, coin.asset.decimals);

            const resolvedSymbol = coin.asset.symbol + `${isTestnetChain(coin.chain.id) ? ' (Testnet)' : ''}`;
            const resolvedAssetId =
              coin.chain.mainAssetDenom === coin.asset.id || coin.asset.id === NATIVE_EVM_COIN_ADDRESS
                ? coin.asset.description
                : coin.asset.id.length > 15
                  ? shorterAddress(coin.asset.id, 16)
                  : coin.asset.id;
            return (
              <CoinWithChainNameButton
                key={coin.asset.id.concat(coin.asset.chainId).concat(coin.asset.chainType)}
                isActive={currentCoinId === getCoinId(coin.asset)}
                displayAmount={displayAmount}
                apr={coin.apr ? coin.apr : undefined}
                symbol={resolvedSymbol}
                chainName={coin.chain.name}
                assetId={resolvedAssetId}
                coinGeckoId={coin.asset.coinGeckoId}
                displayAssetId={isShowAssetId}
                coinImageProps={{
                  imageURL: coin.asset.image,
                  badgeImageURL: coin.chain.image || '',
                }}
                onClick={() => {
                  onSelectCoin(getCoinId(coin.asset));
                }}
              />
            );
          }}
          overscan={5}
        />
      ) : (
        <EmptyAssetContainer>
          <EmptyAsset
            icon={<NoSearchIcon />}
            title={t('components.CoinSelect.index.noResultsTitle')}
            subTitle={t('components.CoinSelect.index.noResultsSubtitle')}
          />
        </EmptyAssetContainer>
      )}

      <SortBottomSheet
        optionButtonProps={
          variant === 'stake'
            ? [
                {
                  sortKey: DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER,
                  children: <Typography variant="b2_M">{t('components.CoinSelect.index.valueHighOrder')}</Typography>,
                },
                {
                  sortKey: DASHBOARD_COIN_SORT_KEY.ALPHABETICAL_ASC,
                  children: <Typography variant="b2_M">{t('components.CoinSelect.index.alphabeticalAsc')}</Typography>,
                },
                {
                  sortKey: COIN_SELECT_SORT_KEY.APR_DESC,
                  children: <Typography variant="b2_M">{t('components.CoinSelect.index.aprDesc')}</Typography>,
                },
              ]
            : [
                {
                  sortKey: DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER,
                  children: <Typography variant="b2_M">{t('components.CoinSelect.index.valueHighOrder')}</Typography>,
                },
                {
                  sortKey: DASHBOARD_COIN_SORT_KEY.ALPHABETICAL_ASC,
                  children: <Typography variant="b2_M">{t('components.CoinSelect.index.alphabeticalAsc')}</Typography>,
                },
              ]
        }
        currentSortOption={sortOption}
        open={isOpenSortBottomSheet}
        onClose={() => setIsOpenSortBottomSheet(false)}
        onSelectSortOption={(sortOptionKey) => {
          setSortOption(sortOptionKey);
        }}
      />
    </Container>
  );
}
