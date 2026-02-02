import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { useNavigate } from '@tanstack/react-router';

import AllNetworkButton from '@/components/AllNetworkButton';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import CoinWithChainNameButton from '@/components/CoinWithChainNameButton';
import IntersectionObserver from '@/components/common/IntersectionObserver';
import CoinOverViewBox from '@/components/MainBox/CoinOverviewBox';
import Search from '@/components/Search';
import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import { DASHBOARD_COIN_SORT_KEY } from '@/constants/sortKey';
import { useAutoBalanceRefresh } from '@/hooks/update/useAutoBalanceRefresh';
import { useAssetPricing } from '@/hooks/useAssetPricing';
import { useGroupAccountAssets } from '@/hooks/useGroupAccountAssets';
import { Route as CoinDetail } from '@/pages/coin-detail/$coinId';
import type { UniqueChainId } from '@/types/chain';
import { filterAssetsBySearch, getFilteredAssetsByChainId, getFilteredChainsByChainId, isStakeableAsset, sortAssetsByKey } from '@/utils/asset';
import { toDisplayDenomAmount } from '@/utils/numbers';
import { getUniqueChainId, isMatchingUniqueChainId } from '@/utils/queryParamGenerator';
import { shorterAddress } from '@/utils/string';

import { CoinButtonWrapper, Container, FilterContaienr, StickyContentsContainer } from './-styled';

type EntryProps = {
  coinId: string;
};

export default function Entry({ coinId }: EntryProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);

  const isSearchEmpty = useMemo(() => search.length === 0, [search]);
  const isDebouncing = !!search && isPending();

  const [viewLimit, setViewLimit] = useState(30);

  const [currentSelectedChainId, setCurrentSelectedChainId] = useState<UniqueChainId | undefined>();

  const { groupAccountAssets } = useGroupAccountAssets();

  const baseCoinList = useMemo(() => {
    const selectedCoin = groupAccountAssets?.groupAccountAssets.find(({ uniqueCoinId }) => uniqueCoinId === coinId);

    const selectedGroupMap = groupAccountAssets?.groupMap[selectedCoin?.asset.coinGeckoId || ''];

    const resolvedGroupMap = selectedGroupMap?.map((item) => {
      const balance = isStakeableAsset(item) ? item.totalBalance || '0' : item.balance;

      return {
        ...item,
        balance: balance,
      };
    });
    return resolvedGroupMap;
  }, [coinId, groupAccountAssets?.groupAccountAssets, groupAccountAssets?.groupMap]);

  const chainFilteredList = useMemo(() => getFilteredAssetsByChainId(baseCoinList, currentSelectedChainId), [baseCoinList, currentSelectedChainId]);

  const pricedAssets = useAssetPricing(chainFilteredList);

  const sortedAssets = useMemo(() => sortAssetsByKey(pricedAssets, DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER), [pricedAssets]);

  const filteredAssetsBySearch = useMemo(() => {
    const filtered = filterAssetsBySearch(sortedAssets, debouncedSearch, isSearchEmpty);
    return filtered.slice(0, viewLimit);
  }, [sortedAssets, debouncedSearch, isSearchEmpty, viewLimit]);

  const chainList = useMemo(() => getFilteredChainsByChainId(baseCoinList), [baseCoinList]);

  const chainIdList = useMemo(() => chainList.map((item) => getUniqueChainId(item)), [chainList]);

  useAutoBalanceRefresh(chainIdList);

  const currentSelectedChain = useMemo(
    () => chainList?.find((chain) => isMatchingUniqueChainId(chain, currentSelectedChainId)),
    [chainList, currentSelectedChainId],
  );

  const isShowAssetId = useMemo(() => !!currentSelectedChain || (!!debouncedSearch && !isSearchEmpty), [currentSelectedChain, debouncedSearch, isSearchEmpty]);

  return (
    <BaseBody>
      <EdgeAligner>
        <Container>
          <CoinOverViewBox coinId={coinId} />

          <StickyContentsContainer>
            <FilterContaienr>
              <Search
                value={search}
                onChange={(event) => {
                  setSearch(event.currentTarget.value);
                }}
                isPending={isDebouncing}
                placeholder={t('pages.coin-overview.$coinId.entry.search')}
                disableFilter
                onClear={() => {
                  setSearch('');
                  setViewLimit(30);
                  cancel();
                }}
              />
            </FilterContaienr>

            <AllNetworkButton
              chainList={chainList}
              currentChainId={currentSelectedChainId}
              selectChainOption={(chainId) => {
                setCurrentSelectedChainId(chainId);
              }}
            />
          </StickyContentsContainer>

          <CoinButtonWrapper>
            {filteredAssetsBySearch?.map((item) => {
              const displayAmount = toDisplayDenomAmount(item.balance || '0', item.asset.decimals);

              const resolvedAssetId =
                item.chain.mainAssetDenom === item.asset.id || item.asset.id === NATIVE_EVM_COIN_ADDRESS
                  ? item.asset.description
                  : item.asset.id.length > 15
                    ? shorterAddress(item.asset.id, 16)
                    : item.asset.id;

              return (
                <CoinWithChainNameButton
                  key={item.uniqueCoinId}
                  displayAmount={displayAmount || '0'}
                  symbol={item.asset.symbol}
                  chainName={item.chain.name}
                  coinGeckoId={item.asset.coinGeckoId}
                  assetId={resolvedAssetId}
                  coinImageProps={{
                    imageURL: item.asset.image,
                    badgeImageURL: item.chain.image || '',
                  }}
                  fetchStatus={item.fetchStatus?.balance}
                  displayAssetId={isShowAssetId}
                  onClick={() => {
                    navigate({
                      to: CoinDetail.to,
                      params: {
                        coinId: item.uniqueCoinId,
                      },
                    });
                  }}
                />
              );
            })}
            {filteredAssetsBySearch?.length > viewLimit - 1 && (
              <IntersectionObserver
                onIntersect={() => {
                  setViewLimit((limit) => limit + 30);
                }}
              />
            )}
          </CoinButtonWrapper>
        </Container>
      </EdgeAligner>
    </BaseBody>
  );
}
