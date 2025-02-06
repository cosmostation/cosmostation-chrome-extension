import { useAccountAssets } from '@/hooks/useAccountAssets';
import { getCoinId } from '@/utils/queryParamGenerator';

import AptosAccountTxHistory from './components/Aptos';
import BitcoinAccountTxHistory from './components/Bitcoin';
import CosmosAccountTxHistory from './components/Cosmos';
import EVMAccountTxHistory from './components/EVM';
import SuiAccountTxHistory from './components/Sui';

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

  if (currentCoin?.asset.chainType === 'evm') {
    return <EVMAccountTxHistory coinId={coinId} />;
  }

  if (currentCoin?.asset.chainType === 'sui') {
    return <SuiAccountTxHistory coinId={coinId} />;
  }

  if (currentCoin?.asset.chainType === 'aptos') {
    return <AptosAccountTxHistory coinId={coinId} />;
  }

  if (currentCoin?.asset.chainType === 'bitcoin') {
    return <BitcoinAccountTxHistory coinId={coinId} />;
  }
}
