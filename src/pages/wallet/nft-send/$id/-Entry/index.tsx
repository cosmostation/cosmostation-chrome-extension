import { useCurrentAccountNFT } from '@/hooks/useCurrentAccountNFT';

import Cosmos from './Cosmos';
import EVM from './EVM';
import Sui from './Sui';

type EntryProps = {
  id: string;
};

export default function Entry({ id }: EntryProps) {
  const { currentAccountNFTs } = useCurrentAccountNFT();

  const selectedNFT = currentAccountNFTs.flat.find((nft) => nft.id === id);

  if (selectedNFT?.chainType === 'cosmos') {
    return <Cosmos id={id} />;
  }
  if (selectedNFT?.chainType === 'sui') {
    return <Sui id={id} />;
  }
  if (selectedNFT?.chainType === 'evm') {
    return <EVM id={id} />;
  }

  return null;
}
