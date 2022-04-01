import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';

import Ethereum from './Ethereum';
import Tendermint from './Tendermint';

export default function Entry() {
  const { currentChain } = useCurrentChain();

  if (currentChain.line === 'TENDERMINT') {
    return <Tendermint chain={currentChain} />;
  }

  if (currentChain.line === 'ETHEREUM') {
    return <Ethereum chain={currentChain} />;
  }

  return null;
}
