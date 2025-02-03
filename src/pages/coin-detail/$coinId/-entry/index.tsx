import { useAccountAssets } from '@/hooks/useAccountAssets';
import { getCoinId } from '@/utils/queryParamGenerator';

import Aptos from './aptos';
import Cosmos from './cosmos';
import EVM from './evm';
import Sui from './sui';

type EntryProps = {
  coinId: string;
};

export default function Entry({ coinId }: EntryProps) {
  const { data } = useAccountAssets();
  const currentCoin = data?.flatAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);

  if (currentCoin?.asset.chainType === 'cosmos') {
    return <Cosmos coinId={coinId} />;
  }

  if (currentCoin?.asset.chainType === 'evm') {
    return <EVM coinId={coinId} />;
  }

  if (currentCoin?.asset.chainType === 'sui') {
    return <Sui coinId={coinId} />;
  }

  if (currentCoin?.asset.chainType === 'aptos') {
    return <Aptos coinId={coinId} />;
  }

  if (currentCoin?.asset.chainType === 'bitcoin') {
    return <Cosmos coinId={coinId} />;
  }

  return null;
}
