import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';

import Cosmos from './Cosmos';
import Ethereum from './Ethereum';

export default function Entry() {
  const { currentChain } = useCurrentChain();

  if (currentChain.line === 'COSMOS') {
    return <Cosmos chain={currentChain} />;
  }

  if (currentChain.line === 'ETHEREUM') {
    return <Ethereum chain={currentChain} />;
  }

  return null;
}
