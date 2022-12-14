import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';

import Aptos from './Aptos';
import Cosmos from './Cosmos';
import Ethereum from './Ethereum';
import Sui from './Sui';

export default function Entry() {
  const { currentChain } = useCurrentChain();

  if (currentChain.line === 'COSMOS') {
    return <Cosmos chain={currentChain} />;
  }

  if (currentChain.line === 'ETHEREUM') {
    return <Ethereum chain={currentChain} />;
  }

  if (currentChain.line === 'APTOS') {
    return <Aptos chain={currentChain} />;
  }

  if (currentChain.line === 'SUI') {
    return <Sui chain={currentChain} />;
  }

  return null;
}
