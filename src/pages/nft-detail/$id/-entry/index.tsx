import { useCurrentAccountAddedNFTsWithMetaData } from '@/hooks/useCurrentAccountAddedNFTsWithMetaData';

import Cosmos from './cosmos';

type EntryProps = {
  id: string;
};

export default function Entry({ id }: EntryProps) {
  const { currentAccountAddNFTsWithMeta } = useCurrentAccountAddedNFTsWithMetaData();

  const selectedNFT = currentAccountAddNFTsWithMeta.flat.find((nft) => nft.id === id);

  if (selectedNFT?.chainType === 'cosmos') {
    return <Cosmos id={id} />;
  }

  return null;
}
