import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';

import Cosmos from './Cosmos';
import Iota from './Iota';
import Sui from './Sui';

type EntryProps = {
  coinId: string;
  validatorAddress?: string;
};

export default function Entry({ coinId, validatorAddress }: EntryProps) {
  const { getAccountAsset } = useGetAccountAsset({ coinId });
  const currentCoin = getAccountAsset();

  if (currentCoin?.asset.chainType === 'cosmos') {
    return <Cosmos coinId={coinId} validatorAddress={validatorAddress} />;
  }

  if (currentCoin?.asset.chainType === 'sui') {
    return <Sui coinId={coinId} validatorAddress={validatorAddress} />;
  }

  if (currentCoin?.asset.chainType === 'iota') {
    return <Iota coinId={coinId} validatorAddress={validatorAddress} />;
  }

  return null;
}
