import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import CoinSelect from '@/components/CoinSelect';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useChainList } from '@/hooks/useChainList';
import { Route as Stake } from '@/pages/wallet/stake/$coinId';
import { removeDuplicates } from '@/utils/array';
import { isEqualsIgnoringCase } from '@/utils/string';

export default function Entry() {
  const navigate = useNavigate();
  const { chainListFilteredByAccountType } = useChainList();
  const { data } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });

  const flatChainList = useMemo(
    () =>
      chainListFilteredByAccountType
        ? [
            ...(chainListFilteredByAccountType.allCosmosChains || []),
            ...(chainListFilteredByAccountType.allEVMChains || []),
            ...(chainListFilteredByAccountType.aptosChains || []),
            ...(chainListFilteredByAccountType.suiChains || []),
            ...(chainListFilteredByAccountType.bitcoinChains || []),
            ...(chainListFilteredByAccountType.iotaChains || []),
          ].sort((a, b) => a.name.localeCompare(b.name))
        : [],
    [chainListFilteredByAccountType],
  );

  const dedupeFlatChainList = removeDuplicates(flatChainList, (a, b) => a.id === b.id);

  const stakingCoinList = useMemo(
    () =>
      data?.flatAccountAssets.filter((item) => {
        const isCosmosStakingChain =
          item.chain.chainType === 'cosmos' && item.chain.isSupportStaking && isEqualsIgnoringCase(item.asset.id, item.chain.mainAssetDenom);
        const isSuiStakingChain = item.chain.chainType === 'sui' && isEqualsIgnoringCase(item.asset.id, item.chain.mainAssetDenom || '');
        const isIotaStakingChain = item.chain.chainType === 'iota' && isEqualsIgnoringCase(item.asset.id, item.chain.mainAssetDenom || '');

        return isCosmosStakingChain || isSuiStakingChain || isIotaStakingChain;
      }),
    [data?.flatAccountAssets],
  );

  return (
    <BaseBody>
      <EdgeAligner
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <CoinSelect
          variant="stake"
          onSelectCoin={(coinId) => {
            navigate({
              to: Stake.to,
              params: {
                coinId,
              },
            });
          }}
          coinList={stakingCoinList}
          chainList={dedupeFlatChainList}
        />
      </EdgeAligner>
    </BaseBody>
  );
}
