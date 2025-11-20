import { useAutoBalanceRefresh } from '@/hooks/update/useAutoBalanceRefresh';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { getUniqueChainIdFromCoinId } from '@/utils/queryParamGenerator';

import Aptos from './Aptos';
import Bitcoin from './Bitcoin';
import Cosmos from './Cosmos';
import EVM from './EVM';
import Gno from './Gno';
import Iota from './Iota';
import Solana from './Solana';
import Sui from './Sui';

type EntryProps = {
  coinId: string;
};

export default function Entry({ coinId }: EntryProps) {
  useAutoBalanceRefresh([getUniqueChainIdFromCoinId(coinId)]);
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

  if (selectedAccountAsset?.asset.chainType === 'solana') {
    return <Solana coinId={coinId} />;
  }

  if (selectedAccountAsset?.asset.chainType === 'gno') {
    return <Gno coinId={coinId} />;
  }

  return null;
}
