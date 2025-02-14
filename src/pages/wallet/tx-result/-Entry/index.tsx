import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';

import EVM from './EVM';
import Sui from './Sui';

type EntryProps = {
  coinId: string;
  txHash?: string;
  address?: string;
};

export default function Entry({ coinId, txHash, address }: EntryProps) {
  const { getAccountAsset } = useGetAccountAsset({ coinId });

  const selectedAccountAsset = getAccountAsset();

  //   if (selectedAccountAsset?.asset.chainType === 'cosmos') {
  //     return <Cosmos coinId={coinId} />;
  //   }

  if (selectedAccountAsset?.asset.chainType === 'evm') {
    return <EVM coinId={coinId} txHash={txHash} address={address} />;
  }

  if (selectedAccountAsset?.asset.chainType === 'sui') {
    return <Sui coinId={coinId} txHash={txHash} address={address} />;
  }

  //   if (selectedAccountAsset?.asset.chainType === 'aptos') {
  //     return <Aptos coinId={coinId} />;
  //   }

  //   if (selectedAccountAsset?.asset.chainType === 'bitcoin') {
  //     return <Cosmos coinId={coinId} />;
  //   }

  return null;
}
