import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputAdornment, Typography } from '@mui/material';

import AllNetworkButton from '@/components/AllNetworkButton';
import CoinWithChainNameButton from '@/components/CoinWithChainNameButton';
import SortBottomSheet from '@/components/SortBottomSheet';
import { DASHBOARD_COIN_SORT_KEY } from '@/constants/sortKey';
import { useAccountAssets } from '@/hooks/useAccountAssets';
import { useChainList } from '@/hooks/useChainList';
import { useCoinGeckoPriceSWR } from '@/hooks/useCoinGeckoPrice';
import type { Chain } from '@/types/chain';
import type { CommonSortKeyType } from '@/types/sortKey';
import { minus, times, toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { CoinButtonWrapper, Container, FilterContaienr, FilterIconButton, StickyContentsContainer, StyledInput } from './styled';

import FilterSettingIcon from '@/assets/images/icons/FilterSetting20.svg';
import SearchIcon from '@/assets/images/icons/Search18.svg';

type CoinSelectProps = {
  chainList?: Chain[];
  onSelectCoin: (coinId: string) => void;
};

export default function CoinSelect({ chainList, onSelectCoin }: CoinSelectProps) {
  const { t } = useTranslation();

  const { data: coinGeckoPrice } = useCoinGeckoPriceSWR();
  const { currency } = useExtensionStorageStore((state) => state);

  const { flatChainList } = useChainList();
  // FIXME 60패스의 이더민트 계열 네이티브 코인들에서 중복되는 코인들이 있음.
  const { data } = useAccountAssets();

  const [search, setSearch] = useState('');
  const [isOpenSortBottomSheet, setIsOpenSortBottomSheet] = useState(false);
  const [sortOption, setSortOption] = useState<CommonSortKeyType>(DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER);

  const [currentSelectedChainId, setCurrentSelectedChainId] = useState<string>();

  const baseChainList = chainList || flatChainList;

  const currentSelectedChain = baseChainList.find((chain) => chain.id === currentSelectedChainId);

  const isShowAssetId = !!currentSelectedChain || !!search;

  const computedAssetValues = useMemo(() => {
    return (
      data?.flatAccountAssets.map((item) => {
        const displayAmount = toDisplayDenomAmount(item.balance, item.asset.decimals);

        const chainPrice = (item.asset.coinGeckoId && coinGeckoPrice?.[item.asset.coinGeckoId]?.[currency]) || 0;

        const value = times(displayAmount, chainPrice);

        return {
          ...item,
          value,
        };
      }) || []
    );
  }, [coinGeckoPrice, currency, data?.flatAccountAssets]);

  const sortedAssets = computedAssetValues.sort((a, b) => {
    if (sortOption === DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER) {
      return Number(minus(b.value, a.value));
    }

    if (sortOption === DASHBOARD_COIN_SORT_KEY.ALPHABETICAL_ASC) {
      return a.asset.symbol.localeCompare(b.asset.symbol);
    }

    return 0;
  });

  const filteredCoinList = useMemo(() => {
    const filteredAssetsByChain = currentSelectedChain
      ? sortedAssets.filter((item) => currentSelectedChain?.id === item.chain.id && currentSelectedChain.chainId === item.chain.chainId) || []
      : sortedAssets || [];

    const filteredAssetsBySearch = (() => {
      if (search.length > 1) {
        return (
          filteredAssetsByChain.filter((asset) => {
            const condition = [asset.asset.symbol, asset.asset.id];

            return condition.some((item) => item.toLowerCase().indexOf(search.toLowerCase()) > -1);
          }) || []
        );
      }
      return filteredAssetsByChain;
    })();

    return filteredAssetsBySearch;
  }, [currentSelectedChain, search, sortedAssets]);

  return (
    <Container>
      <StickyContentsContainer>
        <FilterContaienr>
          <StyledInput
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            }
            placeholder={t('components.CoinSelect.index.searchPlaceholder')}
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
            }}
          />
          <FilterIconButton
            onClick={() => {
              setIsOpenSortBottomSheet(true);
            }}
          >
            <FilterSettingIcon />
          </FilterIconButton>
        </FilterContaienr>

        <AllNetworkButton
          sizeVariant="medium"
          typoVarient="b2_M"
          currentChainId={currentSelectedChainId}
          chainList={baseChainList}
          selectChainOption={(id) => {
            setCurrentSelectedChainId(id);
          }}
        />
      </StickyContentsContainer>

      <CoinButtonWrapper>
        {filteredCoinList?.map((coin) => (
          <CoinWithChainNameButton
            key={coin.asset.id.concat(coin.asset.chainId).concat(coin.asset.chainType)}
            baseAmount={coin.balance}
            symbol={coin.asset.symbol}
            chainName={coin.chain.name}
            assetId={coin.asset.id}
            decimals={coin.asset.decimals}
            coinGeckoId={coin.asset.coinGeckoId}
            displayAssetId={isShowAssetId}
            coinImageProps={{
              imageURL: coin.asset.image,
              badgeImageURL: coin.asset.type === 'native' ? '' : coin.chain.image || '',
            }}
            onClick={() => {
              onSelectCoin(getCoinId(coin.asset));
            }}
          />
        ))}
      </CoinButtonWrapper>

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
          setSortOption(sortOptionKey);
        }}
      />
    </Container>
  );
}
