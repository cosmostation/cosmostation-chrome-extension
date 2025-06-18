import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import CoinSelect from '@/components/CoinSelect';
import { useChainList } from '@/hooks/useChainList';
import { Route as Stake } from '@/pages/wallet/stake/$coinId';
import { removeDuplicates } from '@/utils/array';

export default function Entry() {
  const navigate = useNavigate();
  const { chainListFilteredByAccountType } = useChainList();

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
          chainList={dedupeFlatChainList}
        />
      </EdgeAligner>
    </BaseBody>
  );
}
