import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';

import Aptos from './Aptos/entry';
import Cosmos from './Cosmos/entry';
import Ethereum from './Ethereum/entry';
import Sui from './Sui/entry';

export default function Entry() {
  const { currentChain } = useCurrentChain();

  if (currentChain.line === 'COSMOS') {
    return <Cosmos chain={currentChain} />;
  }

  if (currentChain.line === 'ETHEREUM') {
    return <Ethereum />;
  }

  if (currentChain.line === 'APTOS') {
    return <Aptos />;
  }

  if (currentChain.line === 'SUI') {
    return <Sui />;
  }

  return null;
}
