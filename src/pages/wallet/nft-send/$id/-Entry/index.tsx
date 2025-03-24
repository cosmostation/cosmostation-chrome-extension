import { useCurrentAccountAddedNFTsWithMetaData } from '@/hooks/useCurrentAccountAddedNFTsWithMetaData';

import Cosmos from './Cosmos';
import Sui from './Sui';

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

  return null;
}
