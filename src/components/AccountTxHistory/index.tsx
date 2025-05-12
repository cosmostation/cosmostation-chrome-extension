import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';

import AptosAccountTxHistory from './components/Aptos';
import BitcoinAccountTxHistory from './components/Bitcoin';
import CosmosAccountTxHistory from './components/Cosmos';
import EVMAccountTxHistory from './components/EVM';
import IotaAccountTxHistory from './components/Iota';
import SuiAccountTxHistory from './components/Sui';

type AccountTxHistoryProps = {
  coinId?: string;
};

export default function AccountTxHistory({ coinId }: AccountTxHistoryProps) {
  const { getAccountAsset } = useGetAccountAsset({ coinId: coinId || '' });

  const currentCoin = getAccountAsset();

  if (!coinId) return null;

  if (currentCoin?.asset.chainType === 'cosmos' || (currentCoin?.chain.chainType === 'evm' && currentCoin.chain.isCosmos)) {
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

  if (currentCoin?.asset.chainType === 'iota') {
    return <IotaAccountTxHistory coinId={coinId} />;
  }
}
