import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';

import Cosmos from './Cosmos';
import Ethereum from './Ethereum';

type EntryProps = {
  isShowChain: boolean;
};

export default function Entry({ isShowChain }: EntryProps) {
  const { currentChain } = useCurrentChain();

  if (currentChain.line === 'COSMOS') {
    return <Cosmos chain={currentChain} isShowChain={isShowChain} />;
  }

  if (currentChain.line === 'ETHEREUM') {
    return <Ethereum chain={currentChain} isShowChain={isShowChain} />;
  }

  return null;
}
