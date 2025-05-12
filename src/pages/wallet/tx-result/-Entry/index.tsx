import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';

import Aptos from './Aptos';
import Bitcoin from './Bitcoin';
import Cosmos from './Cosmos';
import EVM from './EVM';
import Iota from './Iota';
import Sui from './Sui';

type EntryProps = {
  coinId: string;
  txHash?: string;
  address?: string;
};

export default function Entry({ coinId, txHash, address }: EntryProps) {
  const { getAccountAsset } = useGetAccountAsset({ coinId });

  const selectedAccountAsset = getAccountAsset();

  if (selectedAccountAsset?.asset.chainType === 'cosmos') {
    return <Cosmos coinId={coinId} txHash={txHash} address={address} />;
  }

  if (selectedAccountAsset?.asset.chainType === 'evm') {
    return <EVM coinId={coinId} txHash={txHash} address={address} />;
  }

  if (selectedAccountAsset?.asset.chainType === 'sui') {
    return <Sui coinId={coinId} txHash={txHash} address={address} />;
  }

  if (selectedAccountAsset?.asset.chainType === 'aptos') {
    return <Aptos coinId={coinId} txHash={txHash} address={address} />;
  }

  if (selectedAccountAsset?.asset.chainType === 'bitcoin') {
    return <Bitcoin coinId={coinId} txHash={txHash} address={address} />;
  }

  if (selectedAccountAsset?.asset.chainType === 'iota') {
    return <Iota coinId={coinId} txHash={txHash} address={address} />;
  }

  return null;
}
