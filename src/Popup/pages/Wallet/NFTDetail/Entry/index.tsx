import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';

import Cosmos from './cosmos';
import Ethereum from './ethereum';
import Sui from './sui';

export default function Entry() {
  const { currentChain } = useCurrentChain();

  if (currentChain.line === 'COSMOS') {
    return <Cosmos chain={currentChain} />;
  }

  if (currentChain.line === 'ETHEREUM') {
    return <Ethereum chain={currentChain} />;
  }

  if (currentChain.line === 'SUI') {
    return <Sui />;
  }

  return null;
}
