import { useAccountAssets } from '@/hooks/useAccountAssets';
import { getCoinId } from '@/utils/queryParamGenerator';

import CosmosAccountTxHistory from './components/Cosmos';

type AccountTxHistoryProps = {
  coinId?: string;
};

export default function AccountTxHistory({ coinId }: AccountTxHistoryProps) {
  const { data } = useAccountAssets();
  const currentCoin = data?.flatAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);

  // NOTE Full History
  if (!coinId) return null;

  if (currentCoin?.asset.chainType === 'cosmos') {
    return <CosmosAccountTxHistory coinId={coinId} />;
  }

  //   if (currentCoin?.asset.chainType === 'evm') {
  //     return <EVM coinId={coinId} />;
  //   }

  //   if (currentCoin?.asset.chainType === 'sui') {
  //     return <Sui coinId={coinId} />;
  //   }

  //   if (currentCoin?.asset.chainType === 'aptos') {
  //     return <Aptos coinId={coinId} />;
  //   }

  //   if (currentCoin?.asset.chainType === 'bitcoin') {
  //     return <Cosmos coinId={coinId} />;
  //   }
}
