import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { Typography } from '@mui/material';

import AllNetworkButton from '@/components/AllNetworkButton';
import CoinWithChainNameButton from '@/components/CoinWithChainNameButton';
import { VirtualizedList } from '@/components/common/VirtualizedList';
import Search from '@/components/Search';
import SortBottomSheet from '@/components/SortBottomSheet';
import { useScroll } from '@/components/Wrapper/components/ScrollProvider';
import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import { DASHBOARD_COIN_SORT_KEY } from '@/constants/sortKey';
import { useChainList } from '@/hooks/useChainList';
import type { FlatAccountAssets } from '@/types/accountAssets';
import type { UniqueChainId } from '@/types/chain';
import type { CommonSortKeyType } from '@/types/sortKey';
import { filterAssetsBySearch, isStakeableAsset } from '@/utils/asset';
import { isTestnetChain } from '@/utils/chain';
import { toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId, isMatchingUniqueChainId } from '@/utils/queryParamGenerator';
import { shorterAddress } from '@/utils/string';

import { Container, FilterContainer, StickyContentsContainer } from './styled';

type CoinSelectWithChainIdProps = {
  chainId: UniqueChainId;
  coinList: FlatAccountAssets[];
  sortOption: CommonSortKeyType;
  searchPlaceholder?: string;
  onSelectCoin: (coinId: string) => void;
  onSelectSortOption: (sortOption: CommonSortKeyType) => void;
};

export default function CoinSelectWithChainId({
  chainId,
  coinList,
  searchPlaceholder,
  sortOption,
  onSelectCoin,
  onSelectSortOption,
}: CoinSelectWithChainIdProps) {
  const { t } = useTranslation();

  const { flatChainList } = useChainList();

  const { scrollToTop } = useScroll();

  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);

  const isDebouncing = !!search && isPending();

  const [isOpenSortBottomSheet, setIsOpenSortBottomSheet] = useState(false);

  const currentSelectedChain = useMemo(() => flatChainList?.find((chain) => isMatchingUniqueChainId(chain, chainId)), [chainId, flatChainList]);
  const baseChainList = currentSelectedChain && [currentSelectedChain];

  const isShowAssetId = useMemo(() => !!currentSelectedChain || !!debouncedSearch, [currentSelectedChain, debouncedSearch]);

  const filteredCoinList = useMemo(() => filterAssetsBySearch(coinList, search, debouncedSearch), [coinList, debouncedSearch, search]);

  useEffect(() => {
    if (search.length > 1 || search.length === 0) {
      scrollToTop();
    }
  }, [scrollToTop, search.length]);

  return (
    <Container>
      <StickyContentsContainer>
        <FilterContainer>
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
        </FilterContainer>

        <AllNetworkButton currentChainId={chainId} chainList={baseChainList} disabled />
      </StickyContentsContainer>

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
              displayAmount={displayAmount}
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

      <SortBottomSheet
        optionButtonProps={[
          {
            sortKey: DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER,
            children: <Typography variant="b2_M">{t('components.CoinSelect.index.valueHighOrder')}</Typography>,
          },
          {
            sortKey: DASHBOARD_COIN_SORT_KEY.ALPHABETICAL_ASC,
            children: <Typography variant="b2_M">{t('components.CoinSelect.index.alphabeticalAsc')}</Typography>,
          },
        ]}
        currentSortOption={sortOption}
        open={isOpenSortBottomSheet}
        onClose={() => setIsOpenSortBottomSheet(false)}
        onSelectSortOption={(sortOptionKey) => {
          onSelectSortOption(sortOptionKey);
        }}
      />
    </Container>
  );
}
