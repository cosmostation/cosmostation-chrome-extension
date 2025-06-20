import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import EthermintSendBottomSheet from '@/components/EthermintSendBottomSheet';
import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import { DASHBOARD_COIN_SORT_KEY } from '@/constants/sortKey';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { Route as Send } from '@/pages/wallet/send/$coinId';
import type { FlatAccountAssets } from '@/types/accountAssets';
import type { UniqueChainId } from '@/types/chain';
import type { CommonSortKeyType } from '@/types/sortKey';
import { getDefaultAssets, getFilteredAssetsByChainId, isStakeableAsset } from '@/utils/asset';
import { minus, times, toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId, isMatchingCoinId } from '@/utils/queryParamGenerator';
import { isEqualsIgnoringCase } from '@/utils/string';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import CoinSelectWithChainId from './-components/CoinSelectWithChainId';

type CoinSelectItem = FlatAccountAssets & {
  value: string;
};

type EntryProps = {
  chainId: UniqueChainId;
};

export default function Entry({ chainId }: EntryProps) {
  const navigate = useNavigate();

  const { data: filteredAccountAssets } = useAccountAllAssets({
    disableBalanceFilter: false,
    disableHiddenFilter: false,
    filterByPreferAccountType: true,
  });

  const { data: filterOnlyDupeEthermintAccountAssets } = useAccountAllAssets({ filterByPreferAccountType: true });

  const { data: notFilteredAccountAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });

  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const userCurrencyPreference = useExtensionStorageStore((state) => state.userCurrencyPreference);
  const [isOpenBottomSheet, setIsOpenBottomSheet] = useState(false);

  const [selectedEVMCoinId, setSelectedEVMCoinId] = useState('');
  const [selectedCosmosCoinId, setSelectedCosmosCoinId] = useState('');

  const [selectedCoinAccountPrefix, setSelectedCoinAccountPrefix] = useState('');
  const [sortOption, setSortOption] = useState<CommonSortKeyType>(DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER);

  const chainFilteredAllCoins = getFilteredAssetsByChainId(filteredAccountAssets?.flatAccountAssets, chainId);

  const chainDefaultCoins = useMemo<CoinSelectItem[] | undefined>(() => {
    const chainFilteredCoins = getFilteredAssetsByChainId(filterOnlyDupeEthermintAccountAssets?.flatAccountAssets, chainId);

    const chainDefaultCoins = getDefaultAssets(chainFilteredCoins)
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

      const value = times(totalDisplayAmount, coinPrice);
      return {
        ...item,
        totalDisplayAmount,
        value,
      };
    });
  }, [filterOnlyDupeEthermintAccountAssets?.flatAccountAssets, chainId, coinGeckoPrice, userCurrencyPreference]);

  const computedAssetValues = useMemo<CoinSelectItem[]>(() => {
    return (
      chainFilteredAllCoins?.map((item) => {
        const balance = isStakeableAsset(item) ? item.totalBalance || item.balance || '0' : item.balance;

        const displayAmount = toDisplayDenomAmount(balance, item.asset.decimals);

        const chainPrice = (item.asset.coinGeckoId && coinGeckoPrice?.[item.asset.coinGeckoId]?.[userCurrencyPreference]) || 0;

        const value = times(displayAmount, chainPrice);

        return {
          ...item,
          value,
        };
      }) || []
    );
  }, [chainFilteredAllCoins, coinGeckoPrice, userCurrencyPreference]);

  const sortedAssets = useMemo(() => {
    const sortedValues = [...computedAssetValues].sort((a, b) => {
      if (sortOption === DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER) {
        return Number(minus(b.value, a.value));
      }

      if (sortOption === DASHBOARD_COIN_SORT_KEY.ALPHABETICAL_ASC) {
        return a.asset.symbol.localeCompare(b.asset.symbol);
      }

      return 0;
    });

    return sortedValues;
  }, [computedAssetValues, sortOption]);

  const filteredAssetsBySearch = useMemo(() => {
    return [...(chainDefaultCoins || []), ...sortedAssets].reduce((acc: CoinSelectItem[], item) => {
      if (!acc.some((existing) => isEqualsIgnoringCase(existing.asset.id, item.asset.id))) {
        acc.push(item as CoinSelectItem);
      }
      return acc;
    }, []);
  }, [chainDefaultCoins, sortedAssets]);

  const handleOnClickCoin = useCallback(
    (coinId: string) => {
      const currentCoin = filteredAssetsBySearch.find(({ asset }) => isMatchingCoinId(asset, coinId));

      const cosmosStyleEthermintCoin = (() => {
        const isEthermint = currentCoin?.chain.chainType === 'evm' && currentCoin.chain.isCosmos;

        const isMainCoin = isEqualsIgnoringCase(currentCoin?.asset.id, NATIVE_EVM_COIN_ADDRESS);

        if (isEthermint && isMainCoin) {
          return notFilteredAccountAssets?.cosmosAccountAssets.find(
            (item) =>
              item.asset.id === currentCoin.chain.mainAssetDenom &&
              item.chain.id === currentCoin.chain.id &&
              item.address.chainId === currentCoin.address.chainId &&
              item.address.accountType.hdPath === currentCoin.address.accountType.hdPath,
          );
        }

        return undefined;
      })();

      if (cosmosStyleEthermintCoin) {
        setSelectedEVMCoinId(coinId);
        setSelectedCosmosCoinId(getCoinId(cosmosStyleEthermintCoin.asset));

        setSelectedCoinAccountPrefix(cosmosStyleEthermintCoin.chain.accountPrefix + 1);
        setIsOpenBottomSheet(true);
      } else {
        navigate({
          to: Send.to,
          params: {
            coinId,
          },
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notFilteredAccountAssets?.cosmosAccountAssets, filteredAssetsBySearch],
  );

  const hanldeOnEthermintSend = useCallback(
    (val: 'cosmos' | 'evm') => {
      if (val === 'cosmos') {
        if (selectedCosmosCoinId) {
          navigate({
            to: Send.to,
            params: { coinId: selectedCosmosCoinId },
          });
        }
      } else if (selectedEVMCoinId) {
        navigate({
          to: Send.to,
          params: { coinId: selectedEVMCoinId },
        });
      }
    },
    [navigate, selectedCosmosCoinId, selectedEVMCoinId],
  );

  return (
    <BaseBody>
      <EdgeAligner>
        <CoinSelectWithChainId
          chainId={chainId}
          coinList={filteredAssetsBySearch}
          sortOption={sortOption}
          onSelectCoin={handleOnClickCoin}
          onSelectSortOption={(newSortOption) => {
            setSortOption(newSortOption);
          }}
        />
      </EdgeAligner>
      <EthermintSendBottomSheet
        open={isOpenBottomSheet}
        onClose={() => setIsOpenBottomSheet(false)}
        bech32AddressPrefix={selectedCoinAccountPrefix}
        onSelectOption={hanldeOnEthermintSend}
      />
    </BaseBody>
  );
}
