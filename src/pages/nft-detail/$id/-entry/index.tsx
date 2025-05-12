import { useCurrentAccountAddedNFTsWithMetaData } from '@/hooks/useCurrentAccountAddedNFTsWithMetaData';

import Cosmos from './cosmos';
import EVM from './evm';
import Iota from './iota';
import Sui from './sui';

type EntryProps = {
  id: string;
};

export default function Entry({ id }: EntryProps) {
  const { currentAccountAddNFTsWithMeta } = useCurrentAccountAddedNFTsWithMetaData();

  const selectedNFT = currentAccountAddNFTsWithMeta.flat.find((nft) => nft.id === id);

  if (selectedNFT?.chainType === 'cosmos') {
    return <Cosmos id={id} />;
  }
  if (selectedNFT?.chainType === 'sui') {
    return <Sui id={id} />;
  }
  if (selectedNFT?.chainType === 'evm') {
    return <EVM id={id} />;
  }
  if (selectedNFT?.chainType === 'iota') {
    return <Iota id={id} />;
  }

  return null;
}
