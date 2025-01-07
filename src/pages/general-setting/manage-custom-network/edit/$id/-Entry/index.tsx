import { useCustomChain } from '@/hooks/useCustomChain';
import { useCustomChainParam } from '@/hooks/useCustomChainParam';
import { isMatchingUniqueChainId, isSameChain } from '@/utils/queryParamGenerator';

import Cosmos from './Cosmos';
import EVM from './EVM';

type EntryProps = {
  id: string;
};

export default function Entry({ id }: EntryProps) {
  const { data: managedCustomChains } = useCustomChainParam();
  const { addedCustomChainList } = useCustomChain();

  const userDefinedCustomChains = addedCustomChainList.filter((chain) => !managedCustomChains?.some((managedChain) => isSameChain(managedChain, chain)));

  const selectedChain = userDefinedCustomChains.find((chain) => isMatchingUniqueChainId(chain, id));

  if (selectedChain?.chainType === 'cosmos') {
    return <Cosmos id={id} />;
  }

  if (selectedChain?.chainType === 'evm') {
    return <EVM id={id} />;
  }

  return null;
}
