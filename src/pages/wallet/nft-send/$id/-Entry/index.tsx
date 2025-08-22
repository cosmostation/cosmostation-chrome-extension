import { useMemo } from 'react';

import { useAutoBalanceRefresh } from '@/hooks/update/useAutoBalanceRefresh';
import { useCurrentAccountNFT } from '@/hooks/useCurrentAccountNFT';
import { getUniqueChainIdWithManual } from '@/utils/queryParamGenerator';

import Cosmos from './Cosmos';
import EVM from './EVM';
import Sui from './Sui';

type EntryProps = {
  id: string;
};

export default function Entry({ id }: EntryProps) {
  const { currentAccountNFTs } = useCurrentAccountNFT();

  const selectedNFT = currentAccountNFTs.flat.find((nft) => nft.id === id);
  const uniqueChainId = useMemo(
    () => (selectedNFT?.chainId && selectedNFT.chainType ? getUniqueChainIdWithManual(selectedNFT.chainId, selectedNFT.chainType) : undefined),
    [selectedNFT?.chainId, selectedNFT?.chainType],
  );

  useAutoBalanceRefresh(uniqueChainId && [uniqueChainId]);

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
