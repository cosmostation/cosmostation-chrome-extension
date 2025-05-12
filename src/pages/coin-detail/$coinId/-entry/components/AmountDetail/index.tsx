import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';

import Bitcoin from './Bitcoin';
import Cosmos from './Cosmos';
import Iota from './Iota';
import Sui from './Sui';

type AmountDetailProps = {
  coinId: string;
};

export default function AmountDetail({ coinId }: AmountDetailProps) {
  const { getAccountAsset } = useGetAccountAsset({ coinId });
  const currentCoin = getAccountAsset();

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

  if (currentCoin?.chain.chainType === 'iota') {
    return <Iota coinId={coinId} />;
  }

  return null;
}
