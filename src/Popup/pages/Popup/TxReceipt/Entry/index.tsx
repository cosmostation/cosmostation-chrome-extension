import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';

import Cosmos from './Cosmos/entry';
import Ethereum from './Ethereum/entry';

export default function Entry() {
  const { currentChain } = useCurrentChain();

  if (currentChain.line === 'COSMOS') {
    return <Cosmos chain={currentChain} />;
  }

  if (currentChain.line === 'ETHEREUM') {
    return <Ethereum />;
  }

  //   if (currentChain.line === 'ETHEREUM') {
  //     return <Ethereum chain={currentChain} />;
  //   }

  //   if (currentChain.line === 'SUI') {
  //     return <Sui />;
  //   }

  return null;
}
