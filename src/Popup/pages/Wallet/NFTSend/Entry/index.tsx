import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';

import Ethereum from './Ethereum';
import Sui from './Sui';

export default function Entry() {
  const { currentChain } = useCurrentChain();

  if (currentChain.line === 'ETHEREUM') {
    return <Ethereum chain={currentChain} />;
  }

  if (currentChain.line === 'SUI') {
    return <Sui chain={currentChain} />;
  }

  return null;
}
