import { useAccountAssets } from '@/hooks/useAccountAssets';
import { getCoinId } from '@/utils/queryParamGenerator';

import Aptos from './Aptos';
import Cosmos from './Cosmos';
import EVM from './EVM';
import Sui from './Sui';

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

  //   if (currentCoin?.asset.chainType === 'bitcoin') {
  //     return <Cosmos coinId={coinId} />;
  //   }

  return null;
}
