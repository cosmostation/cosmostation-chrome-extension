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
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useGroupAccountAssets } from '@/hooks/useGroupAccountAssets';
import { Route as CoinDetail } from '@/pages/coin-detail/$coinId';
import type { UniqueChainId } from '@/types/chain';
import { getFilteredAssetsByChainId, getFilteredChainsByChainId, isStakeableAsset } from '@/utils/asset';
import { minus, times, toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId, isMatchingUniqueChainId } from '@/utils/queryParamGenerator';
import { shorterAddress } from '@/utils/string';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { CoinButtonWrapper, Container, FilterContaienr, StickyContentsContainer } from './-styled';

type EntryProps = {
  coinId: string;
};

export default function Entry({ coinId }: EntryProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);

  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);

  const isDebouncing = !!search && isPending();

  const [viewLimit, setViewLimit] = useState(30);

  const [currentSelectedChainId, setCurrentSelectedChainId] = useState<UniqueChainId | undefined>();

  const { groupAccountAssets } = useGroupAccountAssets();

  const baseCoinList = useMemo(() => {
    const selectedCoin = groupAccountAssets?.groupAccountAssets.find((item) => getCoinId(item.asset) === coinId);

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

  const filteredAssetsBySearch = useMemo(() => {
    const filteredByChain = getFilteredAssetsByChainId(baseCoinList, currentSelectedChainId);

    const computedAssetValues = filteredByChain?.map((item) => {
      const displayAmount = toDisplayDenomAmount(item.balance || '0', item.asset.decimals);

      const coinPrice = (item.asset.coinGeckoId && coinGeckoPrice?.[item.asset.coinGeckoId]?.[userCurrencyPreference]) || 0;

      const value = times(displayAmount, coinPrice);

      return {
        ...item,
        value,
      };
    });

    const sortedAssets = computedAssetValues?.sort((a, b) => {
      return Number(minus(b.value, a.value));
    });

    if (!!search && debouncedSearch.length > 1) {
      return (
        sortedAssets
          ?.filter((asset) => {
            const condition = [asset.asset.symbol, asset.asset.id];

            return condition.some((item) => item.toLowerCase().indexOf(search.toLowerCase()) > -1);
          })
          .slice(0, viewLimit) || []
      );
    }
    return sortedAssets?.slice(0, viewLimit) || [];
  }, [baseCoinList, coinGeckoPrice, userCurrencyPreference, currentSelectedChainId, debouncedSearch.length, search, viewLimit]);

  const chainList = useMemo(() => getFilteredChainsByChainId(baseCoinList), [baseCoinList]);

  const currentSelectedChain = useMemo(
    () => chainList?.find((chain) => isMatchingUniqueChainId(chain, currentSelectedChainId)),
    [chainList, currentSelectedChainId],
  );

  const isShowAssetId = useMemo(() => !!currentSelectedChain || !!debouncedSearch, [currentSelectedChain, debouncedSearch]);

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
                  key={getCoinId(item.asset)}
                  displayAmount={displayAmount || '0'}
                  symbol={item.asset.symbol}
                  chainName={item.chain.name}
                  coinGeckoId={item.asset.coinGeckoId}
                  assetId={resolvedAssetId}
                  coinImageProps={{
                    imageURL: item.asset.image,
                    badgeImageURL: item.chain.image || '',
                  }}
                  displayAssetId={isShowAssetId}
                  onClick={() => {
                    navigate({
                      to: CoinDetail.to,
                      params: {
                        coinId: getCoinId(item.asset),
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
