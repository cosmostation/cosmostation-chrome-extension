import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';

import Aptos from './aptos';
import Bitcoin from './bitcoin';
import Cosmos from './cosmos';
import EVM from './evm';
import Iota from './iota';
import Sui from './sui';

type EntryProps = {
  coinId: string;
};

export default function Entry({ coinId }: EntryProps) {
  const { getAccountAsset } = useGetAccountAsset({ coinId });

  const selectedAccountAsset = getAccountAsset();

  if (selectedAccountAsset?.asset.chainType === 'cosmos') {
    return <Cosmos coinId={coinId} />;
  }

  if (selectedAccountAsset?.asset.chainType === 'evm') {
    return <EVM coinId={coinId} />;
  }

  if (selectedAccountAsset?.asset.chainType === 'sui') {
    return <Sui coinId={coinId} />;
  }

  if (selectedAccountAsset?.asset.chainType === 'aptos') {
    return <Aptos coinId={coinId} />;
  }

  if (selectedAccountAsset?.asset.chainType === 'bitcoin') {
    return <Bitcoin coinId={coinId} />;
  }

  if (selectedAccountAsset?.asset.chainType === 'iota') {
    return <Iota coinId={coinId} />;
  }

  return null;
}
