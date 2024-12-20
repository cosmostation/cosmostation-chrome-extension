import { useAccountAssets } from '@/hooks/useAccountAssets';
import { getCoinId } from '@/utils/queryParamGenerator';

import Cosmos from './Cosmos';

type EntryProps = {
  coinId: string;
  validatorAddress: string;
};

export default function Entry({ coinId, validatorAddress }: EntryProps) {
  const { data } = useAccountAssets();
  const currentCoin = data?.flatAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);

  if (currentCoin?.asset.chainType === 'cosmos') {
    return <Cosmos coinId={coinId} validatorAddress={validatorAddress} />;
  }

  return null;
}
