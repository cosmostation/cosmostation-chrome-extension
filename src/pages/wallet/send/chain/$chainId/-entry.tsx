import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import EthermintSendBottomSheet from '@/components/EthermintSendBottomSheet';
import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import { DASHBOARD_COIN_SORT_KEY } from '@/constants/sortKey';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useAssetPricing } from '@/hooks/useAssetPricing';
import { Route as Send } from '@/pages/wallet/send/$coinId';
import type { UniqueChainId } from '@/types/chain';
import type { CommonSortKeyType } from '@/types/sortKey';
import { removeDuplicates, sortByReference } from '@/utils/array';
import { getDefaultAssetsByChainId, getFilteredAssetsByChainId, getStakeableBalance, sortAssetsByKey } from '@/utils/asset';
import { getCoinId, isMatchingCoinId } from '@/utils/queryParamGenerator';
import { isEqualsIgnoringCase } from '@/utils/string';

import CoinSelectWithChainId from './-components/CoinSelectWithChainId';

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

  const [isOpenBottomSheet, setIsOpenBottomSheet] = useState(false);

  const [selectedEVMCoinId, setSelectedEVMCoinId] = useState('');
  const [selectedCosmosCoinId, setSelectedCosmosCoinId] = useState('');

  const [selectedCoinAccountPrefix, setSelectedCoinAccountPrefix] = useState('');
  const [sortOption, setSortOption] = useState<CommonSortKeyType>(DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER);

  const chainFilteredAllCoins = useMemo(
    () => getFilteredAssetsByChainId(filteredAccountAssets?.flatAccountAssets, chainId),
    [chainId, filteredAccountAssets?.flatAccountAssets],
  );
  const chainDefaultCoins = useMemo(
    () => getDefaultAssetsByChainId(filterOnlyDupeEthermintAccountAssets?.flatAccountAssets, chainId),
    [chainId, filterOnlyDupeEthermintAccountAssets?.flatAccountAssets],
  );

  const pricedChainAssets = useAssetPricing(chainFilteredAllCoins, {
    getBalance: getStakeableBalance,
  });

  const sortedAssets = useMemo(() => sortAssetsByKey(pricedChainAssets, sortOption), [pricedChainAssets, sortOption]);

  const pricedDefaultCoins = useAssetPricing(chainDefaultCoins, {
    getBalance: getStakeableBalance,
  });

  const mergedCoinList = useMemo(
    () =>
      sortByReference(
        removeDuplicates([...pricedDefaultCoins, ...sortedAssets], (a, b) => isEqualsIgnoringCase(a.asset.id, b.asset.id)),
        pricedDefaultCoins,
        (a, b) => isEqualsIgnoringCase(a.asset.id, b.asset.id),
      ),
    [pricedDefaultCoins, sortedAssets],
  );

  const handleOnClickCoin = useCallback(
    (coinId: string) => {
      const currentCoin = mergedCoinList.find(({ asset }) => isMatchingCoinId(asset, coinId));

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
    [notFilteredAccountAssets?.cosmosAccountAssets, mergedCoinList],
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
          coinList={mergedCoinList}
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
