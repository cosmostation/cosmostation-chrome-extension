import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { getCoinId } from '@/utils/queryParamGenerator';

import Sui from './Sui';

type EntryProps = {
  coinId: string;
  txHash?: string;
  address?: string;
};

export default function Entry({ coinId, txHash, address }: EntryProps) {
  // NOTE 아예 코인을 찾아주는 훅을 만들어 버리자.
  const { data } = useAccountAllAssets();
  const currentCoin = data?.flatAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);

  //   if (currentCoin?.asset.chainType === 'cosmos') {
  //     return <Cosmos coinId={coinId} />;
  //   }

  //   if (currentCoin?.asset.chainType === 'evm') {
  //     return <EVM coinId={coinId} />;
  //   }

  if (currentCoin?.asset.chainType === 'sui') {
    return <Sui coinId={coinId} txHash={txHash} address={address} />;
  }

  //   if (currentCoin?.asset.chainType === 'aptos') {
  //     return <Aptos coinId={coinId} />;
  //   }

  //   if (currentCoin?.asset.chainType === 'bitcoin') {
  //     return <Cosmos coinId={coinId} />;
  //   }

  return null;
}
