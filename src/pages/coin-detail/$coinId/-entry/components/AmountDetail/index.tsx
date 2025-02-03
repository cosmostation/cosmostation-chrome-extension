import { useAccountAssets } from '@/hooks/useAccountAssets';
import { getCoinId } from '@/utils/queryParamGenerator';

import Bitcoin from './Bitcoin';
import Cosmos from './Cosmos';
import Sui from './Sui';

type AmountDetailProps = {
  coinId: string;
};

export default function AmountDetail({ coinId }: AmountDetailProps) {
  const { data } = useAccountAssets();
  const currentCoin = data?.flatAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);

  if (currentCoin?.chain.chainType === 'cosmos') {
    const isStakeable = currentCoin?.chain.isSupportStaking && currentCoin.asset.id === currentCoin.chain.mainAssetDenom;

    if (isStakeable) {
      return <Cosmos coinId={coinId} />;
    }
  }

  if (currentCoin?.chain.chainType === 'sui') {
    return <Sui coinId={coinId} />;
  }

  if (currentCoin?.chain.chainType === 'bitcoin') {
    return <Bitcoin coinId={coinId} />;
  }

  return null;
}
