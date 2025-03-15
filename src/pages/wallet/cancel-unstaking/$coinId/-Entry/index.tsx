import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';

import Cosmos from './Cosmos';

type EntryProps = {
  coinId: string;
  validatorAddress: string;
  creationHeight: string;
  amount: string;
};

export default function Entry({ coinId, validatorAddress, creationHeight, amount }: EntryProps) {
  const { getAccountAsset } = useGetAccountAsset({ coinId });
  const currentCoin = getAccountAsset();

  if (currentCoin?.asset.chainType === 'cosmos') {
    return <Cosmos coinId={coinId} validatorAddress={validatorAddress} amount={amount} creationHeight={creationHeight} />;
  }

  return null;
}
