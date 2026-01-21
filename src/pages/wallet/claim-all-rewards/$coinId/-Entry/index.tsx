import { useAutoBalanceRefresh } from '@/hooks/update/useAutoBalanceRefresh';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { getUniqueChainIdFromCoinId } from '@/utils/queryParamGenerator';

import Cosmos from './Cosmos';

type EntryProps = {
  coinId: string;
};

export default function Entry({ coinId }: EntryProps) {
  useAutoBalanceRefresh([getUniqueChainIdFromCoinId(coinId)]);
  const { getAccountAsset } = useGetAccountAsset({ coinId });
  const currentCoin = getAccountAsset();

  if (currentCoin?.asset.chainType === 'cosmos') {
    return <Cosmos coinId={coinId} />;
  }

  return null;
}
