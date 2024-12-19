import { useAccountAssets } from '@/hooks/useAccountAssets';
import { getCoinId } from '@/utils/queryParamGenerator';

import Cosmos from './Cosmos';
import Sui from './Sui';

type StakeDetailBoxProps = {
  coinId: string;
};

export default function StakeDetailBox({ coinId }: StakeDetailBoxProps) {
  const { data } = useAccountAssets();
  const currentCoin = data?.flatAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);

  if (currentCoin?.asset.chainType === 'cosmos') {
    return <Cosmos coinId={coinId} />;
  }

  if (currentCoin?.asset.chainType === 'sui') {
    return <Sui coinId={coinId} />;
  }

  return null;
}
