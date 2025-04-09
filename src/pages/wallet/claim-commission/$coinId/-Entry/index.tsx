import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';

import Cosmos from './Cosmos';

type EntryProps = {
  coinId: string;
};

export default function Entry({ coinId }: EntryProps) {
  const { getAccountAsset } = useGetAccountAsset({ coinId });
  const currentCoin = getAccountAsset();

  if (currentCoin?.asset.chainType === 'cosmos') {
    return <Cosmos coinId={coinId} />;
  }

  return null;
}
