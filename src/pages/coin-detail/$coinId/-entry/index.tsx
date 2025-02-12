import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';

import Aptos from './aptos';
import Bitcoin from './bitcoin';
import Cosmos from './cosmos';
import EVM from './evm';
import Sui from './sui';

type EntryProps = {
  coinId: string;
};

export default function Entry({ coinId }: EntryProps) {
  const currentAccountAsset = useGetAccountAsset({ coinId });

  if (currentAccountAsset?.asset.chainType === 'cosmos') {
    return <Cosmos coinId={coinId} />;
  }

  if (currentAccountAsset?.asset.chainType === 'evm') {
    return <EVM coinId={coinId} />;
  }

  if (currentAccountAsset?.asset.chainType === 'sui') {
    return <Sui coinId={coinId} />;
  }

  if (currentAccountAsset?.asset.chainType === 'aptos') {
    return <Aptos coinId={coinId} />;
  }

  if (currentAccountAsset?.asset.chainType === 'bitcoin') {
    return <Bitcoin coinId={coinId} />;
  }

  return null;
}
